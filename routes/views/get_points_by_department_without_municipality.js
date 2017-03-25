var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	
	var indicator_id = req.params.indicator_id;
	var department_id = req.params.department_id;
	var year = req.params.year;
	var points = [];
	var global_communities = [];

	var q = keystone.list('MunicipalArea').model.find()
		.where('parent', department_id)
		.sort('position name');

	q.exec(function (err, results) {
		if (!err && results) {
			async.each(results,
				function(municipality, callback) {
					var q_municipality = keystone.list('CommunityArea').model.find()
						.where('parent', municipality._id)
						.sort('position name')
						.populate('parent');
					
					q_municipality.exec(function(err, communities) {
						if (!err && communities) {
							async.each(communities, 
								function(community, callback) {
									var q_community = keystone.list('IndicatorValue').model.find()
										.where('indicator', indicator_id)
										.where('communityArea', community._id)
										.where('startYear', year)
										.sort('monthlyFrequency quarterlyFrequency biannualFrequency')
										.populate('communityArea');

									q_community.exec(function(err, values) {
										if (!err && values) {
											community.points = values;
											points.push(values);
										}

										callback(err);
									});
								},
								function (err) {
									for (var i = 0; i < communities.length; i++) {
										global_communities.push(communities[i]);
									}

									callback(err);
								}
							);
						}
					});
				},
				function (err) {
					res.send({ status: 'OK', points_array: points, municipalities: results, communities: global_communities });
				}
			);
		}
		else {
			res.send({ status: 'ERROR', points_array: null });
		}
	});
};
