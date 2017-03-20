var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Buscar';
	locals.isSearchSection = true;
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	locals.q = req.params.q;
	
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

	// load template data
	view.on('init', function (next) {
			var page = parseInt(req.query.page) || 1;
			var total = 0, totalPages = 1;
			var perCollection = 3, perPage = 5;
			var skipNumOfDocs = (page - 1) * perCollection;//page > 1 ? page * perCollection : 0;
			var searchResults = [];
	
			async.parallel([
				function (callback) {
					var query = {$text: {$search: req.query.q, $language: "es"}};
					var score = {score: {$meta: "textScore"}};
					
					// search news 
					var q = keystone.list('Post').model.find(query, score)
						.where('state', 'published')
						.sort({score: {$meta: 'textScore'}})
						.skip(skipNumOfDocs)
						.limit(perCollection);
		
					q.exec(function (err, results) {
						if (!err && results) {
							// Load the comments count for each post
							async.each(results,
								function (post, callback) {
									keystone.list('PostComment').model.count().where('post', post.id).exec(function (err, count) {
										post.commentsCount = count;
										callback(err);
									});
								},
								function (err) {
									// set result type, heading, url and append result to searchResults
									for (var i = 0; i < results.length; i++) {
										var obj = results[i];
										obj.type = 'post';
										obj.heading = 'Noticia';
										obj.baseURL = '/noticia/';

										searchResults.push(obj);
									}

									callback(err);
								}
							);	
						}
						else {
							callback(err);
						}
					});
				}, 
				function (callback) {
					var query = {$text: {$search: req.params.q, $language: "es"}};
					
					// count search posts 
					var q = keystone.list('Post').model.count(query).where('state', 'published');
		
					q.exec(function (err, count) {
						if (!err && count) {
							total += count;
							callback(err);
						}
						else {
							callback(err);
						}
					});
				}, 
				function (callback) {
					// search indicators
					var query = {$text: {$search: req.query.q, $language: "es"}};
					var score = {score: {$meta: "textScore"}};
					
					// search indicators 
					var q = keystone.list('Indicator').model.find(query, score)
						.where('state', 'published')
						.sort({score: {$meta: 'textScore'}})
						.populate('category sector')
						.skip(skipNumOfDocs)
						.limit(perCollection);
		
					q.exec(function (err, results) {
						if (!err && results) {
							// Load the comments count for each indicator
							async.each(results,
								function (indicator, callback) {
									keystone.list('IndicatorComment').model.count().where('indicator', indicator.id).exec(function (err, count) {
										indicator.commentsCount = count;
										callback(err);
									});
								},
								function (err) {
									// set result type, heading, url and append result to searchResults
									for (var i = 0; i < results.length; i++) {
										var obj = results[i];
										obj.type = 'indicator';
										obj.heading = 'Indicador';
										obj.baseURL = '/indicador/';
										searchResults.push(obj);
									}

									callback(err);
								}
							);
						}
						else {
							callback(err);
						}
					});
				}, 
				function (callback) {
					var query = {$text: {$search: req.query.q, $language: "es"}};
					// count search indicators 
					var q = keystone.list('Indicator').model.count(query).where('state', 'published');
		
					q.exec(function (err, count) {
						if (!err && count) {
							total += count;
							callback(err);
						}
						else {
							callback(err);
						}
					});
				}], 
				function (err) {
					// sort all results by score desc
					searchResults = _.sortBy(searchResults, function (item) {
						return -1 * item.toJSON().score;
					});
					
					var totalPages = Math.ceil(total / perPage) || totalPages;
					var pages = [];
					
					for (var i = 0; i < totalPages; i++) {
						pages[i] = i + 1;
					}
	
					locals.paginator = {
						pages: pages,
						total: total,
						currentPage: page,
						totalPages: totalPages
					};
						
					locals.searchResults = searchResults;
					console.log(locals.paginator);
					console.log(skipNumOfDocs);

					next(err);
				}
			);
		});

	// Render the view
	view.render('search');
};
