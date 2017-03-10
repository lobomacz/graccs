// Simple server that displaying form to ask the user name and then generate PowerPoint stream with the user's name 
// without using real files on the server side.

var officegen = require('officegen');

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
			response.post = querystring.parse ( queryData );
			callback ();
		});

	} else {
		response.writeHead ( 405, { 'Content-Type': 'text/plain' });
		response.end ();
	}
}

exports = module.exports = function (req, res) {
	postRequest (req, res, function() {
		// console.log ( response.post );

		res.writeHead ( 200, {
			"Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			'Content-disposition': 'attachment; filename=surprise.pptx'
		});
		// .xlsx   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
		// .xltx   application/vnd.openxmlformats-officedocument.spreadsheetml.template
		// .potx   application/vnd.openxmlformats-officedocument.presentationml.template
		// .ppsx   application/vnd.openxmlformats-officedocument.presentationml.slideshow
		// .pptx   application/vnd.openxmlformats-officedocument.presentationml.presentation
		// .sldx   application/vnd.openxmlformats-officedocument.presentationml.slide
		// .docx   application/vnd.openxmlformats-officedocument.wordprocessingml.document
		// .dotx   application/vnd.openxmlformats-officedocument.wordprocessingml.template
		// .xlam   application/vnd.ms-excel.addin.macroEnabled.12
		// .xlsb   application/vnd.ms-excel.sheet.binary.macroEnabled.12

		var pptx = officegen ( 'pptx' );

		pptx.on ( 'finalize', function ( written ) {
			console.log ( 'Finish to create the surprise PowerPoint stream and send it to .\nTotal bytes created: ' + written + '\n' );
		});

		pptx.on ( 'error', function ( err ) {
			console.log ( err );
		});

		slide = pptx.makeNewSlide ();
		slide.back = '000000';
		slide.color = 'ffffff';

		slide.addText ( 'Hello!', { y: 20, cx: '100%', font_size: 56, font_face: 'Arial', bold: true, color: 'ffff00', align: 'center' } );

		slide.addText ( 'Requested URL', { y: 150, cx: '50%' } );
		slide.addText ( req.url, { y: 150, x: '50%', cx: '50%', color: '0000ff' } );
		slide.addText ( 'Request Method', { y: 180, cx: '50%' } );
		slide.addText ( req.method, { y: 180, x: '50%', cx: '50%', color: '0000ff' } );
		slide.addText ( 'Request Dara', { y: 210, cx: '50%' } );
		slide.addText ( res.post.name, { y: 210, x: '50%', cx: '50%', color: '0000ff' } );

		pptx.generate(res);
	});
};

	

