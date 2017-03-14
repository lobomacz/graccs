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
	startYear: { label: 'Fecha de comienzo', type: Types.Number, default: 2000, min: 1900, required: true, initial: true },
	realValue: { label: 'Valor ejecutado', type: Types.Number, default: 0, min: 0, required: true, initial: true },
	useDenominator: { label: 'Usar denominador', type: Types.Boolean, watch: true, value: checkIndicatorDenominator, hidden: true },
	targetValue: { label: 'Valor planificado', type: Types.Number, default: 0, min: 0, dependsOn: { useDenominator: true } },
	comparativeValue: { label: 'Valor para comparar', type: Types.Number, default: 0, min: 0 },
	isMonthlyFrequency: { label: 'Es una frecuencia mensual', type: Types.Boolean, watch: true, value: checkMonthlyFrequency, hidden: true },
	monthlyFrequency: {
		label: 'Frecuencia mensual',
		required: true,
		type: Types.Select,
		options: [
			{ value: '1', label: 'Enero' },
			{ value: '2', label: 'Febrero' },
			{ value: '3', label: 'Marzo' },
			{ value: '4', label: 'Abril' },
			{ value: '5', label: 'Mayo' },
			{ value: '6', label: 'Junio' },
			{ value: '7', label: 'Julio' },
			{ value: '8', label: 'Agosto' },
			{ value: '9', label: 'Septiembre' },
			{ value: '10', label: 'Octubre' },
			{ value: '11', label: 'Noviembre' },
			{ value: '12', label: 'Diciembre' }
		],
		default: '1',
		dependsOn: { isMonthlyFrequency: true }
	},
	isQuarterlyFrequency: { label: 'Es una frecuencia trimestral', type: Types.Boolean, watch: true, value: checkQuarterlyFrequency, hidden: true },
	quarterlyFrequency: {
		label: 'Frecuencia trimestral',
		required: true,
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
		type: Types.Select,
		options: [
			{ value: '1', label: 'I Semestre' },
			{ value: '2', label: 'II Semestre' }
		],
		default: '1',
		dependsOn: { isBiannualFrequency: true }
	},
	/*nationalArea: { label: 'Desagregación Nacional', type: Types.Relationship, ref: 'NationalArea', many: false, dependsOn: { areaType: 'national' } },*/
	isDepartmentArea: { label: 'Es una desagregación departamental', type: Types.Boolean, watch: true, value: checkDepartmentArea, hidden: true },
	departmentArea: { label: 'Desagregación Departamental (regional)', type: Types.Relationship, ref: 'DepartmentalArea', many: false, dependsOn: { isDepartmentArea: true } },
	isMunicipalArea: { label: 'Es una desagregación municipal', type: Types.Boolean, watch: true, value: checkMunicipalArea, hidden: true },
	municipalArea: { label: 'Desagregación Municipal', type: Types.Relationship, ref: 'MunicipalArea', many: false, dependsOn: { isMunicipalArea: true } },
	isCommunityArea: { label: 'Es una desagregación urbano-rural', type: Types.Boolean, watch: true, value: checkCommunityArea, hidden: true },
	communityArea: { label: 'Desagregación Urbano-Rural (comunidad)', type: Types.Relationship, ref: 'CommunityArea', many: false, dependsOn: { isCommunityArea: true } },
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

		console.log(ind);
		callback(null, ind.frequency === 'monthly');
	});
}

function checkQuarterlyFrequency(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		console.log(ind);
		callback(null, ind.frequency === 'quarterly');
	});
}

function checkBiannualFrequency(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		console.log(ind);
		callback(null, ind.frequency === 'biannual');
	});
}

function checkDepartmentArea(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		console.log(ind);
		callback(null, ind.minAreaToApply === 'department');
	});
}

function checkMunicipalArea(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		console.log(ind);
		callback(null, ind.minAreaToApply === 'municipal');
	});
}

function checkCommunityArea(callback) {
	var q = keystone.list('Indicator').model.findById(this.indicator);

	q.exec(function (err, ind) {
		if (err || !ind) {
			return callback(err);
		}

		console.log(ind);
		callback(null, ind.minAreaToApply === 'community');
	});
}

/**
 * Registration
 */
IndicatorValue.defaultColumns = 'indicator, startYear, realValue';
IndicatorValue.defaultSort = 'startYear';
IndicatorValue.register();
