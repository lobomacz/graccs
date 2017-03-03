var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	//  merge all parameters (Path parameters, URL query-string parameters, Body parameters)
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var id = req.params.id;
	var rating = req.params.rating;

	var q = keystone.list('Indicator').model.findOne({
		_id: id,
		state: 'published'
	});

	q.exec(function (err, indicator) {
		if (err || !indicator) {
			return res.send({status: 'K0'});
		}
		
		// update average of ratings
		indicator.rating.count += 1;
		indicator.rating.total += parseFloat(rating) || 0;
		indicator.rating.value =  Number(parseFloat(indicator.rating.total) / parseInt(indicator.rating.count)).toPrecision(2);
		indicator.save();

		res.send({ status: 'OK', new_rating: indicator.rating.value });
	});
};
