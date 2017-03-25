var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	
	var indicator = req.params.indicator;
	var type = req.params.type;
	var area = req.params.area;
	var year = req.params.year;
	var q;

	switch (type) {
		case 'department':
			q = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator)
				.where('departmentArea', area)
				.where('startYear', year)
				.sort('-startYear monthlyFrequency quarterlyFrequency biannualFrequency')
				.populate('departmentArea');
			break;
		case 'municipal':
			q = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator)
				.where('municipalArea', area)
				.where('startYear', year)
				.sort('-startYear monthlyFrequency quarterlyFrequency biannualFrequency')
				.populate('municipalArea');
			break;
		case 'community':
			q = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator)
				.where('communityArea', area)
				.where('startYear', year)
				.sort('-startYear monthlyFrequency quarterlyFrequency biannualFrequency')
				.populate('communityArea');
			break;
	}

	if (q) {
		var years = [];
		
		q.exec(function (err, results) {
			if (err) {
				console.log('Error: ', err);
				res.send({ status: 'ERROR: ' + err, points: null });
			}
			else if (results) {
				async.each(results,
					function(indicator_value, callback) {
						if(years.indexOf(indicator_value.startYear) === -1) years.push(indicator_value.startYear);
						callback(err);
					},
					function(err) {
						res.send({ status: 'OK', points: results, years: years });
					}
				);
			}
			else {
				res.send({ status: 'OK', points: null });
			}
		});
	}
	else {
		res.send({ status: 'ERROR', points: null });
	}
};
