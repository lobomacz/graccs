var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});

	var indicator_id = req.params.indicator_id;
	var year = req.params.year;
	var frequency_type = req.params.frequency_type;
	var frequency_value = req.params.frequency_value;
	console.log('Indicator: ', indicator_id, ' year: ', year, ' frequency_value: ', frequency_value, ' frequency_type: ', frequency_type);

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

	if (q_indicator) {
		q_indicator.exec(function (err, indicator_values) {
			if (!err && indicator_values) {
				console.log('Values: ', indicator_values);
				res.send({ status: 'OK', points: indicator_values });
			}
			else {
				res.send({ status: 'ERROR', points: null });
			}
		});
	}
	else {
		res.send({ status: 'ERROR', points: null });
	}
};
