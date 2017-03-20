var async = require('async');
var keystone = require('keystone');
var moment = require('moment');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Noticias';
	locals.hashero = true;
	locals.isNewsSection = true;
	locals.currentNewsFilter = 'mensual';//Este mes

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
				}],
			function (err) {
				next(err);
			}
		);
	});

	//load all posts of a page
	view.on('init', function (next) {
		// Get news 
		var q = keystone.list('Post').paginate({
				page: req.query.page || 1,
				perPage: 5,
				maxPages: 5
			})
			.where('state', 'published')
			.where('publishedDate').gte(moment().startOf('month').toDate())
			.where('publishedDate').lte(moment().endOf('month').toDate())
			.sort('-publishedDate');

		q.exec(function (err, results) {
			if (!err && results) {
				locals.posts = results;

				// Load the comments count for each post
				async.each(locals.posts.results,
					function (post, callback) {
						keystone.list('PostComment').model.count().where('post', post.id).exec(function (err, count) {
							post.commentsCount = count;
							callback(err);
						});
					},
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

	// Render the view
	view.render('posts');
};



/*var async = require('async');
var keystone = require('keystone');
var moment = require('moment');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Indicadores';
	locals.isIndicatorsSection = true;
	locals.hashero = true;
	locals.hassidebar = true;

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
		var sector_query = keystone.list('IndicatorSector').model.findOne().sort('name');

		sector_query.exec(function (err, sector) {
			if (!err && sector) {
				locals.currentIndicatorsFilter = sector._id;

				// Get indicators 
				var q = keystone.list('Indicator').paginate({
						page: req.query.page || 1,
						perPage: 3,
						maxPages: 5
					})
					.where('sector', locals.currentIndicatorsFilter)
					.where('state', 'published')
					.sort('createdAt');

				q.exec(function (err, indicators) {
					if (!err && indicators) {
						locals.indicators = indicators;

						// Load the comments count for each indicator
						async.each(locals.indicators.results,
							function (indicator, callback) {
								keystone.list('IndicatorComment').model.count().where('indicator', indicator._id).exec(function (err, count) {
									indicator.commentsCount = count;
									callback(err);
								});
							},
							function (err) {
								next(err);
							}
						);
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
	
	// Render the view
	view.render('index');
};
*/
