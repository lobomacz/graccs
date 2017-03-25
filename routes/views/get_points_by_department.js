var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	
	var indicator_id = req.params.indicator_id;
	var department_id = req.params.department_id;
	var year = req.params.year;
	var points = [];
	
	var q = keystone.list('MunicipalArea').model.find()
		.where('parent', department_id)
		.sort('position name');

	q.exec(function (err, results) {
		if (!err && results) {
			async.each(results,
				function (municipality, callback) {
					var q_municipality = keystone.list('IndicatorValue').model.find()
						.where('indicator', indicator_id)
						.where('municipalArea', municipality._id)
						.where('startYear', year)
						.sort('monthlyFrequency quarterlyFrequency biannualFrequency');

					q_municipality.exec(function(err, values) {
						if (!err && values) {
							municipality.points = values;
							points.push(values);
						}
						else {
							municipality.points = null;
							points.push(null);
						}

						callback(err);
					});
				},
				function (err) {
					res.send({ status: 'OK', points_array: points, municipalities: results });
				}
			);
		}
		else {
			res.send({ status: 'ERROR', points_array: null });
		}
	});
};
