var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ==========
 * Comment Model
 * ==========
 **/
var IndicatorComment = new keystone.List('IndicatorComment', {
	map: {name: 'author'},
	defaultSort: '-createdAt',
	label: 'Comentarios de Indicadores',
	singular: 'Comentario de Indicador',
	plural: 'Comentarios de Indicadores',
	nocreate: true,
	noedit: true,
	track: true
});

IndicatorComment.add({
	indicator: { label: 'Indicador', type: Types.Relationship, ref: 'Indicator', required: true, index: true },
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
IndicatorComment.defaultColumns = 'author, email, content, createdAt';
IndicatorComment.register();
