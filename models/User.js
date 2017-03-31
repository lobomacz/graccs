var async = require('async');
var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User', {
	label: 'Usuarios',
	singular: 'Usuario',
	plural: 'Usuarios',
	track: true
	/*nodelete: function() {
		console.log('THIS USER: ', this.user);
		
		var q = keystone.list('User').model.findById(this.user);

		q.exec(function (err, loggedUser) {
			if (!err && loggedUser) {
				console.log('nodelete: ', loggedUser.role);
				return loggedUser.role != 'admin';
			}
			else {
				return false;
			}
		});
		
		//return !this.user.role.canWriteMetadata;
	},
	nocreate: function() {
		var q = keystone.list('User').model.findById(this.user);

		q.exec(function (err, loggedUser) {
			if (!err && loggedUser) {
				console.log('nocreate: ', loggedUser.role);
				return loggedUser.role != 'admin';
			}
			else {
				return false;
			}
		});
		
		//return !this.user.role.canWriteMetadata;
	},
	noedit: function() {
		var q = keystone.list('User').model.findById(this.user);

		q.exec(function (err, loggedUser) {
			if (!err && loggedUser) {
				console.log('noedit: ', loggedUser.role);
				return loggedUser.role != 'admin';
			}
			else {
				return false;
			}
		});
		
		//return !this.user.role.canWriteMetadata;
	}*/
});

User.add({
	name: { label: 'Nombre', type: Types.Name, required: true, index: true },
	email: { label: 'Correo', type: Types.Email, initial: true, required: true, index: true },
	password: { label: 'Contraseña', type: Types.Password, initial: true, required: true },
	role: {
		label: 'Rol',
		type: Types.Select,
		options: [
			{ value: 'admin', label: 'Administrador' },
			{ value: 'changer', label: 'Persona que cambia los estados' }],
		default: 'admin',
		required: true,
		initial: true
	}
}, 
'Permisos', {
	isAdmin: { label: 'Puede acceder a la administración', type: Types.Boolean, index: true, default: true },
	isPreparer: { label: 'Puede preparar los borradores', type: Types.Boolean, index: true, default: false },
	isEditor: { label: 'Puede dejar listo para publicar', type: Types.Boolean, index: true, default: false },
	isPublisher: { label: 'Puede publicar', type: Types.Boolean, index: true, default: false },
	isFiler: { label: 'Puede archivar', type: Types.Boolean, index: true, default: false }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});

/**
 * Registration
 */

User.defaultColumns = 'name, email, role, isAdmin';
User.register();
