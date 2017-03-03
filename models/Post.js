var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ==========
 * Post Model
 * ==========
 **/
var Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
	label: 'Noticias',
	singular: 'Noticia',
	plural: 'Noticias',
	defaultSort: '-publishedDate',
	track: true
});

Post.add({
		title: { label: 'Título', type: Types.Text, required: true },
		htmlTitle: { label: 'Título con estilo', type: Types.Markdown, wysiwyg: true, note: 'Debe coincidir con el título original' },
		state: { 
			label: 'Estado de publicación',
			type: Types.Select,
			options: [{ value: 'draft', label: 'Borrador' },
				{ value: 'ready-to-publish', label: 'Lista para publicar' },
				{ value: 'published', label: 'Publicada' },
				{ value: 'archived', label: 'Archivada' }],
			default: 'draft',
			required: true,
			index: true
		},
		publishedDate: {
			label: 'Fecha de Publicación',
			type: Types.Datetime,
			default: Date.now,
			index: true,
			dependsOn: { state: 'published' }
		},
		categories: { label: 'Categorías', type: Types.Relationship, ref: 'PostCategory', many: true, index: true },
		relatedImage: {
			label: 'Imagen de portada',
			type: Types.LocalFile,
			dest: 'public/posts/files/',
			prefix: '/indices/files/',
			required: true,
			default: 'empty-image.jpg',
			allowedTypes: [
				'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'
			],
			filename: function (item, file) {
				return 'post-' + item.id + '.' + file.extension;
			},
			format: function (item, file) {
				return '<img src="/indices/files/' + file.filename + '" style="max-width: 300px">';
			}
		},
		content: {
			brief: { label: 'Resumen', type: Types.Html, wysiwyg: true, height: 150 },
			extended: { label: 'Contenido', type: Types.Html, wysiwyg: true, height: 400 }
		},
		important: { label: 'Relevante', type: Types.Boolean, default: false }
	}, 
	'Valoración', {
		rating: {
			value: { label: 'Valor', type: Types.Number, default: 0, min: 0, max: 5, noedit: true, note: 'Valor máximo: 5' },
			count: { type: Types.Number, default: 0, min: 0, hidden: true },
			total: { type: Types.Number, default: 0, min: 0, hidden: true }
		}
	}
);

Post.relationship({ ref: 'PostComment', path: 'post-comments', refPath: 'post' });

Post.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});

//Create Full Text Search index
Post.schema.index(
	{ title: 'text', 'content.brief': 'text', 'content.extended': 'text' },
	{ name: 'TextIndex', default_language: 'spanish', weights: { title: 10, 'content.brief': 7, 'content.extended': 5 } }
);

/**
 * Registration
 **/
Post.defaultColumns = 'title, state|15%, publishedDate|15%, content.brief';
Post.defaultSort = '-rating.value -createdAt';
Post.register();
