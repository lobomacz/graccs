// Simple server that displaying form to ask the user name and then generate PowerPoint stream with the user's name 
// without using real files on the server side.

var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

var fs = require('fs');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});
	
	console.log('BEFORE VARS');
	var indicator_id = req.params.id;
	var slug = req.params.slug;
	var area_type = req.params.area_type;
	var area_id = req.params.area_id;
	
	if (indicator_id && slug && area_type && area_id) {
		var qIndicator = keystone.list('Indicator').model.findOne().where('_id', indicator_id).populate('sector');
		
		qIndicator.exec(function (err, indicator) {
			if (!err && indicator) {
				var frequency = '';
				switch (indicator.frequency) {
					case 'monthly':
						frequency = ' mensual';
						break;
					case 'quarterly':
						frequency = ' trimestral';
						break;
					case 'biannual':
						frequency = ' semestral';
						break;
					case 'annual':
						frequency = ' anual';
						break;
					case 'fifthly':
						frequency = ' quinquenal';
						break;
					case 'decade':
						frequency = ' cada diez años';
						break;
				}
				
				if (indicator.minAreaToApply === area_type) {
					var qArea;
					var area_text = '';

					switch (area_type) {
						case 'national':
							qArea = keystone.list('IndicatorValue').model.find()
								.where('indicator', indicator_id)
								.where('nationalArea', area_id)
								.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
							break;
						case 'department':
							area_text = 'Departamento';
							qArea = keystone.list('IndicatorValue').model.find()
								.where('indicator', indicator_id)
								.where('departmentArea', area_id)
								.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
							break;
						case 'municipal':
							area_text = 'Municipio';
							qArea = keystone.list('IndicatorValue').model.find()
								.where('indicator', indicator_id)
								.where('municipalArea', area_id)
								.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
							break;
						case 'community':
							area_text = 'Localidad';
							qArea = keystone.list('IndicatorValue').model.find()
								.where('indicator', indicator_id)
								.where('communityArea', area_id)
								.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');
							break;
					}
					
					if (qArea) {
						qArea.exec(function (err, results) {
							if (!err && results) {
								var data_header_1 = [];
								data_header_1.push("");
								data_header_1.push("");

								var data_header_2 = [];
								data_header_2.push('Indicador' + frequency);
								data_header_2.push(area_text);
								
								var data_header_3 = [];
								data_header_3.push(indicator.title);
								data_header_3.push('Localidad Uno');

								async.each(results,
									function(indicator_value, callback) {
										var date = indicator_value.startYear;
										var denominator = '';

										if (indicator_value.isMonthlyFrequency) {
											switch (indicator_value.monthlyFrequency) {
												case '1':
													date = 'Enero ' + indicator_value.startYear;
													break;
												case '2':
													date = 'Febrero ' + indicator_value.startYear;
													break;
												case '3':
													date = 'Marzo ' + indicator_value.startYear;
													break;
												case '4':
													date = 'Abril ' + indicator_value.startYear;
													break;
												case '5':
													date = 'Mayo ' + indicator_value.startYear;
													break;
												case '6':
													date = 'Junio ' + indicator_value.startYear;
													break;
												case '7':
													date = 'Julio ' + indicator_value.startYear;
													break;
												case '8':
													date = 'Agosto ' + indicator_value.startYear;
													break;
												case '9':
													date = 'Septiembre ' + indicator_value.startYear;
													break;
												case '10':
													date = 'Octubre ' + indicator_value.startYear;
													break;
												case '11':
													date = 'Noviembre ' + indicator_value.startYear;
													break;
												case '12':
													date = 'Diciembre ' + indicator_value.startYear;
													break;
											}
										}
										else if (indicator_value.isQuarterlyFrequency) {
											switch (indicator_value.quarterlyFrequency) {
												case '1':
													date = 'I Trimestre ' + indicator_value.startYear;
													break;
												case '2':
													date = 'II Trimestre ' + indicator_value.startYear;
													break;
												case '3':
													date = 'III Trimestre ' + indicator_value.startYear;
													break;
												case '4':
													date = 'IV Trimestre ' + indicator_value.startYear;
													break;
											}
										}
										else if (indicator_value.isBiannualFrequency) {
											switch (indicator_value.biannualFrequency) {
												case '1':
													date = 'I Semestre ' + indicator_value.startYear;
													break;
												case '2':
													date = 'II Semestre ' + indicator_value.startYear;
													break;
											}
										}

										data_header_1.push(date);
										data_header_1.push("");
										data_header_1.push("");
										
										if (indicator.useDenominator) {
											data_header_2.push(indicator.targetValue);
											denominator = indicator_value.targetValue;
										}
										else {
											data_header_2.push('Valor comparativo');
											denominator = indicator_value.comparativeValue;
										}

										data_header_2.push(indicator.realValue);
										data_header_2.push('%');
										data_header_3.push(denominator);
										data_header_3.push(indicator_value.realValue);
										data_header_3.push(denominator != 0 ? (indicator_value.realValue / denominator) * 100 : 0);

										callback(err);
									},
									function(err) {
										var data = [];
										data.push(data_header_1);
										data.push(data_header_2);
										data.push(data_header_3);

										var csv = data
											.map(function(d){
													return JSON.stringify(d);
												})
											.join('\n')
											.replace(/(^\[)|(\]$)/mg, '');

										res.setHeader('Content-disposition', 'attachment; filename=' + indicator.slug + '.csv');
										res.set('Content-Type', 'text/csv');
										res.set('charset', 'utf-8');
										res.status(200).send(csv);
									}
								);
							}
							else {
								console.log('ERROR 5');
								return res.redirect('/indicador/' + slug);
							}
						});
					}
					else {
						console.log('ERROR 4');
						return res.redirect('/indicador/' + slug);
					}
				}
				else {
					console.log('ERROR 3');
					return res.redirect('/indicador/' + slug);
					
					/*if (area_type === 'municipal') {
						var q = keystone.list('CommunityArea').model.find()
							.where('parent', area_id)
							.sort('position name');

						q.exec(function (err, communities) {
							if (!err && communities) {
								var data_header_1 = [];
								data_header_1.push("");
								data_header_1.push("");

								var data_header_2 = [];
								data_header_2.push('Indicador' + frequency);
								data_header_2.push('Municipio');
								
								var data_values = [];
								
								async.each(communities,
									function (community, callback) {
										var data_header_3 = [];
										data_header_3.push(indicator.title);
										data_header_3.push(community.name);

										var q_community = keystone.list('IndicatorValue').model.find()
											.where('indicator', indicator_id)
											.where('communityArea', community._id)
											.sort('monthlyFrequency quarterlyFrequency biannualFrequency startYear');

										q_community.exec(function(err, values) {
											if (!err) {
												if (values) {
													async.each(values,
														function(indicator_value, callback) {
															var date = indicator_value.startYear;
															var denominator = '';

															if (indicator_value.isMonthlyFrequency) {
																switch (indicator_value.monthlyFrequency) {
																	case '1':
																		date = 'Enero ' + indicator_value.startYear;
																		break;
																	case '2':
																		date = 'Febrero ' + indicator_value.startYear;
																		break;
																	case '3':
																		date = 'Marzo ' + indicator_value.startYear;
																		break;
																	case '4':
																		date = 'Abril ' + indicator_value.startYear;
																		break;
																	case '5':
																		date = 'Mayo ' + indicator_value.startYear;
																		break;
																	case '6':
																		date = 'Junio ' + indicator_value.startYear;
																		break;
																	case '7':
																		date = 'Julio ' + indicator_value.startYear;
																		break;
																	case '8':
																		date = 'Agosto ' + indicator_value.startYear;
																		break;
																	case '9':
																		date = 'Septiembre ' + indicator_value.startYear;
																		break;
																	case '10':
																		date = 'Octubre ' + indicator_value.startYear;
																		break;
																	case '11':
																		date = 'Noviembre ' + indicator_value.startYear;
																		break;
																	case '12':
																		date = 'Diciembre ' + indicator_value.startYear;
																		break;
																}
															}
															else if (indicator_value.isQuarterlyFrequency) {
																switch (indicator_value.quarterlyFrequency) {
																	case '1':
																		date = 'I Trimestre ' + indicator_value.startYear;
																		break;
																	case '2':
																		date = 'II Trimestre ' + indicator_value.startYear;
																		break;
																	case '3':
																		date = 'III Trimestre ' + indicator_value.startYear;
																		break;
																	case '4':
																		date = 'IV Trimestre ' + indicator_value.startYear;
																		break;
																}
															}
															else if (indicator_value.isBiannualFrequency) {
																switch (indicator_value.biannualFrequency) {
																	case '1':
																		date = 'I Semestre ' + indicator_value.startYear;
																		break;
																	case '2':
																		date = 'II Semestre ' + indicator_value.startYear;
																		break;
																}
															}

															data_header_1.push(date);
															data_header_1.push("");
															data_header_1.push("");

															if (indicator.useDenominator) {
																data_header_2.push(indicator.targetValue);
																denominator = indicator_value.targetValue;
															}
															else {
																data_header_2.push('Valor comparativo');
																denominator = indicator_value.comparativeValue;
															}

															data_header_2.push(indicator.realValue);
															data_header_2.push('%');
															data_header_3.push(denominator);
															data_header_3.push(indicator_value.realValue);
															data_header_3.push(denominator != 0 ? (indicator_value.realValue / denominator) * 100 : 0);

															callback(err);
														},
														function(err) {
															var data = [];
															data.push(data_header_1);
															data.push(data_header_2);
															data.push(data_header_3);

															var csv = data
																.map(function(d){
																	return JSON.stringify(d);
																})
																.join('\n')
																.replace(/(^\[)|(\]$)/mg, '');

															res.setHeader('Content-disposition', 'attachment; filename=' + indicator.slug + '.csv');
															res.set('Content-Type', 'text/csv');
															res.status(200).send(csv);
														}
													);
												}
												else {
													
												}
											}
											else {
												console.log('ERROR 4');
												return res.redirect('/indicador/' + slug);
											}

											callback(err);
										});
									},
									function (err) {
										res.send({ status: 'OK', points_array: points });
									}
								);
							}
							else {
								console.log('ERROR 3');
								return res.redirect('/indicador/' + slug);
							}
						});
					}*/
				}
			}
			else {
				console.log('ERROR 2');
				return res.redirect('/indicador/' + slug);
			}
		});
	}
	else {
		console.log('ERROR 1');
		return res.redirect('/indicador/' + slug);
	}
	
};
