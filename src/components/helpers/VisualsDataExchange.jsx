import { useState, useEffect } from 'react'
import useAnimationFrame from './useAnimationFrame'

export const PhoneDayCounters = {}
export const ActiveVisuals = {}
export const EditorState = {}

export let EDTR_ACTIVE_DATA = {}
export function SetEdtrActiveData(data) {
	EDTR_ACTIVE_DATA = data
}

export function getMyCounters() {
	console.log('PhoneDayCounters?', PhoneDayCounters)
}

const mob_break_point = 900
export const RESPONSIVE_MODE = (window.innerWidth < mob_break_point)

export const SHARE_SETTINGS = { sharing: false }

export const VisualObjects3D = {}

export function getVisualObject3D(visualID) {
	if(VisualObjects3D.hasOwnProperty(visualID)) {
		return VisualObjects3D[visualID]
	} else {
		return null
	}
}
export function setVisualObject3D(visualID, element) {
	VisualObjects3D[visualID] = element
}



// Start animating boiii
export const DAY_FRAMER = { 
	started: false,
	day: 0,
	speed: 15,
	speedDefault: 15,
	maxFrames: 100
}

