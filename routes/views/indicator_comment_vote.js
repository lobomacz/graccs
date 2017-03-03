var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	//  merge all parameters (Path parameters, URL query-string parameters, Body parameters)
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var vote = parseInt(req.params.vote);

	var q = keystone.list('IndicatorComment').model.findOne({
		_id: req.params.id
	});

	q.exec(function (err, comment) {
		if (err || !comment) {
			return res.send({status: 'K0'});
		}

		// update votes
		if (vote > 0) {
			comment.positiveVotes += 1;
		}
		else {
			comment.negativeVotes += 1;
		}

		comment.save();

		res.send({status: 'OK'});
	});
};
