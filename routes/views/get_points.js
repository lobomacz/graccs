var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});

	var indicator_id = req.params.indicator_id;
	var area_type = req.params.area_type;
    var area_id = req.params.area_id;
	var year = req.params.year;
	var q;
    
	switch (area_type) {
		case 'national':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('nationalArea', area_id)
				.where('startYear', year)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency');
			break;
		case 'department':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('departmentArea', area_id)
				.where('startYear', year)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency');
			break;
		case 'municipal':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('municipalArea', area_id)
				.where('startYear', year)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency');
			break;
		case 'community':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('communityArea', area_id)
				.where('startYear', year)
				.sort('monthlyFrequency quarterlyFrequency biannualFrequency');
			break;
	}

    if (q) {
        q.exec(function (err, results) {
            if (err || !results) {
				res.send({ status: 'ERROR: ' + err, points: null });
			}
            else {
				res.send({ status: 'OK', points: results });
			}
        });
    }
    else {
		res.send({ status: 'ERROR', points: null });
	}
};
