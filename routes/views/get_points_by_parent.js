var async = require('async');
var keystone = require('keystone');
var _ = require('underscore');

exports = module.exports = function (req, res) {
	req.params = _.extend(req.params || {}, req.query || {}, req.body || {});

	var locals = res.locals;
	var indicator_id = req.params.indicator_id;
	var year = req.params.year;
	var frequency_type = req.params.frequency_type;
	var frequency_value = req.params.frequency_value;
	var area_type = req.params.area_type;
	//var formula = req.params.formula;
	var q_areas;

	switch (area_type) {
		case 'municipal':
			q_areas = keystone.list('MunicipalArea').model.find()
				.sort('parent position')
				.populate('parent communities');
			break;
		case 'department':
			q_areas = keystone.list('DepartmentalArea').model.find()
				.sort('parent position')
				.populate('parent municipalities');
			break;
	}
	
	var global_array = [];
	var global_points = [];

	if (q_areas) {
		q_areas.exec(function (err, results) {
			if (!err && results) {
				locals.areas = results;

				async.each(locals.areas,
					function(area, callback) {
						area.points = [];
						callback(err);
					},
					function(err) {
						res.send({ status: 'OK', areas_with_points: locals.areas });
					}
				);
				
				/*async.each(results,
					function(area, callback) {
						
					},
					function(err) {
						res.send({ status: 'OK', areas_with_points: locals.areas });
					}
				);
				
				
				async.each(results,
					function (area, callback) {
						var q_child;
						
						switch (area_type) {
							case 'municipal':
								q_child = keystone.list('CommunityArea').model.find()
									.where('parent', area._id)
									.sort('position');
								break;
							case 'department':
								q_child = keystone.list('MunicipalArea').model.find()
									.where('parent', area._id)
									.sort('position');
								break;
						}	
						
						if (q_child) {
							q_child.exec(function (err, children) {
								if (!err && children) {
									
									async.each(children,
										function (child, callback) {
											var q_value;

											switch (frequency_type) {
												case 'monthly':
													switch (area_type) {
														case 'municipal':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('monthlyFrequency', frequency_value)
																.where('communityArea', child._id)
																.populate('communityArea');
															break;
														case 'department':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('monthlyFrequency', frequency_value)
																.where('municipalArea', child._id)
																.populate('municipalArea');
															break;
													}
													break;
												case 'quarterly':
													switch (area_type) {
														case 'municipal':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('quarterlyFrequency', frequency_value)
																.where('communityArea', child._id)
																.populate('communityArea');
															break;
														case 'department':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('quarterlyFrequency', frequency_value)
																.where('municipalArea', child._id)
																.populate('municipalArea');
															break;
													}
													break;
												case 'biannual':
													switch (area_type) {
														case 'municipal':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('biannualFrequency', frequency_value)
																.where('communityArea', child._id)
																.populate('communityArea');
															break;
														case 'department':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('biannualFrequency', frequency_value)
																.where('municipalArea', child._id)
																.populate('municipalArea');
															break;
													}
													break;
												case 'annual':
												case 'fifthly':
												case 'decade':
													switch (area_type) {
														case 'municipal':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('communityArea', child._id)
																.populate('communityArea');
															break;
														case 'department':
															q_value = keystone.list('IndicatorValue').model.findOne()
																.where('indicator', indicator_id)
																.where('startYear', year)
																.where('municipalArea', child._id)
																.populate('municipalArea');
															break;
													}
													break;
											}
											
											if (q_value) {
												q_value.exec(function(err, value) {
													if (!err && value) {
														global_points.push(value);
													}

													callback(err);
												});
											}
											else {
												callback(err);
											}
										},
										function (err) {
											callback(err);
										}
									);
								}
								else {
									console.log('Error_1:', err);
									callback(err);
								}
							});
						}
						else {
							console.log('Error_2:', err);
							callback(err);
						}
					},
					function (err) {
						console.log('global_points: ', global_points);
						console.log('results: ', results);

						res.send({ status: 'OK', areas_with_points: results });
					}
				);*/
			}
			else {
				res.send({ status: 'ERROR', areas_with_points: null });
			}
		});
	}
	else {
		res.send({ status: 'ERROR', areas_with_points: null });
	}
};
