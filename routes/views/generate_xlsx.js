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

			postRequest (req, res, function() {
				res.writeHead ( 200, {
					"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					'Content-disposition': 'attachment; filename='+ slug +'.xlsx'
				});

				officegen.setVerboseMode(true);
				
				var xlsx = officegen('xlsx');

				xlsx.on('finalize', function(written) {
					console.log('Finish to create the surprise Excel stream and send it to');
				});

				xlsx.on('error', function(err) {
					console.log(err);
				});

				var sheet = xlsx.makeNewSheet();
				sheet.name = slug;

				// The direct option - two-dimensional array:
				sheet.data[0] = [];
				sheet.data[0][0] = 'Nombre del Indicador: ';
				sheet.data[0][1] = title;
				sheet.data[1] = [];
				sheet.data[1][0] = 'Código: ';
				sheet.data[1][1] = indicator.code;
				sheet.data[2] = [];
				sheet.data[2][0] = 'Versión: ';
				sheet.data[2][1] = indicator.version;

				xlsx.generate(res);
			});
		}
		else {
			res.send({ status: 'ERROR' });
		}
	});
};
