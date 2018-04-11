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
	label: 'Marco Jurídico',
	singular: 'Marco Jurídico',
	plural: 'Marco Jurídico',
	track: true
});

LegalBackup.add({
	code: { label: 'Código', type: Types.Text, required: true, unique: true, initial: true },
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true },
	url: { label: 'Enlace del sitio web', type: Types.Url, required: true, note: 'http://', initial: true }
});

LegalBackup.relationship({ ref: 'Indicator', path: 'indicators', refPath: 'legalBackup.instance'});

LegalBackup.schema.pre('remove', function(next) {
	var q = keystone.list('Indicator').model.find()
		.where('legalBackup.instance', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar el marco jurídico porque tiene indicadores asociados.'));
		}
		else {
			return next();
		}
	});
});

/**
 * Registration
 */
LegalBackup.defaultColumns = 'code|15%, name, url';
LegalBackup.register();
