var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ======================================
 * IndicatorSector Model
 * Modelo para Sectores de Indicador
 * ======================================
 **/
var IndicatorSector = new keystone.List('IndicatorSector', {
	autokey: { from: 'name', path: 'slug', unique: true },
	label: 'Sectores de Indicadores',
	singular: 'Sector de Indicador',
	plural: 'Sectores de Indicadores',
	track: true
});

IndicatorSector.add({
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true },
	icono: {
		label: 'Icono relacionado',
		type: Types.LocalFile,
		required: true,
		default: 'default-sector.png',
		dest: 'public/indicators/icons/',
		prefix: '/indicators/icons/',
		allowedTypes: [
			'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'
		],
		filename: function (item, file) {
			return 'indicator-sector-' + item.id + '.' + file.extension;
		},
		format: function (item, file) {
			return '<img src="/indicators/icons/indicator-sector-' + file.filename + '" style="max-width: 300px">';
		}
	}
});

/*Relationships*/
IndicatorSector.relationship({ ref: 'Indicator', path: 'indicator', refPath: 'sector' });

/**
 * Registration
 */
IndicatorSector.defaultColumns = 'name';
IndicatorSector.register();
