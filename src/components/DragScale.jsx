import { OrbitControls, useTexture, Text3D, CameraControls, Environment, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

import {PhoneDayCounters, getMyCounters, ActiveVisuals, EditorState, EDTR_ACTIVE_DATA, RESPONSIVE_MODE} from './helpers/VisualsDataExchange'

import { VisHasOptionSpeed, VISUAL_OPTIONS, getVisType } from  './constants/DataVisSettings'
import {PopSocketLikeVis} from './TextDisplay'
import { PHONE_DIMS } from './Layouter' 

/*     __                
  ____/ /________ _____ _
 / __  / ___/ __ `/ __ `/
/ /_/ / /  / /_/ / /_/ / 
\__,_/_/   \__,_/\__, /  
                /___*/

let prevDrag = {}
let dragActive = false
let dragCount = -1
let DRAG_aspect

export const SCALE_PRESSED = {
	up: false,
	down: false,
	visIndex: -1
}
export function reset_scale_pressed() {
	SCALE_PRESSED.up = false
	SCALE_PRESSED.down = false
	SCALE_PRESSED.visIndex = -1
}
export function setDragAR(U3_objects) {
	DRAG_aspect = U3_objects.size.width / U3_objects.viewport.width
}
/*
export function getVisualBoundingBox(objRef, visIndex, updateBox) {
	if(!ActiveVisuals[visIndex].hasOwnProperty('cur_boundbox') || updateBox) {
		let actual_vis = objRef.getObjectByName('vis_type_wrapper');
		let bb         = new THREE.Box3().setFromObject(actual_vis);
		let size       = bb.getSize(new THREE.Vector3());
		console.log('getVisualBoundingBox:',  visIndex, size, actual_vis)
		// Update ActiveVisuals 
		ActiveVisuals[visIndex].cur_boundbox = size
	}
	return ActiveVisuals[visIndex].cur_boundbox
}
*/
export function getVisualBoundingBox(visType, visIndex, updateBox, initSettingsOnly = false) {
	// console.log('getVisualBoundingBox', visIndex, ActiveVisuals)
	
	if(ActiveVisuals[visIndex]) {
		if(!ActiveVisuals[visIndex].hasOwnProperty('cur_boundbox') || updateBox) {
			let cur_scale = ActiveVisuals[visIndex].hasOwnProperty('scale_percentage') ? ActiveVisuals[visIndex].scale_percentage : 100
			let cur_scale_mltplr = cur_scale / 100
			if(initSettingsOnly) { cur_scale_mltplr = 1}
			let init_size = VISUAL_OPTIONS[visType].dimensions
			let size = {
				x: init_size[0] * cur_scale_mltplr,
				y: init_size[1] * cur_scale_mltplr,
			}
			if(initSettingsOnly) { return size }
			// Init scaled ?
			if(VISUAL_OPTIONS[visType].hasOwnProperty('scaleInit')) {
				size.x  *= VISUAL_OPTIONS[visType].scaleInit[0]
				size.y  *= VISUAL_OPTIONS[visType].scaleInit[1]
			}
			// Update ActiveVisuals 
			ActiveVisuals[visIndex].cur_boundbox = size
		}
		return ActiveVisuals[visIndex].cur_boundbox
	}
}
// Make sure after scaling it still sits inbetween the bounds
export function fit2Bounds(objRef, phoneData) {
	if(objRef) {
		let curPos = objRef.position
		let bounds = DragBounds(curPos.x, curPos.z, phoneData)
		objRef.position.set( bounds[0], curPos.y, bounds[1] )
	}
}
function getVisualSize(phoneData, visType) {
	let index = phoneData.index
	if(ActiveVisuals[index]) {
		// console.log('YES WELLOS in active visuals babyyy')
		return getVisualBoundingBox( visType, index)
	} else {
		// console.log('not in active visuals babyyy')
		return getVisualBoundingBox( visType, index, true)
	}
}
function DragBounds(x, z, phoneData) {

	// console.log(phoneData)

	const index   = phoneData.index
	const visType = getVisType(phoneData.visualData)

	let size = getVisualSize(phoneData, visType)
	// console.log('DragBounds:size', size)

	let MAX_LEFT  = (!PopSocketLikeVis(visType)) ? 0 : PHONE_DIMS.w / 2
	let MAX_RIGHT = (!PopSocketLikeVis(visType)) ? -1 * ( PHONE_DIMS.w - size.x ) : -1 * ( PHONE_DIMS.w / 2 )
	let MAX_TOP   = PHONE_DIMS.h / 2
	let MAX_BOT   = -1 * ( MAX_TOP -  size.y)

	// console.log('MAX_TOP', MAX_TOP, 'MAX_BOT', MAX_BOT, size, z)

	// socket? bottom ring determines 
	if(PopSocketLikeVis(visType)) {  
		MAX_LEFT  -= 1
		MAX_RIGHT += 1
		MAX_TOP   -= 1
		MAX_BOT   = -1 * (PHONE_DIMS.h / 2) + 1
	}

	// Right Side
	if(x < MAX_RIGHT) { x = MAX_RIGHT }
	// Left side
	if(x > MAX_LEFT) { x = MAX_LEFT }
	// Top side
	if(z > MAX_TOP) { z = MAX_TOP }
	// Bot side
	if(z < MAX_BOT) { z = MAX_BOT }
	
	return [x, z]

}

export function DragVisual(objRef, dragData, phoneData) {
	// console.log('draggins!: ', dragData.event)
	// console.log('curPos', curPos)

	const visIndex = phoneData.index

	// console.log(phoneData.visualData)
	if(!dragActive) {
		getVisualBoundingBox( getVisType(phoneData.visualData), visIndex, false)
	}

	if(!dragData.active) {

		prevDrag = {}
		dragActive = false
		dragCount = -1
		// Update the ActiveVisuals instance position
		let StoredVisual = ActiveVisuals[visIndex]
		StoredVisual.position = [...objRef.position]
		// console.log('- - - - - DRAG STOPPED- - - - - - - - - - ')

	} else {
		// Determine increment..
		const incrVal = .05
		if(prevDrag.hasOwnProperty('x')) {
			/*
			let offset_x = prevDrag.x - dragData.x
			let offset_y = prevDrag.y - dragData.y
			let yIncr = (offset_y < 0) ? -1 * incrVal : incrVal;
			let xIncr = (offset_x < 0) ? -1 * incrVal : incrVal;
			objRef.position.set( curPos[0] + xIncr, curPos[1], curPos[2] + yIncr )
			*/
			const maxChange = 10
			const curPos = objRef.position
			let curX = curPos.x
			let curZ = curPos.z
			// Reset bits
			// for (let [index, pos] of curPos.entries()) { if(isNaN(pos)) { curPos[index] = 0 } }

			let offset_z = 0 // ('square' == VISUAL_OPTIONS[visType].shape) ? -10 : 0
			let offset_x = 0
			let new_x = -1 * ( dragData.x / DRAG_aspect )
			let new_z = -1 * ( dragData.y / DRAG_aspect )

			let diffX = Math.abs( curPos.x - new_x )
			// if(diffX >= maxChange) { offset_x = (new_x > curPos.x) ? -1 * diffX :  diffX }
			// if(!dragActive) { new_x = curX + 0.01 }
			let diffZ = Math.abs( curPos.z - new_z )

			// if(diffZ >= maxChange) { new_z = curZ + 0.01 }
			// if(!dragActive) { new_z = curZ + 0.01 }
			if(!dragActive) {
				// getVisualBoundingBox(objRef, visIndex, true)
			// if(diffZ >= maxChange) {
				// if(diffZ >= maxChange) { offset_z = (new_z > curPos.z) ? diffZ : -1 * diffZ  }
				new_x = curPos.x
				new_z = curPos.z
			}
			// console.log('curPos', [...curPos], [new_x, curPos.y, new_z], diffX, diffZ, 'offset_z:', offset_z)
			new_x += offset_x
			new_z += offset_z
			/*  __                          __           _           __
			   / /_  ____  __  ______  ____/ /___ ______(_)__  _____/ /
			  / __ \/ __ \/ / / / __ \/ __  / __ `/ ___/ / _ \/ ___/ / 
			 / /_/ / /_/ / /_/ / / / / /_/ / /_/ / /  / /  __(__  )_/  
			/_.___/\____/\__,_/_/ /_/\__,_/\__,_/_/  /_/\___/____(*/
			let bounded_coords = DragBounds( new_x, new_z, phoneData )

			objRef.position.set( bounded_coords[0], curPos.y, bounded_coords[1] )

			dragActive = true
			dragCount++
		}

		prevDrag = {x: dragData.x, y: dragData.y, }
	}
}

/*                  __   
   ______________ _/ /__ 
  / ___/ ___/ __ `/ / _ \
 (__  ) /__/ /_/ / /  __/
/____/\___/\__,_/_/\__*/

export function ScaleVisual(objRef, mode, phoneData) {
	let vis2Scale = objRef.getObjectByName('vis_scaler')

	if(
		vis2Scale 
		&& 
		(SCALE_PRESSED.up || SCALE_PRESSED.down)
	) {
		const scaleIncr = 5 // percentage step

		const visIndex  = phoneData.index
		const visType   = getVisType(phoneData.visualData)

		vis2Scale = vis2Scale.children[0]
		
		// Set scale percentage to ActiveVisuals		
		if(!ActiveVisuals[visIndex].hasOwnProperty('scale_percentage')) {
			ActiveVisuals[visIndex].scale_percentage = 100
		}
		
		const initScale    = VISUAL_OPTIONS[visType].scaleInit
		const curScalePerc = ActiveVisuals[visIndex].scale_percentage

		// Scalesettings
		const scaleSettings = VISUAL_OPTIONS[visType].scaleSettings
		let newScalePerc = 100
		switch(mode) {
			case 'scale_down':
				newScalePerc = curScalePerc - scaleIncr
				if(newScalePerc < scaleSettings.min) { newScalePerc = scaleSettings.min }
			  break;
			case 'scale_up':
				newScalePerc = curScalePerc + scaleIncr
				if(newScalePerc > scaleSettings.max) { newScalePerc = scaleSettings.max }
			  break;
		}
		if(curScalePerc != newScalePerc) {
			let ScaleMultiplier = (newScalePerc / 100)
			// const curScale = [...vis2Scale.scale]
			// let scaleIncr = ('scale_down' == mode) ? .9 : 1.1;
			// console.log('curScale', curScale, 'scaleIncr', scaleIncr)
			vis2Scale.scale.set(initScale[0] * ScaleMultiplier, initScale[1] * ScaleMultiplier, initScale[2] * ScaleMultiplier )
			// Update Global
			ActiveVisuals[visIndex].scale_percentage = newScalePerc

			// Update editor buttons position
			if(PopSocketLikeVis(visType)) {
				let ctrl_pos = getCTRLPos(visType, visIndex)
				let edit_btns = objRef.getObjectByName('edit_btns')
				edit_btns.position.set(ctrl_pos[0], ctrl_pos[1], ctrl_pos[2]   )
			}
			getVisualBoundingBox( visType, visIndex, true)
			fit2Bounds(objRef, phoneData)
		} else {
			reset_scale_pressed()
		}
	}
}

export function getCTRLPos(visType, index) {
	let ctrl_pos = [5.7, -.4, 0.07]
	if(PopSocketLikeVis(visType)) {
		let pos_y = ('PopSocket' == visType) ? 2.6 : 0
		let pos_x = 3.15
		if(ActiveVisuals[index].scale_percentage != 100) {
			let percMultiplier = ActiveVisuals[index].scale_percentage / 100
			pos_y *= percMultiplier
			pos_x *= percMultiplier
		}
		ctrl_pos = [pos_x, pos_y, 1.55]
	} else if('DiamondsRing' == visType) {
		ctrl_pos = [6.2,-.4,10.4]
	}
	return ctrl_pos
}
