var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ====================================================
 * Legal Backup Model
 * Catálogo de Apoyo Legal para acceder desde el footer
 * ====================================================
 **/
var LegalBackup = new keystone.List('LegalBackup', {
	map: { name: 'name' },
	label: 'Apoyo Legal',
	singular: 'Apoyo Legal',
	plural: 'Apoyo Legal',
	track: true
});

LegalBackup.add({
	code: { label: 'Código', type: Types.Text, required: true, unique: true, initial: true },
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true },
	url: { label: 'Enlace del sitio web', type: Types.Url, required: true, note: 'http://', initial: true }
});

LegalBackup.relationship({ ref: 'Indicator', path: 'indicators', refPath: 'instance'});

/**
 * Registration
 */
LegalBackup.defaultColumns = 'code|15%, name, url';
LegalBackup.register();
