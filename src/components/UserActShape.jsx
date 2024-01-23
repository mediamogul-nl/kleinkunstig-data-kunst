import { useGLTF, Text3D } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree } from '@react-three/fiber'


const UAC_icons_path = "/models/icons/UAC_icons.gltf";
import {PhoneDayCounters} from './helpers/VisualsDataExchange'

import { USR_ACT_TIMELINE, UAC_FRAMED_TIMELINE, UserLog, UAC_visual_id } from  './UserActivityLogger'

// Materials
import {diamondMaterial, textMaterial, textMaterialDark} from './materials/ProjectMaterials'

THREE.ColorManagement.legacyMode = false


const UAC_BOX_ACTION_KEYS = {
	0: 'adds',
	1: 'edits',
	2: 'deletes',
	3: 'info',
	4: 'visType_DayBoxes',
	5: 'visType_DayHeightMap',
	6: 'visType_CreatorHeightmap',
	7: 'visType_DiamondsRing',
	8: 'visType_BigSingleShape',
	9: 'visType_DiamondsGrid',
	10: 'shapeType_cube',
	11: 'shapeType_piramid',
	12: '', // center box => keep empty
	13: 'shapeType_capsule',
	14: 'shapeType_diamond',
	15: 'shapeType_emerald',
	16: 'shapeType_heart',
	17: 'shapeType_flower',
	18: 'shapeType_rose',
	19: 'shapeType_skull',
	20: 'drags',
	21: 'creators',
	22: 'hashtags',
	23: 'searches',
	24: 'randomTags',
	25: 'categories',
	26: 'swatchesGenerated',	
}

const UAC_BoxSize = 1
const UAC_BOX = new THREE.BoxGeometry(UAC_BoxSize,UAC_BoxSize,UAC_BoxSize)
const UAC_BOX_POS = UAC_BOX.getAttribute( 'position' );

// const UAC_MAT = new THREE.MeshNormalMaterial()
// const UAC_MAT = new THREE.MeshBasicMaterial({color:0xcccccc})
const UAC_MAT = new THREE.MeshStandardMaterial({ 
	color: 0x666666,
	flatShading: true,
	// transparent: true,
	// opacity: .9,
	metalness: 0.9,
	roughness: 0.9,
})
const UAC_MAT_ICON = new THREE.MeshStandardMaterial({ 
	color: 0x4c6a9e,
	flatShading: true,
	// transparent: true,
	// opacity: .9,
	metalness: 0.9,
	roughness: 0.9,
})

// const UAC_MAT_ICON = new THREE.MeshStandardMaterial({color:0x666666})

function RubicGetSingleCube({ref2set, pos, index}) {

	const boxGeom = UAC_BOX.clone()
	const iconGeom = new THREE.BoxGeometry(UAC_BoxSize / 10,UAC_BoxSize / 10,UAC_BoxSize / 10)

	// Rotate them
	const gr_rotation = [0,0,0]

	const rotateDown = [10,18,19]
	if(rotateDown.indexOf(index) != -1) {
		gr_rotation[0] = Math.PI / 1
	}
	const rotateFront = [1, 2, 3, 4, 7]
	if(rotateFront.indexOf(index) != -1) {
		gr_rotation[0] = -Math.PI / 2
	}
	const rotateRight = [0,6,9,12,24]
	if(rotateRight.indexOf(index) != -1) {
		gr_rotation[0] = -Math.PI / 2// * 2.33
		gr_rotation[2] = Math.PI / 2
	}
	const rotateBack = [20,21,22,25,26]
	if(rotateBack.indexOf(index) != -1) {
		gr_rotation[0] = Math.PI  * 2.5
		gr_rotation[1] = Math.PI //  * 2.5
		// gr_rotation[2] = Math.PI / 2
	}
	const rotateLeft = [5,11,14,17,23]
	if(rotateLeft.indexOf(index) != -1) {
		gr_rotation[2] = Math.PI  * 1.5
		gr_rotation[0] = Math.PI * 1.5
		// gr_rotation[2] = Math.PI / 2
	}


	const UsrCubeInfo = (e) => {
		console.log(index)
		e.stopPropagation()
	}
	// (e) => { console.log(index)}

	const { nodes } = useGLTF(UAC_icons_path)

	const UAC_key = UAC_BOX_ACTION_KEYS[index]
	const UAC_icon_scale = .2
	let BoxIcon
	if(UAC_key!='' && nodes.hasOwnProperty(UAC_key)) {
		const BoxIconGeom =  nodes[UAC_key].geometry
		BoxIcon = <mesh 
        	name="text"
        	position={[0, 1, 0]}
        	scale={[UAC_icon_scale, UAC_icon_scale, UAC_icon_scale ]}
        	rotation={[Math.PI / 2, Math.PI, 0]}		
			geometry={BoxIconGeom} material={UAC_MAT_ICON} 
		/>
	}
	/*
        <Text3D 
        	name="text"
	        material={UAC_MAT_ICON}
        	font="./fonts/TASA_Orbiter_Display_Black.json"
        	size= {.25}
        	height={.02}  
        	position={[0, .5 + .01, 0]}
        	rotation={[Math.PI / 2, Math.PI, 0]}
    	>{index}
        </Text3D>

	*/


	return <group 
		ref={ (element) => ref2set.current[index] = element }
		position={pos}
		rotation={gr_rotation}
		onClick={UsrCubeInfo}
	>
		{/*<mesh name="icon" geometry={iconGeom} position={[0,.5,0]} material={UAC_MAT_ICON} />*/}
		{BoxIcon}
		<mesh 
			name="box" 
			geometry={boxGeom} 
			material={UAC_MAT} 
		/>
	</group>

}
let USER_GRID_BUILD = 0

