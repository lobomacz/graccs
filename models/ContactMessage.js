var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * =========================
 * Contact Message Model
 * Modelo para enviar correo
 * =========================
 */
var ContactMessage = new keystone.List('ContactMessage', {
	label: 'Mensajes de Contacto',
	singular: 'Mensaje de Contacto',
	plural: 'Mensajes de Contacto',
	nocreate: true
});

ContactMessage.add({
	name: {label: 'Nombre', type: Types.Text, required: true},
	email: {label: 'Correo Electrónico',type: Types.Email, required: true},
	type: {label: 'Motivo', type: Types.Text, required: true},
	subject: {label: 'Asunto', type: Types.Text, required: true},
	message: {label: 'Mensaje', type: Types.Markdown, required: true},
	createdAt: {label: 'Fecha', type: Date, default: Date.now, noedit: true}
});

/**
 * Registration
 */
ContactMessage.defaultSort = '-createdAt';
ContactMessage.defaultColumns = 'name, email, type, createdAt';
ContactMessage.register();
