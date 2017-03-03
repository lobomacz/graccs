var async = require('async');
var keystone = require('keystone');
var Recaptcha = require('recaptcha').Recaptcha;
var nconf = require('nconf');

var PostComment = keystone.list('PostComment');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var config = keystone.get('recaptcha');
	var recaptcha = new Recaptcha(config.publicKey, config.privateKey);
	
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'Noticias';
	locals.isNewsDetailsSection = true;
	locals.isNewsSection = true;
	locals.captcha = recaptcha.toHTML();
	locals.filters = { name: req.params.name };
	
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
		// Get post by name
		var q = keystone.list('Post').model.findOne({
			slug: locals.filters.name,
			state: 'published'
		}).populate('comments categories');

		q.exec(function (err, post) {
			if (!err && post) {
				locals.post = post;

				async.parallel([
					function (callback) {
						// Get comments
						keystone.list('PostComment').model.find().where('post', post.id).limit(5).sort('-createdAt').exec(function (err, comments) {
							locals.post.comments = comments;
							locals.post.commentsCount = comments.length;

							callback(err);
						});
					},
					function (callback) {
						// Get recent news 
						var q = keystone.list('Post').model.find()
							.where('state', 'published')
							.where('slug').ne(locals.filters.name)
							.sort('-publishedDate -rating.value').limit(3);

						q.exec(function (err, results) {
							if (!err && results) {
								locals.lastNews = results;

								// Load the comments count for each post
								async.each(results, 
									function (item, callback) {
										keystone.list('PostComment').model.count().where('post', item.id).exec(function (err, count) {
											item.commentsCount = count;
											callback(err);
										});
									},
									function(err) {
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
						// Get related news by categories
						var q = keystone.list('Post').model.find()
							.where('categories').in(post.categories)
							.where('state', 'published')
							.where('slug').ne(locals.filters.name)
							.sort('-publishedDate -rating.value').limit(3);

						q.exec(function (err, results) {
							if (!err && results) {
								locals.relatedNews = results;

								// Load the comments count for each post
								async.each(locals.relatedNews, 
									function (item, callback) {
										keystone.list('PostComment').model.count().where('post', item.id).exec(function (err, count) {
											item.commentsCount = count;
											callback(err);
										});
									},
									function (err) {
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

	// Post comment
	view.on('post', {action: 'create-comment'}, function (next) {
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
				var newPostComment = new PostComment.model();
				var updater = newPostComment.getUpdateHandler(req);

				updater.process(req.body, {
					flashErrors: true,
					logErrors: true,
					fields: 'post, author, email, content',
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
						return res.redirect('/noticia/' + req.params.name);
					}
					
					next();
				});
			} 
			else {
				console.log('Recaptcha validadion error', err);
				var msg = {
					detail: 'Su comentario no se ha podido publicar. Captcha no válido.'
				};
				
				req.flash('error', msg);
				
				return res.redirect('/noticia/' + req.params.name);
			}
		});
	});
	
	// Render the view
	view.render('post');
};
