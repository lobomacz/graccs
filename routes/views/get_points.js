var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var area_type = req.params.area_type;
    var area_id = req.params.area_id;
    var indicator_id = req.params.indicator_id;
	var q;
    
	switch (area_type) {
		case 'national':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('nationalArea', area_id);
			break;
		case 'regional':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('departmentArea', area_id);
			break;
		case 'municipal':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('municipalArea', area_id);
			break;
		case 'community':
			q = keystone.list('IndicatorValue').model.find()
                .where('indicator', indicator_id)
                .where('communityArea', area_id);
			break;
	}

    if (q) {
        q.exec(function (err, results) {
            if (err || !results) {
                res.send(null);
            }
            else {
                var points = _.map(results, function (item) {
                    return _.pick(item.toJSON(), '_id', 'startYear', 'realValue', 'targetValue');
                });

                res.send({ area_type: area_type, area_id: area_id, indicator_id: indicator_id, points: points });
            }
        });
    }
    else {
        res.send(null);
    }
};