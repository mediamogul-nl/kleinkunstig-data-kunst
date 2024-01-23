import { OrbitControls, useGLTF, CurveModifier } from '@react-three/drei'
import * as THREE from 'three'
import { Debug } from '@react-three/rapier'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree, extend } from '@react-three/fiber'

const modelPath = "/models/dayshapes/tube-100-segments.gltf"; // dayshapes.gltf // diamonds-pre-stretched-bottomed.gltf
import {Phone} from './../shapes/Phone'

// const modelPathPhone = "/models/phone/phone.gltf";

const materialPhoneBase = new THREE.MeshBasicMaterial({
	color: 0xff0000, 
	// flatShading: true,
	transparent: true,
	opacity: .5
	// wireframe: true
});
const materialPhoneBaseEdge = new THREE.MeshBasicMaterial({
	color: 0xffffff, 
	// flatShading: true,
	wireframe: true
});

const materialHidden = new THREE.MeshBasicMaterial({
	transparent: true,
	opacity: 0
});
const materialClicked = new THREE.MeshBasicMaterial({
	color: 0xff00ff, 
	flatShading: true,
	wireframe: true
});
const vertMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  transparent: false
});
const diamondMaterial = new THREE.MeshBasicMaterial({
	color: 0x00ff00, 
	// flatShading: true,
	transparent: true,
	opacity: .9
	// wireframe: true
});
const diamondEdgeMaterial = new THREE.MeshBasicMaterial({
	color: 0x000000, 
	// flatShading: true,
	transparent: true,
	opacity: .1,
	wireframe: true
});



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

	const points = curve.getSpacedPoints( 99 );


	const lineGeom = new THREE.BufferGeometry().setFromPoints( points )
	return lineGeom;
}
function PlaceAlongSpline({geom, verticesGeom}) {

	var size = 0.5;

	const leftSideIs  = [99,98,97,96,95,93,94,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68]
	const rightSideIs = [49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,23,24,22,21,20,19,18]
	const botSizeIs   = [51,52,53,54,55,56,57,58,59,60,61,62,63,64,65]
	const cornLT = [0,1]
	const cornRT = [16,17]
	const cornRB = [50,51]
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

	// console.log(verticesGeom)

	var verts = geom.attributes.position.array;
	let highlightBoxes = [];

	const verticesClicked = [];
	const positionsClicked = []
	const allVertices = []

	const vertBoxes = useRef([]);

	let clickedInstances = []
	const AddToClicked = (verticeIndex) => {
		let clickedCube = vertBoxes.current[verticeIndex];
		clickedCube.material = materialClicked

		clickedInstances.push(verticeIndex)
		// console.log(clickedInstances)
	}

	const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

	let vertIndex = 0;
	for (let k=0; k<verts.length; k+=3) {

		// var vertGeometry = verticesGeom.clone()
		var vertGeometry = new THREE.BoxGeometry(size, size, size);
		const curIndex = vertIndex;
		// vertGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(verts[k],verts[k+1],verts[k+2]));

		let leName = 'vertice-' + k;

		// onPointerOver
		const rot = getInstanceRotation(curIndex)

		const diamondScale = clamp(Math.random() * 2, .3, 2)
		// console.log(diamondScale)

		const verticeIDr =	<group
				ref={ (element) => vertBoxes.current[curIndex] = element }
				key={leName}
				onClick={(event) => {
						AddToClicked(curIndex)
						event.stopPropagation();
					}
				}
				name={leName}
				rotation={rot}
				position={[verts[k],verts[k+1],verts[k+2]]}
					scale={[diamondScale,diamondScale,diamondScale]}
			>
				<mesh
					geometry={verticesGeom}
					material={diamondMaterial}
					position={[0,0.5,0]}
				/>
				<mesh
					geometry={verticesGeom}
					material={diamondEdgeMaterial}
					position={[0,0.5,0]}
				/>
			</group>

		highlightBoxes.push(verticeIDr);

		allVertices.push(k)

		vertIndex++;
	}
	// console.log(vertIndex)

	return 	 <>
			{highlightBoxes}
			</>
}

