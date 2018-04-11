var async = require('async');
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * ======================================
 * MunicipalArea Model
 * Modelo para Área Municipal
 * ======================================
 **/
var IndicatorValue = new keystone.List('IndicatorValue', {
	label: 'Valores de indicador',
	singular: 'Valor de indicador',
	plural: 'Valores de indicador',
	track: true
});

IndicatorValue.add({
	indicator: { label: 'Indicador', type: Types.Relationship, ref: 'Indicator', required: true, many: false, initial: true, index: true },
	infoRegisters: { type: Types.Relationship, ref: 'User', many: true, index: true, hidden: true },
	realValueOriginal: { type: Types.Text, trim: true },
	targetValueOriginal: { type: Types.Text, trim: true },
	startYear: { label: 'Fecha de comienzo', type: Types.Number, default: 2000, min: 1900, required: true, initial: true },
	realValue: { label: 'Valor ejecutado', type: Types.Number, default: 0, min: 0, required: true, initial: true },
	useDenominator: { label: 'Usar denominador', type: Types.Boolean, watch: true, value: checkIndicatorDenominator, hidden: true },
	targetValue: { label: 'Valor planificado', type: Types.Number, default: 0, min: 0, dependsOn: { useDenominator: true } },
	comparativeValue: { label: 'Valor para comparar', type: Types.Number, default: 0, min: 0 },
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
		index: true,
		initial: true
	},
	isMonthlyFrequency: { label: 'Es una frecuencia mensual', type: Types.Boolean, watch: true, value: checkMonthlyFrequency, hidden: true },
	monthlyFrequency: {
		label: 'Frecuencia mensual',
		required: true,
		index: true,
		type: Types.Select,
		options: [
			{ value: '01', label: 'Enero' },
			{ value: '02', label: 'Febrero' },
			{ value: '03', label: 'Marzo' },
			{ value: '04', label: 'Abril' },
			{ value: '05', label: 'Mayo' },
			{ value: '06', label: 'Junio' },
			{ value: '07', label: 'Julio' },
			{ value: '08', label: 'Agosto' },
			{ value: '09', label: 'Septiembre' },
			{ value: '10', label: 'Octubre' },
			{ value: '11', label: 'Noviembre' },
			{ value: '12', label: 'Diciembre' }
		],
		default: '01',
		dependsOn: { isMonthlyFrequency: true }
	},
	isQuarterlyFrequency: { label: 'Es una frecuencia trimestral', type: Types.Boolean, watch: true, value: checkQuarterlyFrequency, hidden: true },
	quarterlyFrequency: {
		label: 'Frecuencia trimestral',
		required: true,
		index: true,
		type: Types.Select,
		options: [
			{ value: '1', label: 'I Trimestre' },
			{ value: '2', label: 'II Trimestre' },
			{ value: '3', label: 'III Trimestre' },
			{ value: '4', label: 'IV Trimestre' }
		],
		default: '1',
		dependsOn: { isQuarterlyFrequency: true }
	},
	isBiannualFrequency: { label: 'Es una frecuencia semestral', type: Types.Boolean, watch: true, value: checkBiannualFrequency, hidden: true },
	biannualFrequency: {
		label: 'Frecuencia semestral',
		required: true,
		index: true,
		type: Types.Select,
		options: [
			{ value: '1', label: 'I Semestre' },
			{ value: '2', label: 'II Semestre' }
		],
		default: '1',
		dependsOn: { isBiannualFrequency: true }
	},
	isDepartmentArea: { label: 'Es una desagregación departamental', type: Types.Boolean, watch: true, value: checkDepartmentArea, hidden: true },
	departmentArea: { label: 'Desagregación Departamental (regional)', type: Types.Relationship, ref: 'DepartmentalArea', many: false, dependsOn: { isDepartmentArea: true }, index: true },
	isMunicipalArea: { label: 'Es una desagregación municipal', type: Types.Boolean, watch: true, value: checkMunicipalArea, hidden: true },
	municipalArea: { label: 'Desagregación Municipal', type: Types.Relationship, ref: 'MunicipalArea', many: false, dependsOn: { isMunicipalArea: true }, index: true },
	isCommunityArea: { label: 'Es una desagregación urbano-rural', type: Types.Boolean, watch: true, value: checkCommunityArea, hidden: true },
	communityArea: { label: 'Desagregación Urbano-Rural (comunidad)', type: Types.Relationship, ref: 'CommunityArea', many: false, dependsOn: { isCommunityArea: true }, index: true },
	relatedFiles: {
		label: 'Evidencias',
		type: Types.LocalFiles,
		dest: 'public/indicators/uploads/',
		prefix: '/indicators/uploads/',
		allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
		format: function (item, file) {
			return '<img src="/indicators/uploads/' + file.filename + '" style="max-width: 300px">';
		}
	}
});

function checkIndicatorDenominator(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.useDenominator);
	});
}

function checkMonthlyFrequency(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.frequency === 'monthly');
	});
}

function checkQuarterlyFrequency(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.frequency === 'quarterly');
	});
}

function checkBiannualFrequency(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.frequency === 'biannual');
	});
}

function checkDepartmentArea(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.minAreaToApply === 'department');
	});
}

function checkMunicipalArea(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.minAreaToApply === 'municipal');
	});
}

function checkCommunityArea(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		callback(null, ind.minAreaToApply === 'community');
	});
}

IndicatorValue.schema.methods.addInfoRegisters = function(target, done) {
	if (this.indicator) {
		var q = keystone.list('Indicator').model.findById(this.indicator);

		q.exec(function (err, indicator) {
			if (!err && indicator) {
				target.realValueOriginal = indicator.realValue;
				target.targetValueOriginal = indicator.targetValue;
				target.infoRegisters = indicator.infoRegisters;				
				done();
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

IndicatorValue.schema.pre('save', function(done) {
	if (this.indicator != null) {
		this.addInfoRegisters(this, done);
	} 
	else {
		process.nextTick(done);
	}
});

/**
 * Registration
 */
IndicatorValue.defaultColumns = 'indicator, startYear, realValue, state';
IndicatorValue.defaultSort = 'startYear';
IndicatorValue.register();
