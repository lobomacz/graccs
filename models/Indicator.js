var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ===========================
 * Indicator Model
 * Modelo para los Indicadores
 * ===========================
 **/
var Indicator = new keystone.List('Indicator', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
	label: 'Indicadores',
	singular: 'Indicador',
	plural: 'Indicadores',
	defaultSort: '-title',
	track: true
});

Indicator.add(
	{
		title: { label: 'Nombre', type: Types.Text, required: true },
		htmlTitle: { label: 'Nombre con estilo', type: Types.Markdown, wysiwyg: true, note: 'Debe coincidir con el nombre original' },
		code: { label: 'Código', type: Types.Number, default: 1, min: 1, unique: true, required: true, initial: true },
		sector: { label: 'Sector', type: Types.Relationship, ref: 'IndicatorSector', required: true, many: false, initial: true },
		version: { label: 'Versión', type: Types.Number, default: 1.0, min: 1.0, required: true },
		createdAt: { label: 'Fecha de creación', type: Date, default: Date.now, noedit: true, hidden: true },
		startDate: { label: 'Fecha de comienzo', type: Types.Date, default: Date.now, required: true },
		endDate: { label: 'Fecha de culminación', type: Types.Date, default: Date.now, required: true },
		state: {
			label: 'Estado',
			type: Types.Select,
			options: [
				{ value: 'draft', label: 'Borrador' },
				{ value: 'ready-to-publish', label: 'Listo para publicar' },
				{ value: 'published', label: 'Publicado' },
				{ value: 'archived', label: 'Archivado' }
			],
			default: 'draft',
			required: true,
			index: true
		},
		classification: { 
			label: 'Clasificación', 
			type: Types.Select,
			options: [
				{ value: 'children', label: 'Niños' },
				{ value: 'teenager', label: 'Adolescentes' },
				{ value: 'youth', label: 'Jóvenes' },
				{ value: 'adults', label: 'Adultos' }
			],
			default: 'children',
			required: true,
			index: true
		},
		relatedImage: {
			label: 'Imagen relacionada',
			type: Types.LocalFile,
			dest: 'public/indicators/files/',
			prefix: '/indicators/files/',
			allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
			filename: function (item, file) {
				return 'indicator-' + item.id + '.' + file.extension;
			},
			format: function (item, file) {
				return '<img src="/indices/files/' + file.filename + '" style="max-width: 300px">';
			}
		},
		source: { label: 'Fuente de información', type: Types.Text, trim: true },
		target: { label: 'Objetivo', type: Types.Html, wysiwyg: true, height: 150, collapse: true },
		realValue: {
			label: 'Etiqueta a mostrar para el valor ejecutado', type: Types.Text, trim: true, required: true, default: 'Valor ejecutado',
			note: 'Depende del indicador: valor ejecutado, valor alcanzado, ...'
		},
		useDenominator: { label: 'Fórmula con denominador', type: Types.Boolean, default: false },
		targetValue: {
			label: 'Etiqueta a mostrar para el valor planificado', type: Types.Text, trim: true, default: 'Valor planificado',
			dependsOn: { useDenominator: true }, note: 'Depende del indicador: valor planificado, valor deseado, ...'
		},
		usePercent: { label: 'Fórmula con porciento', type: Types.Boolean, default: false },
		percentValue: {
			label: 'Valor por el que se multiplica', type: Types.Number, default: 100, min: 0, required: true,
			dependsOn: { usePercent: true }, note: 'Para el caso del porciento poner 100, para la natalidad o mortalidad infantil 1000, ...'
		},
		comparativeValue: { label: 'Valor para comparar', type: Types.Number, default: 0, min: 0, required: true },
		frequency: { value: 'Frecuencia de captura', type: Types.Select, required: true,
					 options: [{ value: 'monthly', label: 'Mensual' },
						 { value: 'quarterly', label: 'Trimestral' },
						 { value: 'biannual', label: 'Semestral' },
						 { value: 'annual', label: 'Anual' },
						 { value: 'fifthly', label: 'Quinquenal' },
						 { value: 'decade', label: 'Década' }], default: 'monthly' }
	},
	'Métrica', {
		metrics: {
			type: {
				label: 'Tipo',
				type: Types.Select,
				options: [{ value: 'increasing', label: 'Creciente' }, { value: 'decreasing', label: 'Decreciente' }],
				default: 'increasing',
				required: true
			},
			typeOfValues: { 
				label: 'Tipo de Valores', type: Types.Text, trim: true, required: true, default: 'Unidades', 
				note: 'Unidades, Estudiantes, etc...' 
			}
		}
	},
	'Responsables del proceso', {
		responsible: {
			collector: { label: 'Recolectar la información', type: Types.Text, trim: true },
			analizer: { label: 'Analizar la información', type: Types.Text, trim: true },
			authorizer: { label: 'Autorizar la información', type: Types.Text, trim: true },
			publisher: { label: 'Publicar la información', type: Types.Text, trim: true }
		}
	},
	'Apoyo legal', {
		legalBackup: {
			cdn: { label: 'Derecho CDN', type: Types.Text, trim: true },
			institutionalMark: { label: 'Marco Institucional', type: Types.Text, trim: true },
			relatedFile: {
				label: 'Archivo relacionado al Marco Institucional',
				type: Types.LocalFile,
				dest: 'public/indicators/files/',
				prefix: '/indicators/files/',
				allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
				format: function (item, file) {
					return '<img src="/indicators/files/' + file.filename + '" style="max-width: 300px">';
				}
			}
		}
	},
	'Valoración', {
		rating: {
			value: { label: 'Valor', type: Types.Number, default: 0, min: 0, max: 5, noedit: true, note: 'Valor máximo: 5' },
			count: { type: Types.Number, default: 0, min: 0, hidden: true },
			total: { type: Types.Number, default: 0, min: 0, hidden: true }
		}
	}
);

/* Relationships */
Indicator.relationship({ ref: 'IndicatorComment', path: 'indicator-comments', refPath: 'indicator'});

//Create Full Text Search index
Indicator.schema.index(
	{ title: 'text', target: 'text' },
	{ name: 'TextIndex', default_language: 'spanish', weights: { title: 10, target: 5 } }
);

/**
 * Registration
 **/
Indicator.defaultColumns = 'title, state|15%';
Indicator.defaultSort = 'title';
Indicator.register();
