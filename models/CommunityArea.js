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
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true },
	position: { label: 'Posición para ordenar', type: Types.Number, default: 0, min: 0, required: true, initial: true },
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'MunicipalArea', many: false, initial: true }
});

CommunityArea.relationship({ ref: 'IndicatorValue', path: 'indicator-values', refPath: 'indicator'});

/**
 * Registration
 */
CommunityArea.defaultSort = 'position name';
CommunityArea.defaultColumns = 'position, name, parent';
CommunityArea.register();
