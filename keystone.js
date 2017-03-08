// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');
var handlebars = require('express-handlebars');
var uuid = require('node-uuid');
var nconf = require('nconf');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

// load configurations
nconf.argv().env().file({file: './config.json'});

// Mongo DB configurations
var mongoURI = 'mongodb://';
var host = nconf.get('mongodb:host') || '127.0.0.1';
var post = nconf.get('mongodb:post') || '27017';
var user = nconf.get('mongodb:user');
var password = nconf.get('mongodb:password');
var database = nconf.get('mongodb:database') || 'graccs_good';

if (user && password) {
	mongoURI += user + ':' + password + '@';
}

mongoURI += host + ':' + post + '/' + database;
var dashes = '------------------------------------------------\n';
console.log('\nMongoDB connection string:', mongoURI);
console.log(dashes);

keystone.init({
	'name': 'GRACCS',
	'brand': 'GRACCS',
	'appversion': '1.0.0',
	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'hbs',
	'logger': ':method :url :status :response-time ms - :res[content-length]',
	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'default',
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs'
	}).engine,
	// Enable HTTP compression
	'compress': true,
	'auto update': true,
	// Database and User Auth Options
	'auth': true,
	'session': true,
	'mongo': mongoURI/*process.env.MONGO_URI || mongoURI*/,
	'session store': 'mongo',
	'user model': 'User',
	'cookie secret': process.env.COOKIE_SECRET || uuid.v4(),
	// Admin UI Options
	'wysiwyg images': true,
	'emails': 'templates/views/emails'
});

var dashes = '------------------------------------------------\n';
console.log('\n Init OK');
console.log(dashes);

// Load your project's Models
keystone.import('models');

console.log('Import Models OK');
console.log(dashes);

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
var transportOpt = {
	host: nconf.get('nodemailer:host'),
	port: nconf.get('nodemailer:port'),
	auth: {
		user: nconf.get('nodemailer:user'),
		pass: nconf.get('nodemailer:password')
	},
	secureConnection: nconf.get('nodemailer:secureConnection')
};

// Nodemailer configuration
keystone.set('admin email', nconf.get('admin:email'));
keystone.set('smtp nodemailer', transportOpt);
keystone.set('recaptcha', nconf.get('recaptcha'));

console.log('Recaptcha OK');
console.log(dashes);

// Load Google Maps configuration
/*if (nconf.get('google-maps:googleAPIKey') && nconf.get('google-maps:googleServerAPIKey')) {
	keystone.set('google api key', nconf.get('google-maps:googleAPIKey'));
	keystone.set('google server api key', nconf.get('google-maps:googleServerAPIKey'));
	keystone.set('default region', nconf.get('google-maps:defaultRegion'));
}*/

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

console.log('Set Locals OK');
console.log(dashes);

// Load your project's Routes
keystone.set('routes', require('./routes'));
console.log('Routes OK');
console.log(dashes);

// Switch Keystone Email defaults to handlebars
//keystone.Email.defaults.templateExt = 'hbs';
//keystone.Email.defaults.templateEngine = require('handlebars');


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	'información general': ['GeneralInformation', 'external-links', 'contact-messages'],
	'desagregaciones': ['national-areas', 'departmental-areas', 'municipal-areas', 'community-areas'],
	'indicadores': ['indicators', 'indicator-values', 'indicator-sectors', 'indicator-comments'],
	'noticias': ['posts', 'post-categories', 'post-comments'],
	'usuarios': ['users']
});

console.log('Nav OK');
console.log(dashes);

try {
	// Start Keystone to connect to your database and initialise the web server
	keystone.start();
	
	console.log('Start OK');
	console.log(dashes);
}
catch (e) {
	console.log('Error starting keystone', e);
}


