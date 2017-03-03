var async = require('async');
var keystone = require('keystone');
var moment = require('moment');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Noticias';
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
