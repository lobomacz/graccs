// Simple server that displaying form to ask the user name and then generate PowerPoint stream with the user's name 
// without using real files on the server side.

var officegen = require('officegen');
var keystone = require('keystone');
var _ = require('underscore');

var fs = require('fs');
var http = require("http");
var querystring = require('querystring');

function postRequest ( request, response, callback ) {
	var queryData = "";
	if ( typeof callback !== 'function' ) return null;

	if ( request.method == 'GET' ) {
		request.on ( 'data', function ( data ) {
			queryData += data;
			if ( queryData.length > 100 ) {
				queryData = "";
				response.writeHead ( 413, {'Content-Type': 'text/plain'}).end ();
				request.connection.destroy ();
			}
		});

		request.on ( 'end', function () {
			response.post = querystring.parse( queryData );
			callback();
		});

	} else {
		response.writeHead ( 405, { 'Content-Type': 'text/plain' });
		response.end ();
	}
}

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var indicator_id = req.params.id;

	var q = keystone.list('Indicator').model.findOne().where('_id', indicator_id);

	q.exec(function (err, indicator) {
		if (!err && indicator) {
			var title = indicator.title;
			var slug = indicator.slug;
			var code = "'" + indicator.code + "'";
			var version = "'" + indicator.version + "'";

			postRequest (req, res, function() {
				res.writeHead ( 200, {
					"Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
					'Content-disposition': 'attachment; filename='+ slug +'.docx'
				});

				var docx = officegen ( {
					type: 'docx',
					orientation: 'portrait'
				} );

				docx.on('finalize', function(written) {
					console.log('Finish to create the surprise PowerPoint stream and send it to .\nTotal bytes created: ' + written + '\n');
				});

				docx.on('error', function(err) {
					console.log(err);
				});

				var pObj = docx.createP();
				
				pObj.addText('Nombre del Indicador: ', { bold: true, underline: true });
				pObj.addLineBreak ();
				pObj.addText(title);

				var pObj = docx.createP ();

				pObj.addText('Código: ', { bold: true, underline: true });
				pObj.addLineBreak ();
				pObj.addText(code);

				var pObj = docx.createP ();

				pObj.addText('Versión: ', { bold: true, underline: true });
				pObj.addLineBreak ();
				pObj.addText(version);

				var pObj = docx.createP ();

				pObj.addText ('Even add ');
				pObj.addText ('external link', { link: 'https://github.com' });
				pObj.addText ('!');

				docx.generate(res);
			});
		}
		else {
			res.send({ status: 'ERROR' });
		}
	});
};

	

