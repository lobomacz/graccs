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
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true }
});

NationalArea.relationship({ ref: 'DepartmentalArea', path: 'departmentals', refPath: 'parent'});

NationalArea.schema.pre('remove', function(next) {
	var q = keystone.list('DepartmentalArea').model.find()
		.where('parent', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar la nación porque tiene regiones asociadas.'));
		}
		else {
			return next();
		}
	});
});

/**
 * Registration
 */
NationalArea.defaultSort = 'name';
NationalArea.defaultColumns = 'name';
NationalArea.register();