function UserRubicsCube({ref2set}) {
	const numX = 3
	const numY = 3
	const numZ = 3
	const numBoxes = numX * numY * numZ
	const perSide = numX * numY
	const marge = .01
	console.log('----- UserRubicsCube ----')

	let boxes = []
	let prev_grid_i = 0
	let start_x = 0 
	let start_y = 0
	let start_z = 0
	const skipBoxes = [13]

	for(let i = 0; i < numBoxes; i++) {
		let grid_i = Math.floor( i / perSide)
		let threeOffset = i%numX
		// Calc X Pos
		let pos_x = i%numX + (threeOffset * marge)
		// Calc Y Pos
		let pos_y = Math.floor( i / numX) // + (threeOffset * marge)
		pos_y -= (grid_i * numY)
		pos_y+= pos_y * marge
		// Calc Z pos
		let pos_z = grid_i + (grid_i * marge)


		const pos = [pos_x, pos_y, pos_z]
		let key = 'user-box-'+i
		boxes.push(
			<RubicGetSingleCube
				key={key}
				ref2set={ref2set}
				index={i}
				pos={pos}
			/>
		)
		prev_grid_i = grid_i
	}
	USER_GRID_BUILD++

	let dayFrame      = 0
	let frame_i       = 0
	let playBackSpeed = 20

	let maxFrames       = 0 // animationFrames.length
	let animationReady  = false

	useFrame((state) => {
		if(animationReady) {
	// console.log('USER_GRID_BUILD', USER_GRID_BUILD,  boxes.length)
			frame_i++;
			// Calc lerp increment (percentage to change from old to new point 0, 0.9)
			let offset   = frame_i%playBackSpeed;
			let lerpIncr = offset / playBackSpeed;
			if(lerpIncr == 0) { lerpIncr = 1; }

			UserBoxMutations(ref2set, dayFrame, lerpIncr)

			if(frame_i%playBackSpeed === 0) {
				dayFrame++;
				if(dayFrame == maxFrames) { dayFrame = 0}
				PhoneDayCounters[UAC_visual_id] = dayFrame
			}
		}
	})

	useEffect(() => {
		if(UserTimelineBuild()) {
			maxFrames = UAC_FRAMED_TIMELINE.frames.length
			// UserBoxMutations(ref2set)
			animationReady = true
		}
	}, [USER_GRID_BUILD])

	return boxes
}
function UserTimelineBuild() {



	let UT = []
	let initCount = {}
	for(let lk in UAC_BOX_ACTION_KEYS) {
		initCount[ UAC_BOX_ACTION_KEYS[lk] ] = 0
	}
	// 0 start
	UT.push({...initCount}) 

	for(let timeI in USR_ACT_TIMELINE) {
		let keys2Incr = USR_ACT_TIMELINE[timeI]
		
		for(let lk in UAC_BOX_ACTION_KEYS) {
			let key = UAC_BOX_ACTION_KEYS[lk]
			if(keys2Incr.indexOf(key) != -1) {
				initCount[key] ++	
			}
		}
		UT.push({...initCount}) 
	}
	UAC_FRAMED_TIMELINE.frames = UT

	return true
}
UserTimelineBuild()

