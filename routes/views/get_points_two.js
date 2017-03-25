var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});

	var indicator_id = req.params.indicator_id;
	var year = req.params.year;
	var frequency_type = req.params.frequency_type;
	var frequency_value = req.params.frequency_value;
	var q_indicator;
	
	switch (frequency_type) {
		case 'monthly':
			q_indicator = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator_id)
				.where('startYear', year)
				.where('monthlyFrequency', frequency_value)
				.sort('departmentArea municipalArea communityArea')
				.populate('departmentArea municipalArea communityArea');
			break;
		case 'quarterly':
			q_indicator = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator_id)
				.where('startYear', year)
				.where('quarterlyFrequency', frequency_value)
				.sort('departmentArea municipalArea communityArea')
				.populate('departmentArea municipalArea communityArea');
			break;
		case 'biannual':
			q_indicator = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator_id)
				.where('startYear', year)
				.where('biannualFrequency', frequency_value)
				.sort('departmentArea municipalArea communityArea')
				.populate('departmentArea municipalArea communityArea');
			break;
		case 'annual':
		case 'fifthly':
		case 'decade':
			q_indicator = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator_id)
				.where('startYear', year)
				.sort('departmentArea municipalArea communityArea')
				.populate('departmentArea municipalArea communityArea');
			break;
	}

	var parents = [];
	var parents_ids = [];

	if (q_indicator) {
		q_indicator.exec(function (err, indicator_values) {
			if (!err && indicator_values) {
				async.each(indicator_values,
					function (value, callback) {
						var q_parent;
						
						if (value.isMunicipalArea) {
							q_parent = keystone.list('DepartmentalArea').model.findOne()
								.where('_id', value.municipalArea.parent);
						}
						else if (value.isCommunityArea) {
							q_parent = keystone.list('MunicipalArea').model.findOne()
								.where('_id', value.communityArea.parent)
								.populate('parent');
						}
						
						if (q_parent) {
							q_parent.exec(function(err, parent) {
								if (!err && parent) {
									if (parents_ids.indexOf(parent.name) === -1) {
										parents_ids.push(parent.name);
										parents.push(parent);
									}
								}

								callback(err);
							});
						}
						else {
							callback(err);
						}
					},
					function (err) {
						console.log('parents', parents);
						console.log('parents', parents_ids);
						
						res.send({ status: 'OK', indicator_values: indicator_values, parents: parents });
					}
				);
			}
			else {
				res.send({ status: 'ERROR', indicator_values: null, parents: null });
			}
		});
	}
	else {
		res.send({ status: 'ERROR', indicator_values: null, parents: null });
	}
};
