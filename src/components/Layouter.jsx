import { Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useMemo, useRef, useEffect  } from 'react'

import { ActiveVisuals, EditorState, EDTR_ACTIVE_DATA} from './helpers/VisualsDataExchange'

import { DATA_OPTIONS, VISUAL_OPTIONS, VisHasOptionSpeed, phonePosition } from  './constants/DataVisSettings'

export const shapeCounter = {
	square: 0,
	rectangle: 0,
	single: 0,
	outside: 0
}
export const PHONE_DIMS = {w: 10.41, h: 21.72} // W & H of the phone base


const GB_PER_X = 3
const GB_PER_Y = 6
const GB_MARGIN = 0.01
const GB_BOX_W = 3.43

const GR_W = (GB_PER_X * GB_BOX_W) + (GB_PER_X * GB_MARGIN)
const GR_H = (GB_PER_Y * GB_BOX_W) + (GB_PER_Y * GB_MARGIN)


export function LayoutVisuals(visualsPlaced) {
	// console.log('LayoutVisuals!', visualsPlaced)

	const placedVisuals = visualsPlaced.current

	let numVisuals = 0
	let numSquares = 0
	let numRects = 0
	let numSingles = 0
	let numOutside = 0

	const visualsOrder = []

	const resetShapeCounter = () => {
		for(let key in shapeCounter) { shapeCounter[key] = 0 }
	}
	resetShapeCounter()

	const setVisualShapeIndexes = () => {
		// First update the shapeIndex of the actual visuals in the ref
		for(let vis_i in placedVisuals) {
			// console.log(typeof placedVisuals[vis_i])
			if(
				placedVisuals[vis_i]
				&&
				typeof placedVisuals[vis_i] === 'object'
				&&
				placedVisuals[vis_i].hasOwnProperty('isObject3D')
			) {
				const VisGroup = placedVisuals[vis_i]
				const visType = VisGroup.userData.visType
				const visShape = VISUAL_OPTIONS[visType].shape
		        const shapeIndex = shapeCounter[visShape]

		        // console.log('visType', visType, 'shape', visShape)

		        VisGroup.userData.shapeIndex = shapeIndex
		        VisGroup.userData.shape = visShape

				shapeCounter[visShape]++

				// console.log('hi obj', visType)
			}
			// if(placedVisuals)
		}
	}
	
	setVisualShapeIndexes()

	/*
	// SOME RULES..
	1 square? w100, h: Stretch it h100, Y:  top, X: 0
	2 square, w100, h: 50%, Y: #1 0, #2 50%, x: 0
	
	ook 1 rect ? dan squares hoogte aanpassen
	- < 2 squares, stretch die minder hoog

	3 squares: first 2 w50, #3 w100
	4 squares: all w50
	*/

	const H_HALF  = GR_H / 2
	const H_QUART = GR_H / 4
	const W_HALF  = GR_W / 2
	const W_QUART = GR_W / 4

	const RECT_h = 1.5

	const BtnZDflt = -111
	const BtnXDflt = -111
	const BtnYDflt = -111

	const DoVisualsLayout = () => {
		let vis_i = 0
		let numVisuals = visualsPlaced.current.length
			// console.log('DoVisualsLayout!', visualsPlaced.current)
		// return false

		if(numVisuals > 0) {
			for( let visual of visualsPlaced.current) {
				if(
					visual
					&&
					typeof visual === 'object'
					&&
					visual.hasOwnProperty('isObject3D')
				) {
					// console.log(visual.userData)
					let scaleX = 1
					let scaleY = 1
					let posX = 0
					let posZ = 0
					let shapeIndex = visual.userData.shapeIndex
					let btnsMoveZ = BtnZDflt
					let btnsMoveX = BtnXDflt
					let btnsMoveY = BtnYDflt
					// console.log(visual.userData.shape)
					switch(visual.userData.shape) {
						case 'square':
							switch(shapeCounter.square) {
								case 1:
									posZ = -H_HALF
									scaleY = 2
								  break;
								case 2:
									posZ = (shapeIndex == 0) ? 0  : -H_HALF
								  break;
								case 3:
									if(shapeIndex < 2) {
										scaleX = .5
										posX = (shapeIndex == 1) ? -1 * W_QUART : W_QUART
										posZ = 0
									} else {
										posZ = -H_HALF
									}
								  break;
								case 4:
									scaleX = .5
									posX = (shapeIndex%2==0) ? -W_QUART : W_QUART
									posZ = (shapeIndex < 2) ? 0 : -H_HALF
								  break;
								case 5:
								case 6:
									scaleX = .5
									scaleY = .666
									posX = (shapeIndex%2==0) ? -W_QUART : W_QUART
									if(shapeIndex < 2) {
										posZ = -H_HALF
									} else if(shapeIndex < 4) {
										posZ = -1 * GB_BOX_W
									} else {
										posZ = GB_BOX_W
									}
									btnsMoveZ = 7
								  break;
							}
							// Als er rects zijn, dan verschuiven de squares, en worden ze wat minder hoog
							if(shapeCounter.rectangle > 0) {
								switch(shapeCounter.rectangle) {
									case 1:
										scaleY*= .935
										posZ *= .935
										posZ += 0.8
									  break;
								}
								if(shapeCounter.square == 1) {
									scaleY*= .98
								}
								if(btnsMoveZ != BtnZDflt) {
									btnsMoveZ *= .9
								}
							}
						  break;
						case 'single':
							// 1 ? center, 2 ? #1 top #2 bottom
							switch(shapeCounter.single) {
								case 2:
									posZ = (shapeIndex == 1) ? -5 : 5
								  break;
							}
							btnsMoveZ = 1.5
							btnsMoveX = 3.2
							btnsMoveY = 3.5
						  break;
						case 'rectangle':
							switch(shapeCounter.square) {
								case 0:
									posZ = 0// GR_H - GB_BOX_W
								  break;
								default:
									posZ = (-GR_H) + RECT_h
								  break;
							}
							btnsMoveZ = 10.55
						  break;
						case 'outside':
							btnsMoveX = 6.5
							btnsMoveY = 0.2
							btnsMoveZ = -7.6
						  break;
					}
					// console.log(visualsPlaced.current[vis_i])
					
					/* markup of the visuals to layout
						<group 
							name="vis_mover"
					        ref={}
					        userData={{visType:'DayBoxes'}}
						>
							<group name="vis_scaler"> 
								<group name="normalizer" />
							</group>
							<group name="edit_btns">
						</group>
					*/					
					// visualsPlaced.current[vis_i].position = new THREE.Vector3(posX,posZ,0)
					// visualsPlaced.current[vis_i].scale = [scaleX,1,scaleY]
					const vis2Move = visual
					const posY = (scaleX == 1) ? 0 : scaleX
					// console.log('Layouter, set vis2Move position:', posX,posY,posZ)

					vis2Move.position.set(posX,posY,posZ)
					const vis2Scale = visual.getObjectByName('vis_scaler')
					if(vis2Scale) {
						vis2Scale.scale.set(scaleX,scaleX,scaleY)
					}
					
					// Buttons
					const visBtns = visual.getObjectByName('edit_btns')
					const btnZ = (btnsMoveZ != BtnZDflt) ? btnsMoveZ : visBtns.position.z
					// Vis is positioned to the right half
					if(posX == (-1 * W_QUART)) {
						visBtns.position.set(-GB_BOX_W + .35, .2, btnZ )
					} else if(posX == W_QUART) {
						visBtns.position.set(GB_BOX_W - .35, .2, btnZ )
					}
					// Default BTNS Position: 5.7 , 0.7 , 10
					// Move X ?
					if(btnsMoveX != BtnXDflt) {
						// console.log('move btnx X', btnsMoveX)
						visBtns.position.set(btnsMoveX, visBtns.position.y, visBtns.position.z )	
					}
					// Move Y
					if(btnsMoveY != BtnYDflt) {
						console.log('btnsMoveY', btnsMoveY)
						visBtns.position.set(visBtns.position.x, btnsMoveY, visBtns.position.z )	
					}
					// Move Z
					if(btnsMoveZ != BtnZDflt) {
						visBtns.position.set(visBtns.position.x, visBtns.position.y, btnsMoveZ )	
					}
					

					// const editBtn = visual.getObjectByName('EditBtnDel')
					// editBtn.position.set(posX - 2,posZ + 2,1)
					// visualsPlaced.current[vis_i].set({ scale: [scaleX,1,scaleY] })
							

					vis_i++
				}
			}
		}
		// console.log(visualsPlaced)
	}
	DoVisualsLayout()
}
export function ToggleEditButtons(visualsPlaced, displayMode) {
	const visibleMode = ('off' == displayMode) ? false : true;
	// console.log('ToggleEditButtons', visualsPlaced)
	for( let visual of visualsPlaced.current) {
		if(
			visual
			&&
			typeof visual === 'object'
			&&
			visual.hasOwnProperty('isObject3D')
		) {
			const visBtns = visual.getObjectByName('edit_btns')
			visBtns.visible = visibleMode
		}
	}
}

export function getGridBoxes() {

	const gridBoxes2Place = GB_PER_X * GB_PER_Y

	const boxGeom = new THREE.BoxGeometry(GB_BOX_W,GB_BOX_W,.01)
	const boxMat = new THREE.MeshBasicMaterial({color: 0xff00ff, transparent: true, opacity:.05})


    const GridBase = useMemo(() => {
		let gridBoxsInGrid = []

		for(let gridBox_i = 0; gridBox_i < gridBoxes2Place; gridBox_i++) {
			let key = `gridBox-${gridBox_i}`

			let pos_x = (gridBox_i%GB_PER_X) * GB_BOX_W
			pos_x+= pos_x * GB_MARGIN
			let pos_y = (Math.floor( gridBox_i / GB_PER_X )) * GB_BOX_W
			pos_y+= pos_y * GB_MARGIN

			const gridBox = <mesh 
						key={`gridbox-${gridBox_i}`}
						position={[pos_x,pos_y,0]} 
						geometry={boxGeom}
						material={boxMat}
						name="gridBoxBase"
					/>

			gridBoxsInGrid.push(gridBox)
		}

    	return gridBoxsInGrid
    }, [])

    return <group position={[-3.45,-8.5,1]}>{GridBase}</group>
}
