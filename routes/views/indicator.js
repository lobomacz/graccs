var async = require('async');
var keystone = require('keystone');
var Recaptcha = require('recaptcha').Recaptcha;

var IndicatorComment = keystone.list('IndicatorComment');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Indicadores';
	locals.isIndicatorsSection = true;
	locals.isIndicatorDetailsSection = true;
	locals.hassidebar = true;
	locals.filters = {
		name: req.params.name
	};
	
	// laod recaptcha configuration
	var config = keystone.get('recaptcha');
	var recaptcha = new Recaptcha(config.publicKey, config.privateKey);
	locals.captcha = recaptcha.toHTML();

	// load master
	view.on('init', function (next) {
		async.parallel([
			function (callback) {
				// Get general info
				var q = keystone.list('GeneralInformation').model.findOne().sort('createdAt');
	
				q.exec(function (err, results) {
					locals.generalInfo = results;
					callback(err);
				});
			},
			function (callback) {
				// Get external links
				var q = keystone.list('ExternalLink').model.find().where('state', 'published').sort('createdAt');

				q.exec(function (err, results) {
					locals.links = results;
					callback(err);
				});
			},
			function (callback) {
				// Get sectors of the indicators
				var q = keystone.list('IndicatorSector').model.find().sort('name');

				q.exec(function (err, results) {
					locals.indSector = results;
					callback(err);
				});
			},
			function (callback) {
				// Get departmental areas
				var q = keystone.list('DepartmentalArea').model.find().sort('position name');

				q.exec(function (err, results) {
					locals.deparmentalAreas = results;
					callback(err);
				});
			}],
			function (err) {
				next(err);
			}
		);
	});

	// load template data
	view.on('init', function (next) {		
		// Get indicator by slug key
		var q = keystone.list('Indicator').model.findOne({
			slug: locals.filters.name,
			state: 'published'
		}).populate('comments sector');

		q.exec(function (err, indicator) {
			if (!err && indicator) {
				locals.indicator = indicator;
				
				if (indicator.minAreaToApply === 'community') locals.indicator.areaNumber = 3;
				else if (indicator.minAreaToApply === 'municipal') locals.indicator.areaNumber = 2;
				else locals.indicator.areaNumber = 1;

				async.parallel([
					function (callback) {
						var q_comment = keystone.list('IndicatorComment').model.find()
							.where('indicator', indicator._id)
							.sort('createdAt');

						q_comment.exec(function (err, comments) {
							if (!err && comments) {
								locals.indicator.comments = comments;
								locals.indicator.commentsCount = comments.length;

								callback(err);
							}
							else {
								callback(err);
							}
						});
					},
					function (callback) {
						var q_value;

						switch (indicator.minAreaToApply) {
							case 'department':
								q_value = keystone.list('IndicatorValue').model.find()
									.where('indicator', indicator._id)
									.where('isDepartmentArea', true)
									.where('state', 'published')
									.sort('-startYear')
									.populate('departmentArea');
								break;
							case 'municipal':
								q_value = keystone.list('IndicatorValue').model.find()
									.where('indicator', indicator._id)
									.where('isMunicipalArea', true)
									.where('state', 'published')
									.sort('-startYear')
									.populate('municipalArea');
								break;
							case 'community':
								q_value = keystone.list('IndicatorValue').model.find()
									.where('indicator', indicator._id)
									.where('isCommunityArea', true)
									.where('state', 'published')
									.sort('-startYear')
									.populate('communityArea');
								break;
						}

						q_value.exec(function (err, values) {
							if (!err && values) {
								locals.indicator.point = values[0];
								var years = [];

								async.each(values,
									function(indicator_value, callback) {
										if(years.indexOf(indicator_value.startYear) === -1)  {
											years.push(indicator_value.startYear);
										}
										
										callback(err);
									},
									function(err) {
										locals.indicator.years = [];

										if (years && years.length > 0) {
											for (var i = 0; i < years.length; i++) {
												locals.indicator.years.push({ year: years[i]});
											}
										}
										
										callback(err);
									}
								);
							}
							else {
								callback(err);
							}
						});
					}],
					function (err) {
						next(err);
					}
				);
			}
			else {
				next(err);
			}
		});
	});
	
	// Indicator comment
	view.on('post', {action: 'create-comment'}, function (next) {
		
		// recaptcha form data
		var data = {
			remoteip: req.connection.remoteAddress,
			challenge: req.body.recaptcha_challenge_field,
			response: req.body.recaptcha_response_field
		};
		
		// init recaptcha with data
		recaptcha = new Recaptcha(config.publicKey, config.privateKey, data);
		// validate captcha
		recaptcha.verify(function (success, err) {
			if (success) {
				// Handle form create comment
				var newIndicatorComment = new IndicatorComment.model();
				var updater = newIndicatorComment.getUpdateHandler(req);

				updater.process(req.body, {
						flashErrors: true,
						logErrors: true,
						fields: 'indicator, author, email, content',
						errorMessage: 'Existe un error con la información del comentario enviado:'
					}, 
					function (err) {
						if (err) {
							locals.validationErrors = err.errors;
						} 
						else {
							var msg = {
								detail: 'Su comentario ha sido publicado satisfactoriamente.'
							};
							
							req.flash('success', msg);
							return res.redirect('/indicador/' + req.params.name);
						}
						
						next();
					}
				);
			} 
			else {
				console.log('Recaptcha validadion error', err);
				var msg = { detail: 'Su comentario no se ha podido publicar. Captcha no válido.' };
				req.flash('error', msg);
				
				return res.redirect('/indicador/' + req.params.name);
			}
		});
	});

	// Render the view
	view.render('indicator');
};
