import { OrbitControls, Text3D } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Debug } from '@react-three/rapier'
import { Suspense, useMemo, useState, useRef  } from 'react'

import DelUI from './helpers/DelUI'

import { useFrame, Canvas } from '@react-three/fiber'

import ApiDataLoader from './ApiDataLoader'

const effectController = {
	minColor: '#00ffff',
	maxColor: '#ff00ff',
	edgeColor: '#0000ff',
	speed: 20
}
let playBackSpeed = effectController.speed;

function setupGui() {

	DelUI()

	const gui = new GUI();

	let h;
	// Colors
	h = gui.addFolder( 'Colors' );
	h.addColor( effectController, 'maxColor' );
	h.addColor( effectController, 'minColor' );
	h.addColor( effectController, 'edgeColor' );
	// Add speed control
	gui.add(effectController, 'speed').min(5).max(30).step(1).name('Speed').onChange(() => {
		playBackSpeed = effectController.speed
	})

}

const material = new THREE.MeshPhongMaterial({
	color: 0x0000ff, 
	wireframe: true
});

const materialEdges = new THREE.MeshPhongMaterial({
	color: effectController.edgeColor, 
	wireframe: true
});
const materialDays = new THREE.MeshPhongMaterial({
	color: 0xffffff, 
	// wireframe: true
});

const material2 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    // wireframe: SETTINGS.wireframe,
    side: THREE.DoubleSide,
    // transparent: true,
    // opacity: 0.6
});


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

/*
component die de HeightMap genereert
component die de HeightMap geometry update elk frame
*/

const numPoints   = 10;
const borderSize  = 1;
const borderWidth = borderSize * 2;
const gridSize    = numPoints + borderWidth;

const maxFrames = 100;

let geometry;
let geomPosAttr;

const mobileSize = false;

function HeightMapBase() {
	setupGui();

	// Create geometry
	geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridSize - 1, gridSize - 1);
	// Extract position
	geomPosAttr = geometry.getAttribute( 'position' );
	// console.log(geomPosAttr)

	const displayScale = (mobileSize) ? [1, 1.777, 1] : [1, 1, 1];
	
	return <>		
		<mesh scale={displayScale} geometry={geometry} material={materialEdges} position-y={.01} rotation-x={ Math.PI * -0.5 } />
		<mesh scale={displayScale} receiveShadow castShadow geometry={geometry} material={shaderMaterial} rotation-x={ Math.PI * -0.5 } />
	</>
}

// Day pole
const dayBlockWidth = .05
const DaySize       = gridSize;// / 2
const dayBlockGeom  = new THREE.BoxGeometry(dayBlockWidth, DaySize, dayBlockWidth)
// let   dayNum        = 0

let dayIndicatorFrameI = 0;
let dayIndicatorDayI = 0;

function getDayTextPos() {
	const dayTxtPos = [-.4 * DaySize, DaySize / 2 , -0.5 * DaySize];
	const half = DaySize / 2;
	const dayPos = [ -.5 * DaySize, half, -0.5 * DaySize];
	return {dayPos, dayTxtPos};
}
const {dayPos, dayTxtPos} = getDayTextPos();

function DayIndicator()  {

	const [dayNo, setDayNo] = useState(1)


	let dayFrame = 0;// '==xxx===xxx==xxx';


	useFrame((state) => {
		// console.log('DayIndicator frame yo')
		const time = state.clock.getElapsedTime()
			dayIndicatorFrameI++;
			if(dayIndicatorFrameI%playBackSpeed === 0) {
				updateDayIndex()
			}
	})
	const updateDayIndex = () => {
		if(dayIndicatorDayI === maxFrames) { dayIndicatorDayI = 0;}
		dayIndicatorDayI++;
		setDayNo(dayIndicatorDayI)
	}
	const dayTxtRef = useRef()


	// Make the days face the camera
	useFrame((state, delta, xrFrame) => {
		// console.log(state.camera.rotation)
		dayTxtRef.current.lookAt( state.camera.position );
	})	        

	const DayTxt =  <Text3D 
					ref={dayTxtRef}
			        material={material2}
			        letterSpacing={-0.06}
		        	font="./fonts/TASA_Orbiter_Display_Black.json"
		        	size= {5}
		        	height={.5}  
		        	position={dayTxtPos}    	
	        	>{dayNo}
		        </Text3D>

	return DayTxt;	        		 
}
function DayPole() {
	return <mesh
	    geometry={ dayBlockGeom }
	    material={materialDays}        
		position={dayPos}
	/>
}

// let dayFrame = 0;

