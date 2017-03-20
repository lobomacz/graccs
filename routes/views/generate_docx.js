// Simple server that displaying form to ask the user name and then generate PowerPoint stream with the user's name 
// without using real files on the server side.

var officegen = require('officegen');
var keystone = require('keystone');
var _ = require('underscore');

var fs = require('fs');
var http = require("http");
var querystring = require('querystring');

function postRequest(request, response, callback) {
	var queryData = "";
	if ( typeof callback !== 'function' ) return null;

	if (request.method == 'GET') {
		request.on('data', function(data) {
			queryData += data;
			
			if (queryData.length > 100) {
				queryData = "";
				response.writeHead(413, {'Content-Type': 'text/plain'}).end();
				request.connection.destroy();
			}
		});

		request.on('end', function(){
			response.post = querystring.parse(queryData);
			callback();
		});

	} 
	else {
		response.writeHead(405, { 'Content-Type': 'text/plain' });
		response.end();
	}
}

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	var indicator_id = req.params.id;

	var q = keystone.list('Indicator').model.findOne().where('_id', indicator_id).populate('sector');

	q.exec(function (err, indicator) {
		if (!err && indicator) {
			var title = indicator.title;
			var slug = indicator.slug;
			var code = "" + indicator.code + "";
			var version = "" + indicator.version + "";
			var date = "" + indicator.createdAt + "";
			var area = "" + indicator.sector.name + "";

			postRequest(req, res, function() {
				res.writeHead ( 200, {
					"Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					'Content-disposition': 'attachment; filename='+ slug +'.docx'
				});

				officegen.setVerboseMode(true);

				var docx = officegen({
					type: 'docx',
					orientation: 'portrait'
				});

				docx.on('finalize', function(written) {
					console.log('Finish to create the surprise PowerPoint stream and send it to .\nTotal bytes created: ' + written + '\n');
				});

				docx.on('error', function(err) {
					console.log(err);
				});

				var pObj = docx.createP ();
				pObj.addText('INFORMACIÓN GENERAL');
				pObj.addHorizontalLine();

				var pObj = docx.createP();
				
				pObj.addText('Nombre del Indicador: ', { bold: true, underline: true });
				pObj.addText(title);
				pObj.addLineBreak();
				pObj.addText('Código: ', { bold: true, underline: true });
				pObj.addText(code);
				pObj.addLineBreak();
				pObj.addText('Versión: ', { bold: true, underline: true });
				pObj.addText(version);
				pObj.addLineBreak();
				pObj.addText('Fecha de creación: ', { bold: true, underline: true });
				pObj.addText(date);
				pObj.addLineBreak();
				pObj.addText('Sector al que pertenece: ', { bold: true, underline: true });
				pObj.addText(area);
				pObj.addLineBreak();

				pObj.addText('Desagregaciones a las que se le aplica: ', { bold: true, underline: true });
				switch (indicator.minAreaToApply) {
					case 'department':
						pObj.addText("Regionales");
						break;
					case 'municipal':
						pObj.addText("Regionales, Municipales");
						break;
					case 'community':
						pObj.addText("Regionales, Municipales, Urbano-rurales");
						break;
				}
				pObj.addLineBreak();
				
				pObj.addText('Frecuencia: ', { bold: true, underline: true });
				switch (indicator.frequency) {
					case 'monthly':
						pObj.addText("Mensual");
						break;
					case 'quarterly':
						pObj.addText("Trimestral");
						break;
					case 'biannual':
						pObj.addText("Semestral");
						break;
					case 'annual':
						pObj.addText("Anual");
						break;
					case 'fifthly':
						pObj.addText("Cada cinco años");
						break;
					case 'decade':
						pObj.addText("Cada diez años");
						break;
				}
				pObj.addLineBreak();
				
				if (indicator.source) {
					pObj.addText('Fuente de información: ', { bold: true, underline: true });
					pObj.addText(indicator.source);
					pObj.addLineBreak();
				}

				if (indicator.target) {
					var paragraphs = indicator.target.split('<p>');

					if (paragraphs && paragraphs.length > 0) {
						pObj.addText('Objetivo que persigue: ', { bold: true, underline: true });

						for (var i = 0; i < paragraphs.length; i++) {
							pObj.addText(paragraphs[i]);
							pObj.addLineBreak();
						}
					}
				}

				var pObj = docx.createP();

				pObj.addText('VALORES DEL INDICADOR');
				pObj.addHorizontalLine();

				var table = [
					[{
						val: "No.",
						opts: {
							cellColWidth: 4261,
							b:true,
							sz: '48',
							shd: {
								fill: "7F7F7F",
								themeFill: "text1",
								"themeFillTint": "80"
							},
							fontFamily: "Avenir Book"
						}
					},{
						val: "Title1",
						opts: {
							b:true,
							color: "A00000",
							align: "right",
							shd: {
								fill: "92CDDC",
								themeFill: "text1",
								"themeFillTint": "80"
							}
						}
					},{
						val: "Title2",
						opts: {
							align: "center",
							cellColWidth: 42,
							b:true,
							sz: '48',
							shd: {
								fill: "92CDDC",
								themeFill: "text1",
								"themeFillTint": "80"
							}
						}
					}],
					[1,'All grown-ups were once children',''],
					[2,'there is no harm in putting off a piece of work until another day.',''],
					[3,'But when it is a matter of baobabs, that always means a catastrophe.',''],
					[4,'watch out for the baobabs!','END']
				];

				var tableStyle = {
					tableColWidth: 4261,
					tableSize: 24,
					tableColor: "ada",
					tableAlign: "left",
					tableFontFamily: "Comic Sans MS"
				};

				var pObj = docx.createTable(table, tableStyle);

				docx.generate(res);
			});
		}
		else {
			res.send({ status: 'ERROR' });
		}
	});
};

	

