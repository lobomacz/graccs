var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ======================================
 * NationalArea Model
 * Modelo para Área Nacional
 * ======================================
 **/
var NationalArea = new keystone.List('NationalArea', {
	autokey: { from: 'name', path: 'slug', unique: true },
	label: 'Nacionales',
	singular: 'Nación',
	plural: 'Nacionales',
	track: true
});

NationalArea.add({
	name: { label: 'Nombre', type: String, required: true, unique: true, initial: true }
});

/**
 * Registration
 */
NationalArea.defaultColumns = 'name';
NationalArea.register();
