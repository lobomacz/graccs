var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var indicator_id = req.params.indicator_id;
    var type = req.params.type;
    
    var q = keystone.list('IndicatorValue').model.find()
            .where('indicator', indicator_id)
            .where('areaType', type);
            
    q.exec(function (err, results) {
        if (err) {
            res.send({ status: 'ERROR', data: null });
        }
        else if (results) {
            var values = _.map(results, function (item) {
                return _.pick(item.toJSON(), 'startYear', 'realValue', 'targetValue');
            });
        
            res.send({ status: 'OK', data: values });
        }
        else {
            res.send({ status: 'OK', data: null });
        }
    });
};