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
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'DepartmentalArea', many: false, initial: true }
});

/**
 * Registration
 */
MunicipalArea.defaultSort = 'name';
MunicipalArea.defaultColumns = 'parent, name';
MunicipalArea.register();
