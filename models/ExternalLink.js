var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ==========
 * External Link Model
 * Enlaces externos para acceder desde el footer
 * ==========
 **/
var ExternalLink = new keystone.List('ExternalLink', {
	map: { name: 'label' },
	label: 'Enlaces externos',
	singular: 'Enlace externo',
	plural: 'Enlaces externos',
	track: true
});

ExternalLink.add({
	label: { label: 'Título', type: Types.Text, required: true, unique: true, initial: true },
	url: { label: 'Enlace', type: Types.Url, required: true, note: 'http://', initial: true },
	description: { label: 'Descripción', type: Types.Markdown, initial: true },
	state: { 
		label: 'Estado', type: Types.Select, 
		options: [
			{ value: 'draft', label: 'Borrador' },
			{ value: 'ready-to-publish', label: 'Listo para publicar' },
			{ value: 'published', label: 'Publicado' },
			{ value: 'archived', label: 'Archivado' }],
		default: 'draft',
		required: true,
		index: true
	}
});

/**
 * Registration
 */
ExternalLink.defaultColumns = 'label, state|15%, url, description';
ExternalLink.register();
