var keystone = require('keystone');
var async = require('async');
var _ = require('underscore');
var officegen = require('officegen');
var fs = require('fs');
var path = require('path');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	
	//var area_type = req.params.area_type;
	//var area_id = req.params.area_id;
	//var indicator_id = req.params.indicator_id;
	
	var docx = officegen({
		type: 'docx',
		orientation: 'portrait',
		compress: false
	});

// Remove this comment in case of debugging Officegen:
	officegen.setVerboseMode(true);

	var pObj = docx.createP();

	pObj.addText ('Simple');
	pObj.addText (' with color', { color: '000088' });
	pObj.addText (' and back color.', { color: '00ffff', back: '000088' });

	var pObj = docx.createP();

	pObj.addText('Since ');
	pObj.addText('officegen 0.2.12', { back: '00ffff', shdType: 'pct12', shdColor: 'ff0000' }); // Use pattern in the background.
	pObj.addText(' you can do ');
	pObj.addText('more cool ', { highlight: true }); // Highlight!
	pObj.addText('stuff!', { highlight: 'darkGreen' }); // Different highlight color.
	
	var out = fs.createWriteStream('public/tmp/out.docx');

	docx.generate(out, {
		'finalize': function ( written ) {
			console.log ( 'Finish to create a Word file.\nTotal bytes created: ' + written + '\n' );
			res.send({status: 'OK', data: null});
		},
		'error': function ( err ) {
			console.log(err);
			res.send({status: 'ERROR', data: null});
		}
	});
};
