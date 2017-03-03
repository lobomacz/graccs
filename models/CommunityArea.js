var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ======================================
 * CommunityArea Model
 * Modelo para Área de Comunidad
 * ======================================
 **/
var CommunityArea = new keystone.List('CommunityArea', {
	autokey: { from: 'name', path: 'slug', unique: true },
	label: 'Localidades',
	singular: 'Localidad',
	plural: 'Localidades',
	track: true
});

CommunityArea.add({
	name: { label: 'Nombre', type: String, required: true, unique: true, initial: true },
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'MunicipalArea', many: false }
});

/**
 * Registration
 */
CommunityArea.defaultSort = 'parent, name';
CommunityArea.defaultColumns = 'parent, name';
CommunityArea.register();
