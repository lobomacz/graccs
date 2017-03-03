var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ================================
 * General Information Model
 * Información General sobre GRACCS
 * ================================
 **/
var GeneralInfo = new keystone.List('GeneralInformation', {
	map: { name: 'title' },
	label: 'Información General',
	singular: 'Información General',
	plural: 'Información General',
	track: true,
	nocreate: true,
	defaultSort: 'createdAt'
});

GeneralInfo.add({
	title: { label: 'Título', type: Types.Text, default: 'GRACCS', unique: true, required: true, initial: true },
	websiteUrl: { label: 'Enlace Principal', type: Types.Url, note: 'http://', default: 'http://www.graccs.ni' },
	heroSubtitle: { label: 'Subtítulo', type: Types.Html, wysiwyg: true, default: 'GOBIERNO REGIONAL AUTÓNOMO DE LA COSTA CARIBE SUR', required: true },
	heroDescription: { label: 'Descripción Principal', type: Types.Textarea, required: true },
	conditionsAndPolitics: { label: 'Condiciones y Políticas', type: Types.Textarea }
}, 'Redes Sociales', {
		facebook: { type: Types.Url, note: 'http://' },
		twitter: { type: Types.Url, note: 'http://' },
		instagram: { type: Types.Url, note: 'http://' },
		youtube: { type: Types.Url, note: 'http://' }
});

/**
 * Registration
 */
GeneralInfo.defaultColumns = 'title|20%, heroSubtitle';
GeneralInfo.register();
