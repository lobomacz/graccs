var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var indicator = req.params.indicator;
	var type = req.params.type;
	var area = req.params.area;

	var q;

	switch (type) {
		case 'department':
			q = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator)
				.where('departmentArea', area)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
			break;
		case 'municipal':
			q = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator)
				.where('municipalArea', area)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
			break;
		case 'community':
			q = keystone.list('IndicatorValue').model.find()
				.where('indicator', indicator)
				.where('communityArea', area)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
			break;
	}

	if (q) {
		q.exec(function (err, results) {
			if (err) {
				console.log('Error: ', err);
				res.send({ status: 'ERROR: ' + err, points: null });
			}
			else if (results) {
				res.send({ status: 'OK', points: results });
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
