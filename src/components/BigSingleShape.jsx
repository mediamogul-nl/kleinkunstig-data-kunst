import { OrbitControls, useGLTF, CurveModifier } from '@react-three/drei'
import * as THREE from 'three'
import { Debug } from '@react-three/rapier'
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree, extend } from '@react-three/fiber'

import {GridHelper, clamp} from './helpers/GridHelpers'
// import {diamondEdgeMaterial, diamondMaterial} from './materials/ProjectMaterials'
import {BigShapeGeom} from './shapes/Phone'
import {PhoneDayCounters, DAY_FRAMER} from './helpers/VisualsDataExchange'
import {popSocketMat} from './materials/ProjectMaterials'

const obstacleMaterial2 = new THREE.MeshStandardMaterial({ 
	color: 0x00ff00,
	flatShading: true,
	// transparent: true,
	opacity: .9,
	metalness: 0.4,
	roughness: 0.9,
})

export default function BigSingleShape({grid, displayColor, shapeType, playBackSpeed, visualID, PopSocket}) {

	const shapeOps = ['flower', 'diamond', 'heart', 'rose', 'skull']

	// console.log('shapeType', shapeType)
	if(!shapeType || shapeOps.indexOf(shapeType) == -1) { shapeType = 'flower' }

	const SingleShapeGeom = BigShapeGeom(shapeType) // GeomSkull()

	const refShape = useRef()

	const shapeMatColored = obstacleMaterial2.clone()
	shapeMatColored.color = displayColor
	shapeMatColored.opacity = 1

	// make the edges darker
	/*
	const shapeMatEdge =  diamondEdgeMaterial.clone()
	const darkerEdge = displayColor.clone()
	darkerEdge.offsetHSL(0.0,0.0,-.15)
	shapeMatEdge.color = darkerEdge;
	*/
	const singleShapeZ = (PopSocket) ? -2.8 : 0
	const singleShapePos = [0, 0, singleShapeZ]	
	if('skull' == shapeType) {
		singleShapePos[1] = -0.3
	}

	const rotXFactor = -.5 // (shapeType == 'skull') ? -.25 : -.5

	const singleShapeRot = [Math.PI * rotXFactor,0,0]									

	// Parse teh grid
	const relGrid = grid.hasOwnProperty('num_per_day') ? grid.num_per_day : grid.followers
	const gridData = GridHelper(relGrid, true)
	grid = gridData.gridArray;
	const valMax = gridData.max
	const valMin = gridData.min

	const maxScale = 1.02
	const scaleMultiplier = maxScale / valMax;
	const singleShapeScale = [maxScale,maxScale,maxScale]

	let frame_i = 0
	const maxFrames = 100
	let prev_day = -1
	let dayFrame = DAY_FRAMER.day

	useFrame(()=> {
		frame_i++
		const CurShape = refShape.current
		const curScale = CurShape.scale
		// console.log(curScale)
		let offset     = frame_i%playBackSpeed;
		const lerpIncr = offset / playBackSpeed;

		const scaleRate = grid[dayFrame] * scaleMultiplier
		// console.log(scaleRate)

		// Determine current point
		var v = new THREE.Vector3(curScale.x, curScale.y, curScale.z);
		// Create new vec3 for that
        var v2 = new THREE.Vector3(scaleRate, scaleRate, scaleRate );

        if(prev_day != DAY_FRAMER.day) {
        	dayFrame = DAY_FRAMER.day
        	prev_day = DAY_FRAMER.day
        }
		v.lerp(v2, lerpIncr)
        refShape.current.scale.set(v.x, v.y, v.z);//.lerp(v2, lerpIncr);

	}, [])

	const Inclps = true

	const PopSocketGeom = (PopSocket) ? BigShapeGeom('popsocket') : null


	return <group rotation={[Math.PI * .5, 0, 0]} name="vis_type_wrapper">
			<group 
				name="PopSocket" 
				ref={refShape} 
				position={singleShapePos} 
				rotation={singleShapeRot} 
				scale={singleShapeScale}
			>
				<mesh
					receiveShadow
					castShadow
					geometry={SingleShapeGeom}
					material={shapeMatColored}
				/>
			</group>
			{PopSocket &&
				<mesh 
					name="popsocket"
					receiveShadow
					castShadow
					rotation-x={-Math.PI * .5}
					position={[0, 0, 0]}
					geometry={PopSocketGeom}
					material={popSocketMat}
				/>
			}
	</group>
}