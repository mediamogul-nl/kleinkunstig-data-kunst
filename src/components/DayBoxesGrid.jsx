import { useGLTF, MeshRefractionMaterial, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useRef, useEffect  } from 'react'
import { useFrame } from '@react-three/fiber'
import {PhoneDayCounters, DAY_FRAMER} from './helpers/VisualsDataExchange'
import {textMaterial, tagTextMaterial} from './materials/ProjectMaterials'
import {GridHelper, clamp} from './helpers/GridHelpers'

// Materials
const materialEdges = new THREE.MeshPhongMaterial({
	color: 0xffffff, 
	wireframe: true,
	transparent: true,
	opacity: 0.1
});


const perSide = 10
const animated = true

const heightDivider = 10
let cubeMax = 0;

const DayShapesInfo = {
	cube: {
		relYVertices: [4,10,16,22,25,28,31,34]
	},
	piramid: {
		relYVertices: [25,28,31,34]
	},
	capsule: {
		relYVertices: [1,4,7,10,13,16,19,22,25,28,34,37,40,43,46,49,52,55,58,64,67,70,73,76,79,82,88,91,94,97,100,103,106,109,112,115,118,124,127,130,133,136,142,145,148,151,154,157,160,163,166,169,172,175,178,184,187,190,196,199,202,205,208,211,214,217,220,223,226,229,232,235,238,244,250,253,256,259,262,265,268,271,274,277,280,283,286,289,292,295,298,304,307,310,313,316,319,322,325,328,334,337,340,343,346,349,352,358,361,364,367,370,373,376,379,382,385,388,394,397,400,403,406,412,415,418,421,424,427,430,433,436,439,442,445,448,454,457,460,466,469,472,475,478,481]
	},
	diamond: {
		relYVertices: [1,4,7,10,13,16,19,22,25,28,34,37,40,43,46,49,52,55,58,64,67,76,79,82,85,88,97,100,103,106,109,115,118,121,124,127,130,133,136,139,142,145,151,154]
	},
	brilliant: {
		relYVertices: [1,4,7,10,13,16,19,22,25,52,55,58,61,64,67,70,73,100,103,106,109,112,115,118,121,148,151,154,157,160,163,166,169,172,175,178,181,184,187,190,193,196,199,202,205,208,211,214,217]
	},
	emerald: {
		relYVertices: [52,70,13,67,64,19,10,43,40,16,37,22,73,145,61,58,76,34,31,142,139,55,49,127,130,28,25,133,136,46,4,7,1]
	},
	heart: {
		// relYVertices: [1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58,61,76,79,82,85,88,91,94,97,100,103,106,109,112,115,118,121,124,127,130,133,136,139,145,148,154,157,160,163,166,175,181,184]
		relYVertices: [1,4,7,31,34,37,40,43,46,49,52,55,58,61,64,67,79,82,88,91,94,97,100,103,106,109,112,115,118,121,124,127,130,133,151,154]
	},
}

function animateBoxHeights({lerpIncr, ref2Set, grid, dayFrame, reset, shapeType, scaleMultiplier}) {

	let cube2Grow = ref2Set.current[dayFrame]; 

	let relVertices2Update = DayShapesInfo[shapeType].relYVertices;
	let verticesInitYs = DayShapesInfo[shapeType].initYs;

	if(cube2Grow) {
		let groupMeshes = cube2Grow.children

		let yIncr = (grid.hasOwnProperty(dayFrame)) ? grid[dayFrame] : 0;
		if(reset) { yIncr = 0; }
		// console.log(gridKey, yIncr)

		for(let groupMesh of groupMeshes) {
			const cubeMeshPos = groupMesh.geometry.getAttribute( 'position' );

			for(let vI of relVertices2Update) {
				// let vertInitY = 
				let endY = yIncr// (upperVertices2Update.indexOf(vI) != -1) ? yIncr + .3 : yIncr;
				endY = endY * scaleMultiplier// heightDivider
				endY+= verticesInitYs[vI]
				// console.log(dayFrame, 'endY', endY)
				let geomPosI = vI + 0;// (vI * 3);

				// Determine current point
				var v = new THREE.Vector3(cubeMeshPos.array[geomPosI - 1], cubeMeshPos.array[geomPosI], cubeMeshPos.array[geomPosI + 1]);
				// Create new vec3 for that
			    var v2 = new THREE.Vector3(cubeMeshPos.array[geomPosI - 1], endY, cubeMeshPos.array[geomPosI + 1]  );

			    // Lerp to it
			    v.lerp(v2, lerpIncr);

			    // Update the points Y position
			    cubeMeshPos.array[geomPosI] = v.y;
			}
		    cubeMeshPos.needsUpdate = true;
		}
	}
}

export function setShapeInitYs( shape, shapeGeometry ) {
	if(
		DayShapesInfo.hasOwnProperty(shape)
		&&
		!DayShapesInfo[shape].hasOwnProperty('initYs')
	) {
		let initYs = []
		let geomPos = shapeGeometry.getAttribute( 'position' );
		let relVertices = DayShapesInfo[shape].relYVertices;

		for(let vI of relVertices) {
			initYs[vI] = geomPos.array[vI]
		}
		DayShapesInfo[shape].initYs = initYs;
	}
}

const marge = 0;

