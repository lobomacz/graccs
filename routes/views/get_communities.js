var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var parent = req.params.parent;

	var q = keystone.list('CommunityArea').model.find()
			.where('parent', parent)
			.sort('name');

	q.exec(function (err, results) {
		if (err) {
			res.send({ status: 'ERROR', data: null });
		}
		else if (results) {
			res.send({ status: 'OK', data: results });
		}
		else {
			res.send({ status: 'OK', data: null });
		}
	});
};
