import { OrbitControls, useGLTF, CurveModifier } from '@react-three/drei'
import * as THREE from 'three'
import { Debug } from '@react-three/rapier'
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree, extend } from '@react-three/fiber'

import {GridHelper, clamp} from './helpers/GridHelpers'
import {diamondEdgeMaterial, diamondMaterial} from './materials/ProjectMaterials'
import {BigShapeGeom} from './shapes/Phone'

const diamondsRingShapeOps = ['diamond', 'flower', 'heart']


function getCurveGeometry() {
	const curvePoints = [
		{ x: -5.20099, y: 10.49558, z: -7.84441 },
		{ x: -5.12045, y: 10.78522, z: -7.84441 },
		{ x: -4.98784, y: 10.98522, z: -7.84441 },
		{ x: -4.66315, y: 11.21487, z: -7.84441 },
		{ x: -4.33760, y: 11.27776, z: -7.84441 },
		{ x: 4.42294, y: 11.27363, z: -7.84441 },
		{ x: 4.71258, y: 11.19309, z: -7.84441 },
		{ x: 4.96990, y: 11.00489, z: -7.84441 },
		{ x: 5.16917, y: 10.65874, z: -7.84441 },
		{ x: 5.20512, y: 10.41024, z: -7.84441 },
		{ x: 5.19379, y: -10.55117, z: -7.84441 },
		{ x: 5.12045, y: -10.78522, z: -7.84441 },
		{ x: 4.87161, y: -11.09455, z: -7.84441 },
		{ x: 4.58610, y: -11.24181, z: -7.84441 },
		{ x: 4.33760, y: -11.27776, z: -7.84441 },
		{ x: -4.42294, y: -11.27363, z: -7.84441 },
		{ x: -4.71258, y: -11.19309, z: -7.84441 },
		{ x: -4.91258, y: -11.06048, z: -7.84441 },
		{ x: -5.14223, y: -10.73579, z: -7.84441 },
		{ x: -5.20512, y: -10.41024, z: -7.84441 }
	]
	const curveVertices = []
	for(let curvePoint of curvePoints) {
		curveVertices.push( new THREE.Vector3(curvePoint.x, curvePoint.y, curvePoint.z ) )
	}
	// console.log(curveVertices)

	const curve = new THREE.CatmullRomCurve3( curveVertices );
	curve.curveType = 'centripetal';
	curve.closed = true;

	const points = curve.getSpacedPoints( 100 );

	const lineGeom = new THREE.BufferGeometry().setFromPoints( points )
	return lineGeom;
}
const directionCounter = {
	15: 0,
	14: 1,
	13: 2,

}
function getVerticesI2dayI() {
	const vertIStart = 15;
	const numDays = 100
	const verticesI2dayI = {}
	let vertI = vertIStart
	for(let dayI = 0; dayI < numDays; dayI++) {
		if(vertI < 0) { vertI = numDays - 1; }
		verticesI2dayI[vertI] = dayI
		vertI--
	}
	return verticesI2dayI
}
function PlaceAlongSpline({geom, shapeType, grid, displayColor}) {

	const verticesGeom =  BigShapeGeom( 'side_' + shapeType) //nodes[shapeType].geometry


	var size = 0.5;

	const leftSideIs  = [0,99,98,97,96,95,93,94,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68]
	const rightSideIs = [49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,23,24,22,21,20,19,18,50]
	const botSizeIs   = [51,52,53,54,55,56,57,58,59,60,61,62,63,64,65]
	const cornLT = [1]
	const cornRT = [16,17]
	const cornRB = [51]
	const cornLB = [66,67]

	const getInstanceRotation = (instanceIndex) => {
		let rotX = 0;
		let rotY = 0;
		let rotZ = 0;
		if(leftSideIs.indexOf(instanceIndex) != -1) {
			rotZ  = Math.PI * .5
		}
		if(rightSideIs.indexOf(instanceIndex) != -1) {
			rotZ  = -1 * Math.PI * .5
		}
		if(botSizeIs.indexOf(instanceIndex) != -1) {
			rotZ  = Math.PI
		}
		if(cornLT.indexOf(instanceIndex) != -1) {
			rotZ  = Math.PI * .25
		}
		if(cornRT.indexOf(instanceIndex) != -1) {
			rotZ  = -1 * Math.PI * .25
		}
		if(cornRB.indexOf(instanceIndex) != -1) {
			rotZ  = -1 * Math.PI * .75
		}
		if(cornLB.indexOf(instanceIndex) != -1) {
			rotZ  = Math.PI * .75
		}
		// rotZ = 0
		return [rotX,rotY,rotZ]
	}

	// Clone material set display colr
	const diamondMatColored = diamondMaterial.clone()
	diamondMatColored.color = displayColor

	// lil ref
	const vertBoxes = useRef([]);

	// Click action for laterrr
	const AddToClicked = (verticeIndex) => {
		console.log('clicked diamond', verticeIndex)
		let clickedCube = vertBoxes.current[verticeIndex];
	}
	// Lil helper 

	// Parse teh grid
	const relGrid = (grid.hasOwnProperty('num_per_day')) ? grid.num_per_day : grid.followers
	const gridData = GridHelper(relGrid, true)
	grid = gridData.gridArray;
	const valMax = gridData.max
	const valMin = gridData.min

	// Scale settings
	const maxScale = 2
	const scaleMultiplier = maxScale / valMax

	// console.log(valMax, valMin, grid)

	// Place a 100 diamonds babu
	let vertIndex = 0;
	let diamondsInRing = [];
	var verts = geom.attributes.position.array;

	// Make the diamonds square again
	const reScale = .1
	const restretchScale = [reScale,reScale,reScale]
	const maxDiamonds = 100

	const shapePositions = {
		diamond: -.035,
		flower: -.025,
		heart: -.075,
	}
	const offsetY = shapePositions[shapeType]


	const verticesI2dayI = getVerticesI2dayI()

	for (let k=0; k<verts.length; k+=3) {
		const curIndex = vertIndex;
		if(curIndex < maxDiamonds) {
			let leName = 'diamond-' + k;
			// Set rotation
			const rot = getInstanceRotation(curIndex)
			const gridI = verticesI2dayI[curIndex]
			// Set scale
			// const diamondScale = clamp(Math.random() * 2, .3, 2)

			// const diamondScale = .5;//(curIndex == 0 || curIndex == 99) ? .5 : grid[vertIndex] * scaleMultiplier //  (vertIndex%2 == 0) ? 1 : 0;// 
			const diamondScale = grid[gridI] * scaleMultiplier //  (vertIndex%2 == 0) ? 1 : 0;// 


			const verticeIDr =	<group
					ref={ (element) => vertBoxes.current[curIndex] = element }
					key={leName}
					/*
					onClick={(event) => {
							AddToClicked(curIndex)
							event.stopPropagation();
						}
					}*/
					name={leName}
					rotation={rot}
					position={[verts[k],verts[k+1],verts[k+2]]}
					scale={[diamondScale,diamondScale,diamondScale]}
				>
					<mesh
						geometry={verticesGeom}
						material={diamondMatColored}
						position={[0,offsetY,0]}
						scale={restretchScale}
					/>
					<mesh
						geometry={verticesGeom}
						material={diamondEdgeMaterial}
						position={[0,offsetY,0]}
						scale={restretchScale}
					/>
				</group>

			diamondsInRing.push(verticeIDr);
		}


		vertIndex++;
	}
	return 	diamondsInRing
}
export default function DiamondsRing({grid, displayColor, shapeType, visualID}) {

	if(!shapeType || (shapeType && diamondsRingShapeOps.indexOf(shapeType) == -1)) { shapeType = diamondsRingShapeOps[0] }

	let phoneSideCurve = useMemo(() => { return getCurveGeometry() }, [])

	return <group rotation-x={Math.PI * .5} name="vis_type_wrapper">
		<PlaceAlongSpline geom={phoneSideCurve} shapeType={shapeType} grid={grid} displayColor={displayColor} />
	</group>
}
