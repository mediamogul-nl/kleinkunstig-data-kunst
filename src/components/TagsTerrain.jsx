import { OrbitControls, Text3D } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import { Debug } from '@react-three/rapier'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { useState, useRef  } from 'react'
import { useFrame, Canvas, useThree } from '@react-three/fiber'

import {textMaterial} from './materials/ProjectMaterials'
import DelUI from './helpers/DelUI'

import ApiDataLoader from './ApiDataLoader'

const effectController = {
	minColor: '#00ffff',
	maxColor: '#ff00ff',
	edgeColor: '#0000ff',
	bgColor: '#000000'
}
function setupGui() {
	// Remove others
	DelUI()

	// Start the new one
	const gui = new GUI();

	let h;
	// Colors
	h = gui.addFolder( 'Colors' );
	h.addColor( effectController, 'maxColor').onChange(() => { updateMaterialColors() });
	h.addColor( effectController, 'minColor').onChange(() => { updateMaterialColors() });
	h.addColor( effectController, 'edgeColor').onChange(() => { updateMaterialColors() });
	h.addColor( effectController, 'bgColor').onChange(() => { updateMaterialColors() });
	// gui.addColor(parameters, 'color').onChange(() => { material.color.set(parameters.color) })
}

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color1: {
      value: new THREE.Color( effectController.minColor )
    },
    color2: {
      value: new THREE.Color( effectController.maxColor )
    },
    bboxMin: {
      value: new THREE.Vector3(0, 0, 0)
    },
    bboxMax: {
      value: new THREE.Vector3(0, 0, 0)
    }
  },
  vertexShader: `
    uniform vec3 bboxMin;
    uniform vec3 bboxMax;
  
    varying vec2 vUv;

    void main() {
      vUv.y = (position.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color1;
    uniform vec3 color2;
  
    varying vec2 vUv;
    
    void main() {
      
      gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
    }
  `
});

const materialEdges = new THREE.MeshBasicMaterial({
	color: 0x00ff00, 
	wireframe: true
});
const materialDays = new THREE.MeshBasicMaterial({
	color: 0xffffff, 
	// wireframe: true
});

const material2 = new THREE.MeshPhysicalMaterial({
    color: 0x0000ff,
    // wireframe: SETTINGS.wireframe,
    side: THREE.DoubleSide,
});

/*             _     __
   ____ ______(_)___/ /
  / __ `/ ___/ / __  / 
 / /_/ / /  / / /_/ /  
 \__, /_/  /_/\__,_/   
/____/  settings*/

const gridSize = 100

// Points per day block
const pointsBlock = 100
const pointsSide = Math.sqrt(pointsBlock)
// Vertex width of Border around the full grid
const borderWidth = 1
const borderSize = borderWidth * 2;
// How many blocks to place
const numBlocks = 100;
// Blocks per row
const blocksPerRow = Math.sqrt(numBlocks)

const pointsRowNetto = (blocksPerRow * pointsSide)
const pointsRowBruto = pointsRowNetto  + borderSize
// console.log('pointsRowBruto', pointsRowBruto)

/*  ____             
   / __ \____ ___  __
  / / / / __ `/ / / /
 / /_/ / /_/ / /_/ / 
/_____/\__,_/\__, /  
            /____/  boxes */
let 	dayBlockSize   = (numBlocks / (10 + (borderWidth / blocksPerRow) ) )
let 	dayBlockH      = dayBlockSize;
const 	dayBlockWidth  = .05;
let 	dayBlockGeom   = new THREE.BoxGeometry(dayBlockWidth, dayBlockH, dayBlockWidth);
const   dayBlockOffset = borderWidth;
const   dayZeroPoint   = {x: (-.5 * numBlocks) + dayBlockOffset, y: (-.5 * numBlocks) + dayBlockOffset};
// const 	dayMesh        = new THREE.Mesh(dayBlockGeom, materialDays);
let    dayBlockScaleSize = 1;
function DayBoxes() {
	// resetDayGeoms()
	const boxes = [];
	dayBlockGeom   = new THREE.BoxGeometry(dayBlockWidth, dayBlockH, dayBlockWidth);
	// console.log('add DayBoxes')
	for(let i = 0; i < gridSize; i++) {
		boxes.push( <AddDayBox key={i} index={i} /> )
	}
	return boxes;
}

const AddDayBox = ({index = 0}) => {
	// console.log('AddDayBox!', index)
	let pos_x = index%blocksPerRow
	let pos_y = Math.floor( index / blocksPerRow);// Math.floor( numDays / index )

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

	const DayTxt =  <Text3D 
					letterSpacing={-0.06}
			        material={textMaterial}
		        	font="./fonts/helvetiker_regular.typeface.json"
		        	size= {.5}
		        	height={.1}  
		        	position={dayTxtPos}    	
	        	>{dayTxtIndex}
		        </Text3D>

	const curCube = 
			<group>
				{DayTxt}
				<mesh
				    geometry={ dayBlockGeom }
				    material={materialDays}        
		        	position={dayPos}
		        >
		        </mesh>
	        </group>

	return curCube
}

let dayIndex = {}

