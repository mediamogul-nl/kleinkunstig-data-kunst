export const DATA_OPTIONS = {
	hashtag: {
		name: 'hashtag',
		visual_options: [
			'DayBoxes',
			'DayHeightMap',
			'PopSocket',
			'BigSingleShape',
			'DiamondsRing',
		],
		variations: ['hashtag100', 'hashtag']
	},
	creator: {
		name: 'creator',
		visual_options: [
			'CreatorHeightmap',
			// 'DayHeightMap',
			'PopSocket',
			'BigSingleShape',
			'DiamondsRing'		
		],
		variations: ['creator100', 'creator', 'creatorgridindexed', 'creatormulti']
	},
	categories: {
		name: 'categories',
		grid_options: {
			100: 'DiamondsGridMini',
			10000: 'DiamondsGrid',
		},
		variations: ['categories', 'categorie', 'categories1000']
	}
}
const MAX_SQUARES = 6
const TXT_positions = ['top', 'bottom', 'left', 'right']
const TXT_SETTINGS = {
	statsOptions: ['day', 'minmax'],
	positions: TXT_positions
}
export const VISUAL_OPTIONS = {
	DayBoxes: {
		animated: true,
		shape: 'square',
		move: true,
		dimensions: [10, 10],
		scale: true,
		scaleSettings: { min: 10, max: 100 },
		scaleInit: [1.032,1.032,1.032],
		max: MAX_SQUARES,
		txtSettings: TXT_SETTINGS
	},
	DayHeightMap: {
		animated: true,
		shape: 'square',
		move: true,
		dimensions: [12, 12],
		scale: true,
		scaleSettings: { min: 10, max: 100 },
		scaleInit: [.87,.87,.87],
		max: MAX_SQUARES,
		txtSettings: TXT_SETTINGS
	},
	CreatorHeightmap: {
		animated: true,
		shape: 'square',
		move: true,
		dimensions: [10.4, 10.4],
		scale: true,
		scaleSettings: { min: 10, max: 100 },
		// scaleInit: [.104,.055,.104],
		scaleInit: [1, 1, 1],
		max: MAX_SQUARES,
		txtSettings: TXT_SETTINGS
	},
	DiamondsGrid: {
		animated: true,
		shape: 'square',
		move: true,
		dimensions: [27.5, 43.5],
		scale: true,
		scaleSettings: { min: 10, max: 100 },
		scaleInit: [.375,.375,.375],
		max: MAX_SQUARES,
		txtSettings: false
	},
	DiamondsGridMini: {
		animated: true,
		shape: 'rectangle',
		move: true,
		dimensions: [27.5, 4],
		scale: true,
		scaleSettings: { min: 10, max: 100 },
		scaleInit: [.375,.375,.375],
		max: 2,
		txtSettings: false
	},
	DiamondsRing: {
		animated: false,
		shape: 'outside',
		move: false,
		dimensions: [11.5, 23.3],
		scale: false,
		max: 1,
		txtSettings: { 
			statsOptions: ['minmax'],
			positions: TXT_positions
		}
	},
	PopSocket: {
		animated: true,
		shape: 'single',
		move: true,
		dimensions: [5, 5],
		scale: true,
		scaleSettings: { min: 30, max: 150 },
		scaleInit: [1,1,1],
		max: 1,
		txtSettings: TXT_SETTINGS
	},
	BigSingleShape: {
		animated: true,
		shape: 'single',
		move: true,
		dimensions: [5, 5],
		scale: true,
		scaleSettings: { min: 30, max: 150 },
		scaleInit: [1,1,1],
		max: 20,
		txtSettings: TXT_SETTINGS
	},

}
export const VISUAL_OPTION_SHAPES = {
	DayBoxes: [
		'cube',
		'piramid',
		'capsule',
		'diamond',
		'emerald',
		'heart'
	],
	DiamondsRing: [
		'flower',
		'diamond',
		'heart'
	],
	PopSocket: [
		'flower',
		'diamond',
		'heart',
		'rose',
		'skull',
	],
	BigSingleShape: [
		'flower',
		'diamond',
		'heart',
		'rose',
		'skull',
	]
}

export function getVisType(visualData) {
	let visType = visualData.visType
	if('DiamondsGrid' == visType) {
		visType = visualData.shapeType
	}
	return visType
}

export const phonePosition = [0,0,0]//2,11.5,9]

export function VisHasOptionShape(visType) {
	return VISUAL_OPTION_SHAPES.hasOwnProperty(visType)
}
export function VisHasOptionShapeAndCurShape(visType,shapeType) {
	let return_val = false
	let has_vis_ops = VISUAL_OPTION_SHAPES.hasOwnProperty(visType) 
	if(!has_vis_ops) { return true }
	if( 
		shapeType
		&&
		has_vis_ops
		&&
		VISUAL_OPTION_SHAPES[visType].indexOf(shapeType) != -1
	) {
		return_val = true
	}
	return return_val
}
export function VisHasOptionSpeed(visType) {
	return (visType && VISUAL_OPTIONS[visType].animated)
}
export function VisHasVisualOptions(visualData) {
	let hasVisualOptions = false
	if(visualData.hasOwnProperty('dataTag') && DATA_OPTIONS[visualData.dataType].hasOwnProperty('visual_options')) {
		hasVisualOptions = true
	}
	return hasVisualOptions
}
export function VisHasGridOptions(visualData) {
	let hasGridOptions = false
	if(visualData.hasOwnProperty('dataType') && DATA_OPTIONS[visualData.dataType].hasOwnProperty('grid_options')) {
		hasGridOptions = true
	}
	return hasGridOptions
}