function PhoneCurve() {
	// const curveMemod = useMemo(() => {
		/*
		// console.log(curveVertices)

		const curve = new THREE.CatmullRomCurve3( curveVertices );
		curve.curveType = 'centripetal';
		curve.closed = true;

		const points = curve.getPoints( 50 );


		const lineGeom = new THREE.BufferGeometry().setFromPoints( points )
		const lineMat = new THREE.LineBasicMaterial( { 
			color: 0x00ff00 ,
			linewidth: 10,
		} )
		const liner3f = <mesh geometry={lineGeom} material={lineMat} />

		return liner3f*/

		const curveRef = useRef()

		const curve = useMemo(() => new THREE.CatmullRomCurve3([...curveVertices], true, 'centripetal'), [curveVertices])

		const numBoxes = 100
		const boxGroup = []
		const size = .4;
		const boxGeom = new THREE.BoxGeometry(size, size, size);
		const boxMat = materialPhoneBase.clone()
		boxMat.color = new THREE.Color('#ff00ff')
		boxMat.wireframe = true

		for(let i=0; i< numBoxes; i++) {
			const posX = i * size;

			const meshBox = <mesh
				key={`box-${i}`}
				position={[0, posX, 0]}
				geometry={boxGeom}
				material={boxMat}
			/>
			boxGroup.push(meshBox)
		}

		return (
		  // <CurveModifier ref={curveRef} curve={curve}>
		  	<group>{boxGroup}</group>
		  // </CurveModifier>
		)
	// },[]) 
	console.log(curveMemod)

	return curveMemod
	// return (line

/*
	const curves = [[
		{ x: 1, y: - 0.5, z: - 1 },
		{ x: 1, y: - 0.5, z: 1 },
		{ x: - 1, y: - 0.5, z: 1 },
		{ x: - 1, y: - 0.5, z: - 1 },
	],
	[
		{ x: - 1, y: 0.5, z: - 1 },
		{ x: - 1, y: 0.5, z: 1 },
		{ x: 1, y: 0.5, z: 1 },
		{ x: 1, y: 0.5, z: - 1 },
	]].map( function ( curvePoints ) {

		const curveVertices = curvePoints.map( function ( handlePos ) {

			const handle = new THREE.Mesh( boxGeometry, boxMaterial );
			handle.position.copy( handlePos );
			curveHandles.push( handle );
			scene.add( handle );
			return handle.position;

		} );

		const curve = new THREE.CatmullRomCurve3( curveVertices );
		curve.curveType = 'centripetal';
		curve.closed = true;

		const points = curve.getPoints( 50 );
		const line = new THREE.LineLoop(
			new THREE.BufferGeometry().setFromPoints( points ),
			new THREE.LineBasicMaterial( { color: 0x00ff00 } )
		);

		scene.add( line );

		return {
			curve,
			line
		};

	} );
	*/

}

function DisplayModelVetices({geom}) {

	var size = 0.05;


	var verts = geom.attributes.position.array;
	let highlightBoxes = [];

	const verticesClicked = [];
	const positionsClicked = []
	const allVertices = []

	const vertBoxes = useRef([]);

	const OutPutVertices = () => {
		let newIndex = [];
		for(let vI in verticesClicked) {
			let vertexI = verticesClicked[vI]
			newIndex.push( parseInt(vertexI) + 1 );
		}
		// console.log(allVertices, newIndex)
		console.log( newIndex.join(',') )
		// console.log( verticesClicked.join(',') )
		// console.log(positionsClicked)
		// console.log('clicked', verticesClicked)
	}

	const AddToClicked = (verticeIndex) => {
		let clickedCube = vertBoxes.current[verticeIndex];
		clickedCube.material = materialClicked
		clickedCube.scale.set(.5,.5,.5)

		let vIndex = allVertices.indexOf(verticeIndex);
		if(vIndex != -1) {
			allVertices.splice(vIndex, 1)
		}
		// Add to clicked
		let VfIndex = verticesClicked.indexOf(verticeIndex);
		if(VfIndex == -1) {
			verticesClicked.push(verticeIndex)	
		}
		console.log(verticesClicked)
		const clickedPosArray = [verts[verticeIndex], verts[verticeIndex + 1], verts[verticeIndex + 2]  ]
		// console.log(clickedPosArray)
		positionsClicked.push(clickedPosArray)
	}

	let vIndexIncr = 1;

	let vertIndex = 0;
	for (let k=0; k<verts.length; k+=3) {

		var vertGeometry = new THREE.BoxGeometry(size, size, size);
		
		// vertGeometry.attributes.position.x = verts[k];
		// vertGeometry.attributes.position.y = verts[k + 1]; 
		// vertGeometry.attributes.position.z = verts[k + 2]; // new THREE.Vector3(verts[k],verts[k+1],verts[k+2])
		vertGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(verts[k],verts[k+1],verts[k+2]));

		let leName = 'vertice-' + k;

		// onPointerOver

		const verticeIDr =	<mesh
				ref={ (element) => vertBoxes.current[k] = element }
				key={leName}
				// position={[verts[k],verts[k+1],verts[k+2]]}
				onClick={(event) => {
						AddToClicked(k)
						event.stopPropagation();
					}
				}
				name={leName}
				geometry={vertGeometry}
				material={vertMaterial}
			></mesh>

		highlightBoxes.push(verticeIDr);

		allVertices.push(k)

		vertIndex++;
	}
	// console.log(vertBoxes)

	// Output Box
	let btnSize = 1;
	var btnGeometry = new THREE.BoxGeometry(btnSize, btnSize, btnSize);

	const OutPutBox = <mesh
				onClick={(event) => {
						OutPutVertices()
						// event.stopPropagation();
					}
				}
				position={[1.1, -1, 0]}
				geometry={btnGeometry}
				material={vertMaterial}
			></mesh>

			console.log(OutPutBox)

	return 	 <>
			<mesh
				name="foonBase"
				geometry={geom}
				material={materialPhoneBase}
			></mesh>
			<mesh
				name="foonBaseOutline"
				geometry={geom}
				material={materialPhoneBaseEdge}
			></mesh>
			{highlightBoxes}
			{OutPutBox}
			</>
}