function UserBoxMutations(userBoxesRef, dayFrame, lerpIncr) {
	// const logKeys = Object.keys( LOG_MOMENT_01 )	
	const vertices2Grow = [0, 3, 12, 15, 24, 27, 30, 33, 48, 51, 60, 63]


	for(let lk in UAC_BOX_ACTION_KEYS) {
		// console.log(lk)
		// console.log(lk)
		if(userBoxesRef.current[lk]) {
			// Get the group
			const box2Update = userBoxesRef.current[lk]
			// And its children
			const box      = box2Update.getObjectByName('box')
			const box_icon = box2Update.getObjectByName('text')
			// Get Box GEOM.position array
			const meshPos = box.geometry.getAttribute( 'position' );

			const logKey     = UAC_BOX_ACTION_KEYS[lk]
			// console.log(lk, box)
			if(logKey != '') {
				let val2Incr   = 0
				if(UAC_FRAMED_TIMELINE.frames.hasOwnProperty(dayFrame)) {
					val2Incr = UAC_FRAMED_TIMELINE.frames[dayFrame][logKey]
				}
				// als waarde van de key een array is, parse dan de lengte van die array 			
				if(val2Incr.hasOwnProperty('length')) {
					val2Incr = val2Incr.length
				}
				// Get positions
				let IconPosY  = 0
				const BoxGrow = parseInt( val2Incr )
				if (!isNaN(BoxGrow)) { 

					for(let v_i of vertices2Grow) {

					    // Update the points Y position
					    let endY = UAC_BOX_POS.array[v_i + 1] + BoxGrow
					    IconPosY = endY
					    // console.log('IconPosY', initMesh.array[v_i + 1], IconPosY)
						// Determine current point
						var vec01 = new THREE.Vector3(meshPos.array[v_i - 1], meshPos.array[v_i], meshPos.array[v_i + 1]);		    
					    var vec02 = new THREE.Vector3(meshPos.array[v_i - 1],  meshPos.array[v_i], endY  );
						// Lerp to it
						vec01.lerp(vec02, lerpIncr);
					    meshPos.array[v_i + 1] = vec01.z;
					}
					// Increment text & icon pos
					var boxTxtV1 = new THREE.Vector3(box_icon.position.x, box_icon.position.y,box_icon.position.z);		    
				    var boxTxtV2 = new THREE.Vector3(box_icon.position.x,  .02 + IconPosY, box_icon.position.z)
					// Lerp to it
					boxTxtV1.lerp(boxTxtV2, lerpIncr);
					// Update position
					box_icon.position.set(boxTxtV1.x, boxTxtV1.y, boxTxtV1.z)

					// Update meshes
					box.geometry.attributes.position.needsUpdate      = true
					box_icon.geometry.attributes.position.needsUpdate = true
				}
			}
		}
	}

}
export function UAC_Cube() {

	const userBoxesRef = useRef([]);

    const userBoxGrid = useMemo(() => { return <UserRubicsCube ref2set={userBoxesRef} /> }, [])

	/*
	const zeroGeom = new THREE.BoxGeometry(3,3,3)
	const zeroMat = new THREE.MeshBasicMaterial({color: 0xff0000})
	const zeroBox = <mesh geometry={zeroGeom} material={zeroMat} />
	*/

    return <>
		    <group position={[-1, -1,-1.0]}>
			{userBoxGrid}
			</group>
		</>
}

useGLTF.preload(UAC_icons_path);


/*
// STANDALONE VERSION
// Project modules
import Ground from './scene-elements/Ground'

export function UserActShape() {

	// Grid van de 27 boxes
	// elk met een kant die een icon heeft (nu ff placeholder ) 
	// en van elke box zijn de vertices bekend die moeten groeien
	// wijs key van log toe aan elke box (op color na)



	// const userBoxGrid = <UserRubicsCube ref2set={userBoxesRef} /> 

	// Memo the Ground
	const sceneGround = useMemo(() => { return <Ground /> }, [])

	// Memo the Environment
cns () = <Environment files="/imgs/wasteland_clouds_puresky_1k-V02.hdr" background />
	}, [])


	return (<>
	    <Canvas >
    		<OrbitControls />
    		<UAC_Cube />
	        {sceneGround}
	        {sceneEnvironment}	        
	    </Canvas>
	</>
	)

}
*/