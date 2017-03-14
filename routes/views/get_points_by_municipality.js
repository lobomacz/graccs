var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var indicator_id = req.params.indicator_id;
	var municipality_id = req.params.municipality_id;

	var communities = [];
	var points = [];
	
	var q = keystone.list('CommunityArea').model.find()
		.where('parent', municipality_id)
		.sort('position name');

	q.exec(function (err, results) {
		if (!err && results) {
			async.each(results,
				function (community, callback) {
					var q_community = keystone.list('IndicatorValue').model.find()
						.where('indicator', indicator_id)
						.where('communityArea', community._id)
						.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
					
					q_community.exec(function(err, values) {
						if (!err && values) {
							community.points = values;
							points.push(values);
						}
						else {
							community.points = null;
							points.push(null);
						}
						
						callback(err);
					});
				}, 
				function (err) {
					res.send({ status: 'OK', points_array: points });
				}
			);
		}
		else {
			res.send({ status: 'ERROR', points_array: null });
		}
	});
};