function getGridIndex(i) {
	let tileStartI = Math.floor( i / (gridSize * 10));
	let endIndex   = i.toString();
	endIndex       = endIndex.substring(endIndex.length - 2)
	let tileEndI   = Math.floor( endIndex / 10 )
	let tileIndex  = tileStartI.toString() + tileEndI.toString()

	if(!dayIndex.hasOwnProperty(tileIndex)) {
		dayIndex[tileIndex] = 0;
	} else {
		dayIndex[tileIndex]++
	}
	let tileI = dayIndex[tileIndex]
	tileI = (tileI < 10) ? '0' + tileI : tileI;

	let gridPointDef = tileIndex + '.' + tileI
	return gridPointDef;
}
let curGL;
function HeightMap({grid}) {

	const geometry          = new THREE.PlaneGeometry(numBlocks, numBlocks, (pointsRowBruto - 1), (pointsRowBruto - 1));
	const positionAttribute = geometry.getAttribute( 'position' );

	let maxYH = 0
	// Reset day index
	dayIndex = {}

	let gridIndexI = 0

	let i;
	for ( i = 0; i < positionAttribute.count; i ++ ) {

		// We are past the first border
		if(i >= pointsRowBruto) {
			// Check if the counter is at start or end of a line
			let lineStart = ( (i > 0) &&  i%pointsRowBruto === 0);
			let lineEnd   = ( (i > 0) &&  (i + 1)%pointsRowBruto  === 0);
					
			// Start or end of a line? do not increment gridIndex
			if( lineStart || lineEnd) {
				continue;
			} else {
				let gridPointDef = getGridIndex(gridIndexI);
				// do something with vertex
				let yIncr = (grid.hasOwnProperty(gridPointDef)) ? grid[gridPointDef] : 0;
				positionAttribute.setZ( i,  yIncr ); // write coordinates back

				if(yIncr > maxYH) { maxYH = yIncr}			

				gridIndexI++
			}	
		}
	}

	// console.log('maxYH', maxYH, 'max i', i)
	if(maxYH > dayBlockH) { dayBlockH = maxYH } else { dayBlockH = dayBlockSize}
	// console.log('HeightMap - vertexes updated: dayBlockH', dayBlockH);
    
    // to to make sure our changes to the buffer attribute is taken into account
    geometry.attributes.position.needsUpdate = true;
    // compute normals so shading works properly
    geometry.computeVertexNormals();

    // Update shader uniforms
	geometry.computeBoundingBox();

	// console.log(geometry.boundingBox.max);
	shaderMaterial.uniforms.bboxMin.value = geometry.boundingBox.min;
	shaderMaterial.uniforms.bboxMax.value = geometry.boundingBox.max;

	useThree(({renderer, scene, camera}) => {
		curGL = {
			renderer: renderer,
			scene: scene,
			camera: camera,			
		}
	});


	updateMaterialColors();

	return <>
		<mesh geometry={geometry} material={materialEdges} position-y={.01} rotation-x={ Math.PI * -0.5 } />
		<mesh receiveShadow castShadow geometry={geometry} material={shaderMaterial} rotation-x={ Math.PI * -0.5 } />
	</>
	// console.log('get that HeightMap', grid)
}
function updateMaterialColors() {
	shaderMaterial.uniforms.color1.value = new THREE.Color( effectController.minColor )
	shaderMaterial.uniforms.color2.value = new THREE.Color( effectController.maxColor )

	// console.log(curGL)

	curGL.scene.background = new THREE.Color( effectController.bgColor );
	materialEdges.color.set(effectController.edgeColor);
}
export default function TagsTerrain(props) {

	const [grid, setGrid] = useState(false)

	setupGui()

	// console.log('TagsTerrain')

	const dataLoaded = (props) => {
		// console.log('TagsTerrain has dataLoaded')
		setGrid(props)
	}

	const uiCanvas = useRef();

	const getCanvasInfo = (e) => {
		/*
		useThree(({camera}) => {
			console.log(camera)
			// camera.rotation.set(deg2rad(30), 0, 0);
		});
		*/		// console.log(getCanvasInfo, e)
		// console.log(uiCanvas.current)
	}
	
	const deg2rad = degrees => degrees * (Math.PI / 180);	

	return (<>
		{/*<DelUI />*/}
		<ApiDataLoader dataLoaded={dataLoaded} />
	    <Canvas
	    	ref={uiCanvas}
	        camera={ {
	            fov: 45,
	            near: 0.1,
	            far: 200,
	            position: [ 0, 30, 80 ],
	            rotation: [deg2rad(180), 0, 0]
	        } }
	        onDoubleClick={getCanvasInfo}
	    >   
	    	<Perf position="bottom-right" />
		    <OrbitControls makeDefault />
			{grid &&
				<>
		        <directionalLight
		            castShadow
		            position={ [ 4, 40, 1 ] }
		            intensity={ 1.5 }
		            shadow-mapSize={ [ 1024, 1024 ] }
		            shadow-camera-near={ 1 }
		            shadow-camera-far={ 10 }
		            shadow-camera-top={ 10 }
		            shadow-camera-right={ 10 }
		            shadow-camera-bottom={ - 10 }
		            shadow-camera-left={ - 10 }
		        />
		            <ambientLight intensity={ 1 } />
					<HeightMap grid={grid.num_per_index} />
		            <DayBoxes /> 
				</>
			}
	        <color args={[effectController.bgColor]} attach="background" />
	    </Canvas>
	</>
	)
}