function AddDayBox({index = 0, dayData = {}, meshGeom, ref2Set, boxMat, shapeType}) {

	// X & Z Position
	let pos_x = index%perSide
	let pos_z = Math.floor( index / perSide);// Math.floor( numDays / index )
	pos_x+= pos_x * marge
	pos_z+= pos_z * marge

	pos_z = 9 - pos_z;

	// Zigzaggings ? Yes plz
	let row_i      =  Math.floor(index / 10);
	let uneven_row = (row_i%2 === 0);
	if(uneven_row) { pos_x = 9 - pos_x }

	const meshClone      = meshGeom.clone()
	const clonedMeshGeom = meshClone.geometry.clone()

	return (
		<group 
			name="dayCubeWrap"
	        ref={ (element) => ref2Set.current[index] = element }		
			position={[ pos_x, 0, pos_z]}
		>
			{/*
	        <mesh
	        	name="dayCubeOutline"
			    geometry={clonedMeshGeom}
			    material={materialEdges}
			    position={[0, 0.01 ,0]}
	        ></mesh>
	        */}
	        <mesh
	        	name="dayCubeBase"
	        	receiveShadow
	        	castShadow
			    geometry={clonedMeshGeom}
			    material={boxMat}
			    position={[0, 0 ,0]}
	        ></mesh>
        </group>
	)
}

export function DayBoxesGrid({grid, meshGeom, boxMat, shapeType, playBackSpeed, visualID}) {

	// console.log('___RNDR_::DayBoxesGrid', shapeType)

	let boxes = []

	const dayBoxesRef = useRef([]);

	const DayGrid = grid.num_per_day

    const cubeMesh = new THREE.Mesh( meshGeom, materialEdges );

    let cubeMin = 0;

	for(let dayIndex in DayGrid) {
		let index   = parseInt(dayIndex)
		let dayData = DayGrid[dayIndex] / heightDivider
    	boxes.push( <AddDayBox 
    		key={index} 
    		dayData={dayData} 
    		index={index} 
    		boxMat={boxMat}
    		meshGeom={cubeMesh} 
    		ref2Set={dayBoxesRef}
    		shapeType={shapeType}
    		/>
		)
		// Set min max
		if(dayData < cubeMin) { cubeMin = dayData }
		if(dayData > cubeMax) { cubeMax = dayData }
	}

	// Animate them
	const maxFrames = 99
	let frame_i = 0;
	let prev_day = -1
	let dayFrame = DAY_FRAMER.day

	let ref2Set = dayBoxesRef;

	const gridData = GridHelper(DayGrid, true)
	grid = gridData.gridArray;
	const valMax = gridData.max
	const valMin = gridData.min

	const maxScale = 7
	const scaleMultiplier = maxScale / valMax
	// console.log('scaleMultiplier', scaleMultiplier)
	let reset_time = 20
	let resetting = false

	useFrame((state) => {
		// console.log(shapeType)
		const time = state.clock.getElapsedTime()
		frame_i++;
			// Calc lerp increment (percentage to change from old to new point 0, 0.9)
			let offset   = frame_i%playBackSpeed;
			let lerpIncr = offset / playBackSpeed;
			if(lerpIncr  == 0) { lerpIncr = 1; }

			let animateProps = {
				lerpIncr, 
				ref2Set: dayBoxesRef, 
				grid: DayGrid, 
				dayFrame, 
				reset: false, 
				shapeType,
				scaleMultiplier
			}
			animateBoxHeights(animateProps)

		if(prev_day != DAY_FRAMER.day) {
			let dayDifference = DAY_FRAMER.day - prev_day
			if(dayDifference != 1) { ResetToDay( (DAY_FRAMER.day) )	}
			prev_day = DAY_FRAMER.day
			dayFrame = DAY_FRAMER.day
			// Time for a reset
			if(dayFrame == 0) {
				BoxesReset()
			}
		}
	})

	function ResetToDay(day) {
		for(let resetDay = 0; resetDay <= maxFrames; resetDay++ ) {
			if(resetDay != day) {
				let revert = (resetDay > day) ? true : false
				let animateProps = {
					lerpIncr: 1, 
					ref2Set: dayBoxesRef, 
					grid: DayGrid, 
					dayFrame: resetDay, 
					reset: revert, 
					shapeType,
					scaleMultiplier
				}
				animateBoxHeights(animateProps)
			}
		}
	}

	function BoxesReset() {
		let dayFrameMin = maxFrames - 0;
		for(let revDayI = dayFrameMin; revDayI >= 0; revDayI-- ) {
			// console.log(revDayI)
			// let lerpIncr = 1;
			// let reset = true;
			let animateProps = {
				lerpIncr: 1, 
				ref2Set: dayBoxesRef, 
				grid: DayGrid, 
				dayFrame: revDayI, 
				reset: true, 
				shapeType,
				scaleMultiplier
			}
			animateBoxHeights(animateProps)
		}
	}

	const DayBoxBaseGeom = new THREE.BoxGeometry(10, .001, 10);
	const DayBoxBaseMat = new THREE.MeshBasicMaterial({color:0xff00ff, transparent: true, opacity: 0})

	return (
		<group name="vis_type_wrapper" position={[-9.5,0,-9.50]}>			
		{boxes}
		<mesh geometry={DayBoxBaseGeom} position={[4.5,0,  4.5]} material={DayBoxBaseMat} />
		</group>
	)
}