function raiseVertices(geom, points, amount) {
	// console.log(points.length)
	for(let vI of points) {
		// console.log(vI)
		geom.array[vI + 1] += amount
	}
	// points = points.sort()
	points.sort(function(a, b) {
	  return a - b;
	});

	console.log(points)
}
export default function VertexIdentifier() {

	const { nodes } = useGLTF(modelPath);

	let diamond = nodes.tube100.geometry

	/*
	let diamond = nodes.diamond.geometry
	
	let piramid = nodes.piramid.geometry
	let cube = nodes.cube.geometry
	let capsule = nodes.capsule.geometry
	let brilliant = nodes.brilliant.geometry
	let emerald = nodes.emerald.geometry
	let heart = nodes.heart.geometry
	
	// let boxGeom = nodes.phoneBase.geometry


	let boxGeom = getCurveGeometry()
	*/

	// console.log(nodes)
	let bgColor = '#cccccc';

	/* Box 

	const boxGeom = new THREE.BoxGeometry(1, 1, 30, 1,1,99)
	const cubeMeshPos = boxGeom.getAttribute( 'position' );
	let toincr = [441, 1056, 141, 756,1515, 1512, 2085, 2082]

	let SliceLast = [597, 900, 600, 297,1200, 1203, 2397, 2394, 2415, 2421, 2418, 2412]
	*/
	// raiseVertices(cubeMeshPos, SliceLast, 2)
	
	/*
	// console.log(cubeMeshPos)
	let Slice1 = [294,603,903,594,2391,2388,1206,1209]
	raiseVertices(cubeMeshPos,Slice1,-1.2)

	let Slice2 = [591,906,606,291,1215,1212,2382,2385]
	raiseVertices(cubeMeshPos,Slice2,.6)

	let Slice3 = [588,288,609,1218,1221,2379,909,2376]
	raiseVertices(cubeMeshPos,Slice3,-.6)

	let Slice4 = [585,285,612,912,2373,2370,1227,1224]
	raiseVertices(cubeMeshPos, Slice4, 1.1)

	let Slice5 = [615,282,915,582,2367,2364,1233,1230]
	raiseVertices(cubeMeshPos, Slice5, -1.1)

	let Slice6 = [279,618,918,579,1236,1239,2358,2361]
	raiseVertices(cubeMeshPos, Slice6, 2)

	let Slice7 = [276,621,921,576,2352,1242,1245,2355];
	raiseVertices(cubeMeshPos, Slice7, -1.3)

	let Slice8 = [573,273,624,924,2346,2349,1251,1248]
	raiseVertices(cubeMeshPos, Slice8, 1.3)

	let SliceMid = [174,723,474,1023,2151,2148,1449,1446]
	raiseVertices(cubeMeshPos, SliceMid, 1.3)
	*/

	// Full Raise
	/*
	let SliceStart = [300,1197,897,0,1794,1797,1800,1803,2400,2403,2409,2406];
	raiseVertices(cubeMeshPos, SliceStart, -1.3)

	let SliceEndMinOne = [3,894,303,1194,1788,1791,1806,1809];
	raiseVertices(cubeMeshPos, SliceEndMinOne, 1.3)


	let Slice02 = [1191,306,6,891,1782,1785,1812,1815]
	raiseVertices(cubeMeshPos, Slice02, -1.3)

	let Slice03 = [309,9,888,1188,1821,1818,1779,1776]
	raiseVertices(cubeMeshPos, Slice03, 1.3)

	let Slice04 = [312,1185,12,885,1827,1773,1770,1824]
	raiseVertices(cubeMeshPos, Slice04, -1.3)
	*/

	/*
	let VsStartTop = [0,897,1794,1797,2400,2403]
	raiseVertices(cubeMeshPos, VsStartTop, 1.3)

	let VsStartBot = [300,1197,1800,1803,2406,2409]; // first bottom ones
	raiseVertices(cubeMeshPos, VsStartBot, -1.3)

	let Vs01Top = [3,894,1788,1791]
	raiseVertices(cubeMeshPos, Vs01Top, 1.3)

	let Vs01Bot = [303,1194,1806,1809]
	raiseVertices(cubeMeshPos, Vs01Bot, -1.3)

	let VsEndTop = [297,600,1200,1203,2412,2415]
	raiseVertices(cubeMeshPos, VsEndTop, 1.3)
	let VsEndBot = [597,900,2394,2397,2418,2421]
	raiseVertices(cubeMeshPos, VsEndBot, -1.3)
	*/


	const phonePlacement = {
		position: [0,0,-8.5],
		rotation: [0,0,Math.PI ]
	}

	return (<>
		<Canvas>   
			<DisplayModelVetices geom={diamond} />
			{/*<PlaceAlongSpline geom={boxGeom} verticesGeom={diamond} />			*/}
			{/*<Phone placement={phonePlacement} />*/}
			{/*<PhoneCurve />*/}
			<OrbitControls />
			<color args={[bgColor]} attach="background" />
		</Canvas>
	</>
	)

}

useGLTF.preload(modelPath);