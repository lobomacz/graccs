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
	parent: { label: 'Desagregación a la que pertenece', type: Types.Relationship, ref: 'MunicipalArea', many: false, initial: true, index: true }
});

CommunityArea.relationship({ ref: 'IndicatorValue', path: 'indicator-values', refPath: 'communityArea'});

CommunityArea.schema.pre('remove', function(next) {
	var q = keystone.list('IndicatorValue').model.find()
		.where('isCommunityArea', true)
		.where('communityArea', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar la comunidad porque tiene valores de indicadores asociados.'));
		}
		else {
			return next();
		}
	});
});

/**
 * Registration
 */
CommunityArea.defaultSort = 'position name';
CommunityArea.defaultColumns = 'position, name, parent';
CommunityArea.register();
