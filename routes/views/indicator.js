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
		}).populate('comments');

		q.exec(function (err, indicator) {
			if (!err && indicator) {
				locals.indicator = indicator;
				
				var q = keystone.list('IndicatorComment').model.find()
					.where('indicator', indicator._id)
					.sort('createdAt');

				q.exec(function (err, comments) {
					if (!err && comments) {
						locals.indicator.comments = comments;
						locals.indicator.commentsCount = comments.length;

						next(err);
					}
					else {
						next(err);
					}
				});
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
