import { useGLTF, MeshRefractionMaterial, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {diamondEdgeMaterial, diamondMaterial, transparentMat} from './materials/ProjectMaterials'

import ColorScheme from 'color-scheme'
import { PhoneDayCounters, DAY_FRAMER } from  './helpers/VisualsDataExchange'
import {GetRandColor} from './helpers/ColorHelpers'

// Materials
const materialEdges = new THREE.MeshPhongMaterial({
	color: 0xff00ff, 
	// wireframe: true },
	transparent: true,
	opacity: 0.8
});

export const TikTokCategories = {
	'Comedy': { cat_id: 1, name: 'Comedy' },
	'Entertainment': { cat_id: 2, name: 'Entertainment' },
	'Daily Life': { cat_id: 3, name: 'Daily Life' },
	'Sports': { cat_id: 4, name: 'Sports' },
	'Vehicle': { cat_id: 5, name: 'Vehicle' },
	'Gaming': { cat_id: 6, name: 'Gaming' },
	'Music': { cat_id: 7, name: 'Music' },
	'Fitness/Health': { cat_id: 8, name: 'Fitness/Health' },
	'Science/Education': { cat_id: 9, name: 'Science/Education' },
	'Beauty/Style': { cat_id: 10, name: 'Beauty/Style' },
	'Food': { cat_id: 11, name: 'Food' },
	'Motivation/Advice': { cat_id: 12, name: 'Motivation/Advice' },
	'Family': { cat_id: 13, name: 'Family' },
	'Dance': { cat_id: 14, name: 'Dance' },
	'Outdoors': { cat_id: 15, name: 'Outdoors' },
	'Art': { cat_id: 16, name: 'Art' },
	'Home/Garden': { cat_id: 17, name: 'Home/Garden' },
	'Satisfying': { cat_id: 18, name: 'Satisfying' },
	'Travel': { cat_id: 19, name: 'Travel' },
	'Life Hacks': { cat_id: 20, name: 'Life Hacks' },
	'Anime': { cat_id: 21, name: 'Anime' },
	'DIY': { cat_id: 22, name: 'DIY' },
	'Shopping': { cat_id: 25, name: 'Shopping' },
	'Animals': { cat_id: 26, name: 'Animals' },
	'Religion': { cat_id: 27, name: 'Religion' }	
}

export const TikTokCatsOrder = [
	'Comedy',
	'Entertainment',
	'Travel',
	'Family',
	'Motivation/Advice',
	'Beauty/Style',
	'Sports',
	'Food',
	'Daily Life',
	'Gaming',
	'Music',
	'Science/Education',
	'Fitness/Health',
	'Animals',
	'Shopping',
	'Satisfying',
	'Vehicle',
	'Home/Garden',
	'Anime',
	'Art',
	'Religion',
	'Dance',
	'Outdoors',
	'DIY',
	'Life Hacks',
];

function calcSelectionPercentages(dayCats, cats2Show) {
	let totalVids = 0
	const activeDayCats = {} // [...dayCats]
	for(let index in dayCats) {
		const catName = dayCats[index].name
		if(cats2Show.indexOf(catName) != -1) {
			totalVids+= dayCats[index].amount
			activeDayCats[index] = dayCats[index]
		}
	}
	// console.log(activeDayCats)
	for(let index in activeDayCats) {
		let dayData = activeDayCats[index] 
		let perc = (dayData.amount / totalVids) * 100
		activeDayCats[index].percentage = perc
	}
	// console.log(dayCats, activeDayCats)
	return activeDayCats
}
function animateDiamondColors(animationProps) {
	let activeDay     = animationProps.dayFrame
	let dayCats       = animationProps.grid[activeDay]
	// console.log('dayCats', animationProps.grid)
	const diamondsRef = animationProps.ref2Set

	// console.log('animateDiamondColors!', animationProps)

	let cats2Show = animationProps.cats2Show
	let resetPercentages = false
	if(cats2Show!='*') { 
		cats2Show = cats2Show.split(',') 
		resetPercentages = true
	}
	if(resetPercentages) {
		dayCats = calcSelectionPercentages(dayCats, cats2Show)
	}
	// console.log('dayCats?', dayCats)
	// ,
	// console.log('cats2Show', cats2Show)

	// console.log('diamondsPlaced', dayCats)
	const DiamondsEditSettings = {}

	let totalDiamonds = 0
	let Cat2Index = {}
	// Sort categories in same order, makes more sense visually
	for(let index in dayCats) {
		Cat2Index[ dayCats[index].name ] = index
	}
	// console.log('Cat2Index', Cat2Index, TikTokCatsOrder, 'dayCats', dayCats)
	let cat_i = 0
	for(let CatName of TikTokCatsOrder) {
		let DayCatI = Cat2Index[CatName]
		if(dayCats[DayCatI]) {
			let dayData = dayCats[DayCatI]
			// console.log(this)
			if(dayData) {
				let numDiamonds = Math.round( animationProps.diamondsPlaced * (dayData.percentage / 100) )
				// console.log('numDiamonds', numDiamonds)
				let catName = CatName
				totalDiamonds+= numDiamonds;

				DiamondsEditSettings[cat_i] = {
					numDiamonds: numDiamonds,
					material: TikTokCategories[catName].material,
					name: TikTokCategories[catName].name,
				}
			}
		}
		cat_i++;
	}
	// Go on then! Change some diamonds
	let diamonds_i = 0
	for(let index in DiamondsEditSettings) {
		let dSet = DiamondsEditSettings[index]
		let numD = parseInt( dSet.numDiamonds )

		// console.log(diamonds_i, '- - - -- - - ', dSet.color)
		for(let dI = diamonds_i; dI < ( diamonds_i + numD ); dI++ ) {
			let diamondGrp = diamondsRef.current[dI]
			if(diamondGrp) {
				diamondGrp.children[0].material = dSet.material
			}
		}

		diamonds_i+= numD
	}
}

function setCatColors(displayColor) {
	// Color not? Generate a random one
	if(!displayColor) { displayColor = GetRandColor(); }

	let numCats = Object.keys(TikTokCategories).length

	let colorSet01 = getColors( displayColor.getHexString() )
	let lastColor = colorSet01[ colorSet01.length - 1 ]
	colorSet01.pop() // remove the last one from options01
	// Get some extra ones based on the last one
	let colorSet02 = getColors( lastColor )
	// put all together
	const ColorOps = colorSet01.concat(colorSet02);
	// Assign them to cats
	let sameyColorIndexes = [1,6,21]
	let catI = 0;	
	for(let dayI in TikTokCategories) {
		const setMat = diamondMaterial.clone()
		if(sameyColorIndexes.indexOf(catI) != -1) { catI++ } // skip one samey color
		setMat.color = new THREE.Color( '#' + ColorOps[catI] )
		TikTokCategories[dayI].material = setMat
		catI++
	}
}

function getColors(startHex) {
	var s = new ColorScheme;
	s.from_hex( startHex )
	s.variation('hard');
	var colorOptions = s.scheme('tetrade')
	.distance(.9)
	.colors();	
	return colorOptions;
}

export default function DiamondsGrid({
	grid, 
	meshGeom, 
	displayColor, 
	shapeType, 
	playBackSpeed, 
	visualID, 
	cats2Show, 
	gridSize
}) {

	let boxes = []

	// console.log('gridSize',gridSize, 'cats2Show', cats2Show)

	const diamondsPlaced = useRef([])

	const perX = 25
	const perY = (gridSize == 'full') ? 40 : 4
	const marge = 0.1

   	const diamonds2Place = perX * perY

   	const diamondsMat = diamondMaterial.clone()
   	diamondsMat.color = displayColor


    const DiamondsGridBase = useMemo(() => {
		let diamondsInGrid = []

		for(let diamond_i = 0; diamond_i < diamonds2Place; diamond_i++) {
			let key = `diamond-in-grid--${diamond_i}`

			let pos_x = diamond_i%perX
			pos_x+= pos_x * marge
			let pos_y = Math.floor( diamond_i / perX )
			pos_y+= pos_y * marge

			// let pos_y = diamond_i%perY
			// console.log('pos_y', pos_y)

			const diamond = <group
					name={key}
					position={[pos_x,pos_y,0]} 
					key={key}
					ref={ (element) => diamondsPlaced.current[diamond_i] = element }
					rotation={[Math.PI * -.5, 0, 0]}
				>
					<mesh 
						geometry={meshGeom}
						material={diamondsMat}
						name="diamondBase"
					/>
					{/*
					<mesh 
						geometry={meshGeom}
						material={diamondEdgeMaterial}
					/>*/}
				</group>

			diamondsInGrid.push(diamond)
		}

		setCatColors(displayColor)

    	return diamondsInGrid
    }, [displayColor, gridSize])

	// console.log(diamondsPlaced)

	// Animate them
	const maxFrames = 100;
	let frame_i = 0;
	let prevDayFrame = -1
	let dayFrame = DAY_FRAMER.day
	let animationReset = false;
	let dayFrameMin = maxFrames - 1;

	let ref2Set = diamondsPlaced;
	
	useFrame((state) => {
		// return false;

		const time = state.clock.getElapsedTime()
		frame_i++;
		// Blocks left to grow ?
		// if(dayFrame < maxFrames) {
			// animationReset = false;

			if(prevDayFrame != DAY_FRAMER.day) {
				prevDayFrame = DAY_FRAMER.day
				dayFrame = DAY_FRAMER.day
			// }
			// if(frame_i%playBackSpeed === 0) {
				let animateProps = {
					ref2Set: diamondsPlaced, 
					cats2Show,
					diamondsPlaced: diamonds2Place,
					grid, 
					dayFrame, 
					reset: false 
				}
				animateDiamondColors(animateProps)
				PhoneDayCounters[visualID] = dayFrame
				dayFrame++;
			}
		// Revert back to 0
		// } else {
			// dayFrame = 0;
		// }
	})

   	const set2ZeroY = -.1 //
   	const baseW = 27.5
   	const baseH = (gridSize == 'full') ? 43.5 : 4
	const DayBoxBaseGeom = new THREE.BoxGeometry(baseW, baseH, .001);
	

	// console.log('DiamondsGridBase',DiamondsGridBase)
	return (
		<group position={[-.5,set2ZeroY,0]} rotation={[Math.PI * .5, 0, Math.PI]} name="vis_type_wrapper">
			{DiamondsGridBase}
			<mesh geometry={DayBoxBaseGeom} position={[(baseW / 2) , (baseH / 2), 0]} material={transparentMat} />
	</group>
	)
}