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
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'NationalArea', many: false, initial: true }
});

/**
 * Registration
 */
DepartmentalArea.defaultSort = 'name';
DepartmentalArea.defaultColumns = 'parent, name';
DepartmentalArea.register();
