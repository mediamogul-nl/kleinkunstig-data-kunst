import { Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useRef  } from 'react'
import { useFrame } from '@react-three/fiber'

// import GridSettings from './contants/GridSettings.jsx'
import  * as CONTS from  './constants'
/*  ____             
   / __ \____ ___  __
  / / / / __ `/ / / /
 / /_/ / /_/ / /_/ / 
/_____/\__,_/\__, /  
            /____/  boxes */

export let 	dayBlockSize      = (CONTS.numBlocks / (10 + (CONTS.borderWidth / CONTS.blocksPerRow) ) )
export let 	dayBlockH         = dayBlockSize;
export const 	dayBlockWidth = .05;
export let 	dayBlockGeom      = new THREE.BoxGeometry(dayBlockWidth, dayBlockH, dayBlockWidth);
export const   dayBlockOffset = CONTS.borderWidth;
export const   dayZeroPoint   = {x: (-.5 * CONTS.numBlocks) + dayBlockOffset, y: (-.5 * CONTS.numBlocks) + dayBlockOffset};
// const 	dayMesh        = new THREE.Mesh(dayBlockGeom, materialDays);
export let    dayBlockScaleSize = 1;
export function DayBoxes() {
	// resetDayGeoms()
	const boxes = [];
	dayBlockGeom   = new THREE.BoxGeometry(dayBlockWidth, dayBlockH, dayBlockWidth);
	// console.log('add DayBoxes')
	for(let i = 0; i < gridSize; i++) {
		boxes.push( <AddDayBox key={i} index={i} /> )
	}
	let numBoxes = boxes.length;

	return boxes;
}

export const AddDayBox = ({index = 0}) => {
	// console.log('AddDayBox!', index)
	let pos_x = index%CONTS.blocksPerRow
	let pos_y = Math.floor( index / CONTS.blocksPerRow);// Math.floor( numDays / index )

	pos_x = dayZeroPoint.x + (pos_x * dayBlockSize);// + (pos_x * dayBlockWidth);
	pos_y = dayZeroPoint.y + (pos_y * dayBlockSize);
	if(index == 0) { console.log('AddDayBox: dayBlockH', dayBlockH)}
	// Create position object
	const dayPos = [
		pos_x,
		dayBlockH / 2,
		pos_y, 
	]

	// Add Text marker
	const dayTxtIndex = parseInt(index) + 1;

	const dayTxtPos = JSON.parse(JSON.stringify(dayPos));
	dayTxtPos[0]+= .1;
	dayTxtPos[1] = dayBlockH;

	const dayTxtRef = useRef()

	const DayTxt =  <Text3D 
					ref={dayTxtRef}
					letterSpacing={-0.06}
			        material={textMaterial}
		        	font="./fonts/helvetiker_regular.typeface.json"
		        	size= {.5}
		        	height={.1}  
		        	position={dayTxtPos}    	
	        	>{dayTxtIndex}
		        </Text3D>

	// Make the days face the camera
	useFrame((state, delta, xrFrame) => {
		dayTxtRef.current.lookAt( state.camera.position );
	})	        

	return	<group>
				{DayTxt}
				<mesh
				    geometry={ dayBlockGeom }
				    material={materialDays}        
		        	position={dayPos}
		        >
		        </mesh>
	        </group>
}
// export default DayBox;
