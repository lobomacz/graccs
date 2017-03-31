var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * =============
 * Comment Model
 * =============
 **/
var PostComment = new keystone.List('PostComment', {
	map: { name: 'author' },
	defaultSort: '-createdAt',
	label: 'Comentarios de Noticias',
	singular: 'Comentario de Noticia',
	plural: 'Comentarios de Noticias',
	nocreate: true,
	noedit: true,
	track: true
});

PostComment.add({
	post: { label: 'Noticia', type: Types.Relationship, ref: 'Post', required: true, index: true, initial: true },
	author: { label: 'Autor', type: Types.Text, trim: true, required: true, initial: true },
	email: { label: 'Correo Electrónico', type: Types.Email, required: true, initial: true },
	content: { label: 'Contenido', type: Types.Textarea, trim: true, required: true, initial: true },
	positiveVotes: { label: 'Votos Positivos', type: Types.Number, default: 0, min: 0 },
	negativeVotes: { label: 'Votos Negativos', type: Types.Number, default: 0, min: 0 },
	createdAt: { label: 'Fecha', type: Date, default: Date.now, noedit: true, index: true, collapse: true }
});

/**
 * Registration
 **/
PostComment.defaultColumns = 'author, email, content, createdAt';
PostComment.register();
