var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	console.log('ENTRO');

	var q = keystone.list('IndicatorValue').model.find()
		.where('isMonthlyFrequency', true);

	q.exec(function (err, values) {
		if (err || !values) {
			return res.send({status: 'K0'});
		}

		async.each(values,
			function(value, callback) {
				var has_change = false;
				switch (value.monthlyFrequency) {
					case '1':
						value.monthlyFrequency = '01';
						has_change = true;
						break;
					case '2':
						value.monthlyFrequency = '02';
						has_change = true;
						break;
					case '3':
						value.monthlyFrequency = '03';
						has_change = true;
						break;
					case '4':
						value.monthlyFrequency = '04';
						has_change = true;
						break;
					case '5':
						value.monthlyFrequency = '05';
						has_change = true;
						break;
					case '6':
						value.monthlyFrequency = '06';
						has_change = true;
						break;
					case '7':
						value.monthlyFrequency = '07';
						has_change = true;
						break;
					case '8':
						value.monthlyFrequency = '08';
						has_change = true;
						break;
					case '9':
						value.monthlyFrequency = '09';
						has_change = true;
						break;
				}
				
				if (has_change) value.save();
					
				callback(err);
			},
			function(err) {
				res.send({status: 'OK'});
			}
		);
	});
};
