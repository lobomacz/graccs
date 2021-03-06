var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ==================
 * PostCategory Model
 * ==================
 **/
var PostCategory = new keystone.List('PostCategory', {
	autokey: { from: 'name', path: 'slug', unique: true },
	label: 'Categorías de Noticias',
	singular: 'Categoría de Noticia',
	plural: 'Categorías de Noticias',
	track: true
});

PostCategory.add({
	name: { label: 'Nombre', type: Types.Text, required: true, unique: true }
});

/*Relationships*/
PostCategory.relationship({ ref: 'Post', path: 'posts', refPath: 'categories' });

/**
 * Registration
 */
PostCategory.defaultColumns = 'name';
PostCategory.register();
