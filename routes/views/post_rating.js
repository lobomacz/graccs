var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	//  merge all parameters (Path parameters, URL query-string parameters, Body parameters)
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var id = req.params.id;
	var rating = req.params.rating;

	var q = keystone.list('Post').model.findOne({
		_id: id,
		state: 'published'
	});

	q.exec(function (err, post) {
		if (err || !post) {
			return res.send({status: 'K0'});
		}
		// update average of ratings
		post.rating.count += 1;
		post.rating.total += parseFloat(rating) || 0;
		post.rating.value =  Number(parseFloat(post.rating.total) / parseInt(post.rating.count)).toPrecision(2);
		post.save();

		res.send({status: 'OK', new_rating: post.rating.value });
	});
};
