/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views')
};

// Setup Route Bindings
exports = module.exports = function (app) {

	// Views
	app.get('/', routes.views.index);
	app.get('/indicadores', routes.views.indicators);
	app.get('/indicadores/:filter', routes.views.indicators_filter);
	app.get('/indicadores/:filter/:classification', routes.views.indicators_filter_classification);
	app.all('/indicador/:name', routes.views.indicator);
	app.get('/noticias', routes.views.posts);
	app.get('/noticias-filtradas/:filter', routes.views.posts_filter);
	app.all('/noticia/:name', routes.views.post);
	app.get('/buscar', routes.views.search);

	// Votes
	app.post('/post-comment/:id/vote', middleware.requireUser, routes.views.post_comment_vote);
	app.post('/indicator-comment/:id', middleware.requireUser, routes.views.indicator_comment_vote);

	// Rating
	app.post('/post-rating', routes.views.post_rating);
	app.post('/indicator-rating', routes.views.indicator_rating);
	
	// Ajax calls
	app.get('/get-areas', routes.views.get_areas);
	app.get('/get-points', routes.views.get_points);
	app.get('/get-points-two', routes.views.get_points_two);
	app.get('/get-points-by-department', routes.views.get_points_by_department);
	app.get('/get-points-by-department-without-municipality', routes.views.get_points_by_department_without_municipality);
	app.get('/get-points-by-municipality', routes.views.get_points_by_municipality);
	app.get('/get-points-by-parent', routes.views.get_points_by_parent);
	app.get('/get-municipalities', routes.views.get_municipalities);
	app.get('/get-municipality', routes.views.get_municipality);
	app.get('/get-communities', routes.views.get_communities);
	app.get('/get-initial-data', routes.views.get_initial_data);
	app.post('/save-new-monthly-value', routes.views.save_new_monthly_value);

	// Generate documents
	//app.get('/generate-docx', routes.views.generate_docx);
	//app.get('/generate-xlsx', routes.views.generate_xlsx);
	//app.get('/generate-csv', routes.views.generate_csv);

	// Contact
	app.all('/contacto', routes.views.contact);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
