var async = require('async');
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
	track: true
});

Indicator.add({
		title: { label: 'Nombre', type: Types.Text, required: true },
		infoRegisters: { label: 'Responsables de registrar la información', type: Types.Relationship, ref: 'User', many: true, index: true },
		code: { label: 'Código', type: Types.Number, default: 1, min: 1, unique: true, required: true, initial: true },
		sector: { label: 'Sector', type: Types.Relationship, ref: 'IndicatorSector', required: true, many: false, initial: true, index: true },
		version: { label: 'Versión', type: Types.Number, default: 1.0, min: 1.0, required: true },
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
			initial: true,
			index: true
		},
		classification: { 
			label: 'Clasificación', 
			type: Types.Select,
			options: [
				{ value: 'children', label: 'Niñez' },
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
			require: true,
			default: 'indicator-default.jpg',
			dest: 'public/indicators/files/',
			prefix: '/indicators/files/',
			allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
			filename: function (item, file) {
				return 'indicator-' + item.id + '.' + file.extension;
			},
			format: function (item, file) {
				return '<img src="/indicators/files/' + file.filename + '" style="max-width: 300px">';
			}
		},
		source: { label: 'Fuente de información', type: Types.Text, trim: true },
		url: { label: 'Enlace de la fuente de información', type: Types.Url, note: 'http://' },
		target: { label: 'Descripción', type: Types.Html, default: '', wysiwyg: true, height: 150 },
		realValue: {
			label: 'Etiqueta a mostrar para el valor ejecutado', type: Types.Text, trim: true, required: true, default: 'Valor ejecutado',
			note: 'Depende del indicador: valor ejecutado, valor alcanzado, ...'
		},
		useDenominator: { label: 'Tiene valor planificado', type: Types.Boolean, default: false },
		targetValue: {
			label: 'Etiqueta a mostrar para el valor planificado', type: Types.Text, trim: true, default: 'Valor planificado',
			dependsOn: { useDenominator: true }, note: 'Depende del indicador: valor planificado, valor deseado, ...'
		},
		frequency: { label: 'Frecuencia de captura', type: Types.Select, required: true, index: true,
					 options: [
						 { value: 'monthly', label: 'Mensual' },
						 { value: 'quarterly', label: 'Trimestral' },
						 { value: 'biannual', label: 'Semestral' },
						 { value: 'annual', label: 'Anual' },
						 { value: 'thirdly', label: 'Trianual' },
						 { value: 'fifthly', label: 'Quinquenal' },
						 { value: 'decade', label: 'Década' }], 
					 default: 'monthly' },
		minAreaToApply: { label: 'Desagregación mínima a aplicar', type: Types.Select, required: true, index: true,
						  options: [
							  { value: 'department', label: 'Departamental (regional)' },
							  { value: 'municipal', label: 'Municipal' },
							  { value: 'community', label: 'Urbano-Rural (comunidad)' }], 
						  default: 'community' },
		formula: { label: 'Tipo de fórmula acumulativa', type: Types.Select, required: true, index: true,
			options: [
				{ value: 'sum', label: 'Sumatoria' },
				{ value: 'avg', label: 'Promedio' }],
			default: 'sum' }
	},
	'Métrica', {
		metrics: {
			type: {
				label: 'Tipo',
				type: Types.Select,
				options: [{ value: 'increasing', label: 'Creciente' }, { value: 'decreasing', label: 'Decreciente' }],
				default: 'increasing',
				required: true,
				index: true
			},
			typeOfValues: { 
				label: 'Tipo de Valores', type: Types.Text, trim: true, required: true, default: 'Unidades', 
				note: 'Unidades, Estudiantes, etc...' 
			}
		}
	},
	'Responsables del proceso', {
		responsible: {
			collector: { label: 'Recolectar la información', type: Types.Text, default: '', trim: true },
			analizer: { label: 'Analizar la información', type: Types.Text, default: '', trim: true },
			authorizer: { label: 'Autorizar la información', type: Types.Text, default: '', trim: true },
			publisher: { label: 'Publicar la información', type: Types.Text, default: '', trim: true }
		}
	},
	'Marco Jurídico', {
		legalBackup: {
			instance: { label: 'Instancia', type: Types.Relationship, ref: 'LegalBackup', many: false, index: true },
			institutionalMark: { label: 'Marco Institucional', type: Types.Text, default: '', trim: true },
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

Indicator.schema.pre('save', function(done) {
	if (this.indicator != null) {
		this.addInfoRegisters(this, done);
	}
	else {
		process.nextTick(done);
	}
});

Indicator.schema.pre('remove', function(next) {
	var q = keystone.list('IndicatorValue').model.find()
		.where('indicator', this._id);

	q.exec(function (err, values) {
		if (err || values.length > 0) {
			return next(new Error('No puede eliminar el indicador porque tiene valores asociados.'));
		}
		else {
			return next();
		}
	});
});

Indicator.schema.methods.addInfoRegisters = function(target, done) {
	if (this.indicator && this.infoRegisters) {
		var q = keystone.list('IndicatorValue').model.find()
			.where('indicator', this.indicator);

		q.exec(function (err, indicator_values) {
			if (!err && indicator_values) {
				async.each(indicator_values,
					function (value, callback) {
						value.infoRegisters = this.infoRegisters;
						value.save();

						callback(err);
					},
					function(err) {
						done(err);
					}
				);
			}
			else {
				done(err);
			}
		});
	}
	else {
		done();
	}
};

/*Indicator.schema.pre('remove', function(next) {
	var q = keystone.list('IndicatorValue').model.remove().where('indicator', this._id);

	q.exec(function (err, results) {
		if (!err) return next();
		next (err);
	});
});

Indicator.schema.pre('remove', function(next) {
	var q = keystone.list('IndicatorComment').model.remove().where('indicator', this._id);

	q.exec(function (err, results) {
		if (!err) return next();
		next (err);
	});
});*/

/* Relationships */
Indicator.relationship({ ref: 'IndicatorComment', path: 'indicator-comments', refPath: 'indicator'});
Indicator.relationship({ ref: 'IndicatorValue', path: 'values', refPath: 'indicator'});

//Create Full Text Search index
Indicator.schema.index(
	{ title: 'text', target: 'text' },
	{ name: 'TextIndex', default_language: 'spanish', weights: { title: 10, target: 5 } }
);

/**
 * Registration
 **/
Indicator.defaultColumns = 'title, sector|15%, state|15%';
Indicator.defaultSort = 'sector title';
Indicator.register();
