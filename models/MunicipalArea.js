var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ======================================
 * MunicipalArea Model
 * Modelo para Área Municipal
 * ======================================
 **/
var MunicipalArea = new keystone.List('MunicipalArea', {
	autokey: { from: 'name', path: 'slug', unique: true },
	label: 'Municipales',
	singular: 'Municipal',
	plural: 'Municipales',
	track: true
});

MunicipalArea.add({
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true },
	position: { label: 'Posición para ordenar', type: Types.Number, default: 0, min: 0, required: true, initial: true },
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'DepartmentalArea', many: false, initial: true, index: true }
});

MunicipalArea.relationship({ ref: 'IndicatorValue', path: 'indicator-values', refPath: 'municipalArea'});
MunicipalArea.relationship({ ref: 'CommunityArea', path: 'communities', refPath: 'parent'});

MunicipalArea.schema.pre('remove', function(next) {
	var q = keystone.list('CommunityArea').model.find()
		.where('parent', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar el municipio porque tiene comunidades asociadas.'));
		}
		else {
			return next();
		}
	});
});

MunicipalArea.schema.pre('remove', function(next) {
	var q = keystone.list('IndicatorValue').model.find()
		.where('isMunicipalArea', true)
		.where('municipalArea', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar el municipio porque tiene valores de indicadores asociados.'));
		}
		else {
			return next();
		}
	});
});

/**
 * Registration
 */
MunicipalArea.defaultSort = 'position name';
MunicipalArea.defaultColumns = 'position, name, parent';
MunicipalArea.register();
