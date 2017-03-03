var async = require('async');
var keystone = require('keystone');
var moment = require('moment');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var filter = req.params.filter;
	var classification = req.params.classification;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Indicadores';
	locals.isIndicatorsSection = true;
	locals.currentIndicatorsFilter = filter;
	locals.currentIndicatorsClassification = classification;

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
			});
	});

	// filtered posts related of a page
	view.on('init', function (next) {

		var q = keystone.list('Indicator').paginate({
				page: req.query.page || 1,
				perPage: 3,
				maxPages: 5
			})
			.where('state', 'published')
			.where('sector', filter)
			.where('classification', classification)
			.sort('createdAt');

		q.exec(function (err, indicators) {
			if (!err && indicators) {
				locals.indicators = indicators;

				if (indicators) {
					// Load the comments count for each indicator
					async.each(locals.indicators.results, 
						function (indicator, callback) {
							keystone.list('IndicatorComment').model.count().where('indicator', indicator.id).exec(function (err, count) {
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
			}
			else {
				next(err);
			}
		});
	});

	// Render the view
	view.render('indicators_filter_classification');
};
