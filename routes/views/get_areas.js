var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var area_type = req.params.area_type;
	var q;

	switch (area_type) {
		case 'national':
			q = keystone.list('NationalArea').model.find().sort('name');
			break;
		case 'department':
			q = keystone.list('DepartmentalArea').model.find().sort('position name');
			break;
		case 'municipal':
			q = keystone.list('MunicipalArea').model.find().sort('position name');
			break;
		case 'community':
			q = keystone.list('CommunityArea').model.find().sort('position name');
			break;
	}

    if (q) {
        q.exec(function (err, results) {
            if (err || !results) {
                res.send(null);
            }
            else {
                var areas = _.map(results, function (item) {
                    return _.pick(item.toJSON(), '_id', 'name', 'position');
                });

                res.send(areas);
            }
        });
    }
    else {
        res.send(null);
    }
};
