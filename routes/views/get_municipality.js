var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var id = req.params.id;

	var q = keystone.list('MunicipalArea').model.findOne().where('_id', id);

	q.exec(function (err, result) {
		if (err) {
			res.send({ status: 'ERROR', municipal_area: null, related_municipal_areas: null });
		}
		else if (result) {
			var q_2 = keystone.list('MunicipalArea').model.find()
				.where('parent', result.parent)
				.sort('position name');
			
			q_2.exec(function (err_2, results) {
				if (err_2) {
					res.send({ status: 'ERROR', municipal_area: result, related_municipal_areas: null });
				}
				else if(results) {
					res.send({ status: 'OK', municipal_area: result, related_municipal_areas: results });
				}
				else {
					res.send({ status: 'OK', municipal_area: result, related_municipal_areas: null });
				}
			});
		}
		else {
			res.send({ status: 'OK', municipal_area: null, related_municipal_areas: null });
		}
	});
};
