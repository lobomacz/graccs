var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ======================================
 * DepartmentalArea Model
 * Modelo para Área Departamental
 * ======================================
 **/
var DepartmentalArea = new keystone.List('DepartmentalArea', {
	autokey: { from: 'name', path: 'slug', unique: true },
	label: 'Departamentales',
	singular: 'Departamental',
	plural: 'Departamentales',
	track: true
});

DepartmentalArea.add({
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true },
	position: { label: 'Posición para ordenar', type: Types.Number, default: 0, min: 0, required: true, initial: true },
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'NationalArea', many: false, initial: true, index: true }
});

DepartmentalArea.relationship({ ref: 'IndicatorValue', path: 'indicator-values', refPath: 'departmentArea'});
DepartmentalArea.relationship({ ref: 'MunicipalArea', path: 'municipalities', refPath: 'parent'});

DepartmentalArea.schema.pre('remove', function(next) {
	var q = keystone.list('MunicipalArea').model.find()
		.where('parent', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar la región porque tiene municipios asociados.'));
		}
		else {
			return next();
		}
	});
});

DepartmentalArea.schema.pre('remove', function(next) {
	var q = keystone.list('IndicatorValue').model.find()
		.where('isDepartmentArea', true)
		.where('departmentArea', this._id);

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
DepartmentalArea.defaultSort = 'position name';
DepartmentalArea.defaultColumns = 'position, name, parent';
DepartmentalArea.register();
