var keystone = require('keystone');
var async = require('async');
//var nodemailer = require('nodemailer');
var Message = keystone.list('ContactMessage');

var notifyByEmail = function (mailOptions, callback) {
	/*// Prepare nodemailer transport object
	var transport = nodemailer.createTransport(keystone.get('smtp nodemailer'));
	
	//send the email
	return transport.sendMail(mailOptions, function (err, res) {
		//close transport
		transport.close();
		callback(err, res);
	});*/
};


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'Contacto';
	locals.isContactSection = true;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.messageSubmitted = false;

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
		});
	});

	// On POST requests, add the ContactMessage item to the database
	view.on('post', function (next) {
		var newMessage = new Message.model();
		var updater = newMessage.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, type, subject, message',
			errorMessage: 'Existe un error con la información de contacto enviada:'
		}, 
		function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} 
			else {
				locals.messageSubmitted = true;

				var mailData = {
					from: req.body.name + ' <' + req.body.email + '>',
					to: keystone.get('admin email'),
					subject: 'Mensaje de contacto: ' + req.body.subject,
					text: String(req.body.message).trim()
				};
				
				notifyByEmail(mailData, function (err, res) {
					if (err) {
						console.log('Message not delivered', err);
					} 
					else {
						console.log('Message delivered', res);
					}
				});
			}
			
			next();
		});

	});

	view.render('contact');
};
