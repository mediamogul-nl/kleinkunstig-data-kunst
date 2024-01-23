import {VisHasOptionShapeAndCurShape} from './constants/DataVisSettings'


export function GetUserLog() {
	console.log(USR_ACT_TIMELINE)
	console.log(USR_ACT_COUNTERS)
}

export const USR_ACT_TIMELINE = {}

export const UAC_FRAMED_TIMELINE = {}

export const USR_ACT_COUNTERS = {
	adds: 0,
	edits: 0,
	deletes: 0,
	info: 0,
	visType_DayBoxes: 0,
	visType_DayHeightMap: 0,
	visType_CreatorHeightmap: 0,
	visType_DiamondsRing: 0,
	visType_PopSocket: 0,
	visType_BigSingleShape: 0,
	visType_DiamondsGrid: 0,
	shapeType_cube: 0,
	shapeType_piramid: 0,
	shapeType_capsule: 0,
	shapeType_diamond: 0,
	shapeType_emerald: 0,
	shapeType_heart: 0,
	shapeType_flower: 0,
	shapeType_rose: 0,
	shapeType_skull: 0,
	drags: 0,
	creators: [],
	hashtags: [],
	searches: [],
	randomTags: 0,
	categories: [],
	swatchesGenerated: 0,
	color: {
		r: 0,
		g: 0,
		b: 0
	},
}

export const UAC_visual_id = 'uac-visual'

/*
× Visual toegevoegd
× Visual aangepast
× Visual verwijderd
× Info aangeklikt
× Gekozen visual: Blokkengrid
× Gekozen visual: Geanimeerde heightmap voor een hashtag
× Gekozen visual: Geanimeerde heightmap voor een creator
× Gekozen visual: Ring om de telefoon
× Gekozen visual: Pop Socket
× Gekozen visual: Diamanten Gridje van de categorien
× Gekozen visual vorm: Cube
× Gekozen visual vorm: Piramid
× Gekozen visual vorm: Capsule
× Gekozen visual vorm: Diamond
× Gekozen visual vorm: Emerald
× Gekozen visual vorm: Heart
× Gekozen visual vorm: Bloem
× Gekozen visual vorm: Roos
× Gekozen visual vorm: Skull
× Model verslapen (om van andere kant te bekijken)
× Aantal geselecteerde Creators 
× Aantal geselecteerde Hashtags
× Aantal geselecteerde Categories
× Aantal keer gezocht op tag / creator
× Aantal keer 'Random tag / creator' geklikt
× Nieuwe kleur opties gegenereerd

» Voorkeurskleur (gemiddelde tint van alle gekozen kleuren voor de visuals)
*/

export function UserLog(event) {
	const logTime = Date.now()

	const keys_2_incr = []
	// console.log(event)
	// USR_ACT_TIMELINE[logTime] = event
	
	let ADD_2_TIMELINE = false

	// Parse some data directly
	if(
		event.hasOwnProperty('AddedVisual')
		||
		event.hasOwnProperty('EditedVisual')
	) {
		const visualData = (event.hasOwnProperty('EditedVisual')) ? event.EditedVisual : event.AddedVisual
		// console.log('visualData', visualData, event)
		if(event.hasOwnProperty('EditedVisual')) {
			keys_2_incr.push('edits')
			USR_ACT_COUNTERS.edits++
		} else {
			keys_2_incr.push('adds')
			USR_ACT_COUNTERS.adds++
		}
		ADD_2_TIMELINE = true
			
		// Visual type
		if(visualData.hasOwnProperty('visType')) {
			let vt        = visualData.visType
			let checkShape = true
			// merge diamondgrid options
			if(vt.indexOf('DiamondsGrid')!= -1) { 
				vt = 'DiamondsGrid' 
				checkShape = false
			}
			// Set count key
			let visType_count_key = 'visType_' + vt
			USR_ACT_COUNTERS[visType_count_key]++

			keys_2_incr.push(visType_count_key)
			// Count the shapes
			if(
				checkShape 
				&& 
				visualData.shapeType 
				&& 
				VisHasOptionShapeAndCurShape(vt, visualData.shapeType)
			) {
				let shapeType_count_key = 'shapeType_' + visualData.shapeType
				USR_ACT_COUNTERS[shapeType_count_key]++
				keys_2_incr.push(shapeType_count_key)
			}
		}
		// console.log(visualData)
		// Colors chosen
		if(visualData.hasOwnProperty('displayColor')) {
			USR_ACT_COUNTERS.color.r+= visualData.displayColor.r
			USR_ACT_COUNTERS.color.g+= visualData.displayColor.g
			USR_ACT_COUNTERS.color.b+= visualData.displayColor.b
		} else {
			console.log('no display color', visualData)
		}
	}
	// Deleted
	if(event.hasOwnProperty('DeletedVisual')) {
		ADD_2_TIMELINE = true
		USR_ACT_COUNTERS.deletes++
		keys_2_incr.push('deletes')
	}
	// Info 
	if(event.hasOwnProperty('visualEditBtnClick') && event.visualEditBtnClick == 'info') {
		ADD_2_TIMELINE = true
		USR_ACT_COUNTERS.info++
		keys_2_incr.push('info')
	}
	// Swatches generated
	if(event.hasOwnProperty('ColorOptions') && event.ColorOptions == 'generated_new_options') {
		ADD_2_TIMELINE = true
		USR_ACT_COUNTERS.swatchesGenerated++	
		keys_2_incr.push('swatchesGenerated')
	}
	// Data loaded
	if(event.hasOwnProperty('DataLoad')) {
		ADD_2_TIMELINE = true
		let datamode = event.DataLoad.mode
		let datatag =  event.DataLoad.tag
		if(datamode.indexOf('creator')!=-1) {
			USR_ACT_COUNTERS.creators.push( datatag )
			keys_2_incr.push('creators')
		} else if(datamode.indexOf('categor')!=-1) {
			USR_ACT_COUNTERS.categories.push( datatag )
			keys_2_incr.push('categories')
		} else {
			USR_ACT_COUNTERS.hashtags.push( datatag )
			keys_2_incr.push('hashtags')
		}
	}
	// Search
	if(event.hasOwnProperty('SearchResultClicked')) {
		ADD_2_TIMELINE = true
		USR_ACT_COUNTERS.searches.push( event.SearchResultClicked )
		keys_2_incr.push('searches')
	}
	// Drags
	if(event.hasOwnProperty('phoneCover') && event.phoneCover == 'dragged') {
		ADD_2_TIMELINE = true
		USR_ACT_COUNTERS.drags++	
		keys_2_incr.push('drags')
	}
	// Randoms TagOptionsTab: 'getRandOption
	if(event.hasOwnProperty('TagOptionsTab') && event.TagOptionsTab == 'getRandOption') {
		ADD_2_TIMELINE = true
		USR_ACT_COUNTERS.randomTags++
		keys_2_incr.push('randomTags')
	}

	if(ADD_2_TIMELINE!='') {
		// USR_ACT_TIMELINE[logTime] = {...USR_ACT_COUNTERS}
		USR_ACT_TIMELINE[logTime] = keys_2_incr
	}
}
