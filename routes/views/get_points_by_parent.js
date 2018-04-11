var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});

	var locals = res.locals;
	var area_type = req.params.area_type;
	var q_areas;

	switch (area_type) {
		case 'municipal':
			q_areas = keystone.list('MunicipalArea').model.find()
				.sort('parent position')
				.populate('parent communities');
			break;
		case 'department':
			q_areas = keystone.list('DepartmentalArea').model.find()
				.sort('parent position')
				.populate('parent municipalities');
			break;
	}

	if (q_areas) {
		q_areas.exec(function (err, results) {
			if (!err && results) {
				locals.areas = results;

				async.each(locals.areas,
					function(area, callback) {
						area.points = [];
						callback(err);
					},
					function(err) {
						res.send({ status: 'OK', areas_with_points: locals.areas });
					}
				);
			}
			else {
				res.send({ status: 'ERROR', areas_with_points: null });
			}
		});
	}
	else {
		res.send({ status: 'ERROR', areas_with_points: null });
	}
};
