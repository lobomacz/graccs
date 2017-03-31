var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Role Model
 * ==========
 */

var Role = new keystone.List('Role', {
	autokey: { path: 'slug', from: 'name', unique: true },
	label: 'Roles',
	singular: 'Rol',
	plural: 'Roles',
	nocreate: true,
	track: true
});

Role.add({
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true, initial: true, index: true },
	canReadMetadata: { label: 'Puede leer datos', type: Boolean, index: true, default: true },
	canWriteMetadata: { label: 'Puede crear, actualizar y eliminar datos ', type: Boolean, index: true, default: false }
});

/**
 * Registration
 */
Role.defaultColumns = 'name, canReadMetadata, canWriteMetadata';
Role.register();