function HeightMapAnimator({grid, updateDay, dayNum}) {
	// console.log('Initializing HeightMapAnimator')

	let dayFrame = 0;
	dayIndicatorDayI = 0
	let played = false;
	// Update per X frames
	let frame_i = 0;
	useFrame((state) => {
		const time = state.clock.getElapsedTime()
		if(grid) {
			frame_i++;
			// Calc lerp increment (percentage to change from old to new point 0, 0.9)
			let offset     = frame_i%playBackSpeed;
			const lerpIncr = offset / playBackSpeed;

			displayDayPeaks(time, lerpIncr)
			// if(frame_i%playBackSpeed === 0) {
				// played = true;
			// }
			if(frame_i%playBackSpeed === 0) {
				dayFrame++;
				if(dayFrame == maxFrames) { dayFrame = 0}
			}
		}
	})

	// Make those vertexes move
	const displayDayPeaks = (time, lerpIncr) => {
		// console.log('- - - - -  displayDayPeaks  -- - - - - ')
		let dayStartIndex = (dayFrame < 10) ? '0' + dayFrame : dayFrame;

		let hor_row_i = 0;
		let gridIndex = 0;
		
		// console.log('gridSize', geomPosAttr.count)

		let arrayPosLen = geomPosAttr.count;
		// arrayPosLen = geomPosAttr.array.length;

		for ( let i = 0; i < arrayPosLen; i ++ ) {

			// Increment horizontal lines placed
			if(i > 0 && i%gridSize === 0) { hor_row_i++; }

			// Check if the counter is at start or end of a line
			let lineStart = (i%gridSize === 0);
			let lineEnd   = ((i + 1)%gridSize === 0);

			// Start or end of a line? do not increment gridIndex
			if( lineStart || lineEnd) {
				continue;
			// We are past the first border
			} else if(i > (borderSize * gridSize)) {
				// magic maths
				gridIndex = i - gridSize - (hor_row_i + hor_row_i - 1);


				// Prepare Key 
				let timeIndex = (gridIndex < 10) ? '0' + gridIndex : gridIndex;
				let gridPointDef = dayStartIndex + '.' + timeIndex;
				// do something with vertex if key found in data
				let yIncr = (grid.hasOwnProperty(gridPointDef)) ? grid[gridPointDef] : 0;
				let geomPosI = i * 3;
				// console.log('geomPosI', geomPosI)
				// Determine current point
				var v = new THREE.Vector3(geomPosAttr.array[geomPosI], geomPosAttr.array[geomPosI + 1], geomPosAttr.array[geomPosI + 2]);
				// Create new vec3 for that
		        var v2 = new THREE.Vector3(geomPosAttr.array[geomPosI], geomPosAttr.array[geomPosI + 1], yIncr );
		        // Lerp to it
		        v.lerp(v2, lerpIncr);
		        // Update the points Y position
		        geomPosAttr.array[geomPosI + 2] = v.z;

                // i += 3;
				// geomPosAttr.setZ( i,  yIncr ); // write coordinates back
			}
		}

        geometry.attributes.position.needsUpdate = true;
        // compute normals so shading works properly
        geometry.computeVertexNormals();

        // Update shader uniforms
		geometry.computeBoundingBox();

		// console.log(geometry.boundingBox.max);
		shaderMaterial.uniforms.bboxMin.value = geometry.boundingBox.min;
		shaderMaterial.uniforms.bboxMax.value = geometry.boundingBox.max;

		shaderMaterial.uniforms.color1.value = new THREE.Color( effectController.minColor )
		shaderMaterial.uniforms.color2.value = new THREE.Color( effectController.maxColor )

		materialEdges.color.set(effectController.edgeColor);

		// dayFrame++;
	}
}
function initCamRotation(camera) {
	console.log(camera)
	camera.rotation.order = 'XYZ';
	camera.rotation._x = 10;// -.47;
}
// Put it together for export
export default function TagDayLoop(props) {

	const [grid, setGrid] = useState(false)

	const dataLoaded = (props) => {
		setGrid(props)
	}

	const updateStats = (props) => {
		// console.log('updateStats', props)
		return props;
	}
	const updateDay = (props) => {
		updateStats(props)
		// console.log('updateDay', props)
	}
	// console.log('TagDayLoop')

	return (<>
		<ApiDataLoader dataLoaded={dataLoaded} />
	    <Canvas
			onCreated={({camera}) => {
				initCamRotation(camera)
			}}	    
	        camera={ {
	            fov: 45,
	            near: 0.1,
	            far: 200,
	            position: [ 0, 11, 22 ],
	            rotation: [-0.47, 0, 0]
	        } }
	    >   
	    	<Perf position="bottom-right" />
		    <OrbitControls makeDefault />
	        <directionalLight
	            castShadow
	            position={ [ 10, 40, 1 ] }
	            intensity={ 1.5 }
	            shadow-mapSize={ [ 1024, 1024 ] }
	            shadow-camera-near={ 1 }
	            shadow-camera-far={ 40 }
	            shadow-camera-top={ 10 }
	            shadow-camera-right={ 10 }
	            shadow-camera-bottom={ - 10 }
	            shadow-camera-left={ - 10 }
	        />
		        {/*<mesh geometry={dayBlockGeom} material={material} position={0,0,0} /> */}
            <ambientLight intensity={ 1 } />
            <DayPole />
		    <HeightMapBase />
			{grid &&
				<>
					<DayIndicator />
					<HeightMapAnimator grid={grid.num_per_index}  />
				</>
			}
	        <color args={['#000000']} attach="background" />
	    </Canvas>
	</>
	)
}