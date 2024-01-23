import * as THREE from 'three'
import { useState, useRef  } from 'react'
import { useFrame, Canvas } from '@react-three/fiber'
import {invertColor} from './helpers/ColorHelpers'

import ApiDataLoader from './ApiDataLoader'
import {PhoneDayCounters, DAY_FRAMER} from './helpers/VisualsDataExchange'
import {GridHelper} from './helpers/GridHelpers'

const effectController = {
	minColor: '#00ffff',
	maxColor: '#ff00ff',
	edgeColor: '#ffffff',
	speed: 20
}
// let playBackSpeed = effectController.speed;


const material = new THREE.MeshPhongMaterial({
	color: 0x0000ff, 
	wireframe: true
});

const materialEdges = new THREE.MeshPhongMaterial({
	color: effectController.edgeColor, 
	wireframe: true,
	transparent: true,
	opacity: .2
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
		vUv.y = (bboxMax.z == bboxMin.z) ? 0.0 : vUv.y;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
	}
  `,
  fragmentShader: `
    uniform vec3 color1;
  
    varying vec2 vUv;
    
    void main() {
		vec3 colorInv = color1;
		colorInv.xyz = vec3(1, 1, 1) - colorInv.xyz;
		gl_FragColor = vec4(mix(color1, colorInv, vUv.y), 1.0);
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

// let geometry;
// let geomPosAttr;

const mobileSize = false;

function HeightMapBase() {

	// Create geometry
	const geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridSize - 1, gridSize - 1);
	// Extract position
	const geomPosAttr = geometry.getAttribute( 'position' );
	// console.log(geomPosAttr)

	const displayScale = (mobileSize) ? [1, 1.777, 1] : [1, 1, 1];
	const baseShader = shaderMaterial.clone()
	
	return {
		group: <>		
		<mesh scale={displayScale} geometry={geometry} material={materialEdges} position-y={.01} rotation-x={ Math.PI * -0.5 } />
		<mesh scale={displayScale} receiveShadow castShadow geometry={geometry} material={baseShader} rotation-x={ Math.PI * -0.5 } />
	</>,
		geometry,
		geomPosAttr,
		baseShader
	}
}

// Day pole
const dayBlockWidth = .05
const DaySize       = gridSize;// / 2
const dayBlockGeom  = new THREE.BoxGeometry(dayBlockWidth, DaySize, dayBlockWidth)
// let   dayNum        = 0

let dayIndicatorFrameI = 0;
let dayIndicatorDayI = 0;
// let dayFrame = 0;

function HeightMapAnimator({grid, visualID, playBackSpeed, geometry, geomPosAttr, baseShader, colorSettings}) {
	// console.log('Initializing HeightMapAnimator, playBackSpeed:', playBackSpeed)

	let prev_day = -1
	let dayFrame = DAY_FRAMER.day
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
			let lerpIncr = offset / playBackSpeed;
			if(lerpIncr == 0) { lerpIncr = 1; }

			displayDayPeaks(time, lerpIncr)

			if(prev_day != DAY_FRAMER.day) {
				dayFrame = DAY_FRAMER.day
				prev_day = DAY_FRAMER.day
			}
		}
	})

	const GridPoints = (grid.hasOwnProperty('gridindex')) ? grid.gridindex : grid.num_per_index // gridindex
	const GridParsed = GridHelper(GridPoints, false)

	// console.log('GridParsed', GridParsed)

	const maxPointHeight = 7
	const heightDivider = (GridParsed.max > maxPointHeight) ? maxPointHeight / GridParsed.max  : 1

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
				let yIncr = (GridPoints.hasOwnProperty(gridPointDef)) ? GridPoints[gridPointDef] * heightDivider : 0;
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
		baseShader.uniforms.bboxMin.value = geometry.boundingBox.min;
		baseShader.uniforms.bboxMax.value = geometry.boundingBox.max;
		// console.log(geometry.boundingBox.max)

		baseShader.uniforms.color1.value = new THREE.Color( colorSettings.minColor )
		// shaderMaterial.uniforms.color2.value = new THREE.Color( effectController.maxColor )

		materialEdges.color.set(colorSettings.edgeColor);

		// dayFrame++;
	}
}

// Put it together for export
export default function DayHeightMap({grid, playBackSpeed, displayColor, visualID}) {

	const [gridData, setGridData] = useState(grid)

	// console.log('DayHeightMap grid', grid)

	let colorSettings
	if(displayColor) {
		// console.log('yesch displayColor')
		colorSettings = {
			minColor: displayColor,
			edgeColor: invertColor( displayColor.getHexString() )			
		}
	}

	const {group, geometry, geomPosAttr, baseShader} = HeightMapBase()

	return (<group position={[-6,0.1,-6]} rotation-y={Math.PI} name="vis_type_wrapper">
			<HeightMapAnimator 
				geometry={geometry} 
				colorSettings={colorSettings} 
				baseShader={baseShader} 
				geomPosAttr={geomPosAttr} 
				grid={gridData} 
				visualID={visualID} 
				playBackSpeed={playBackSpeed} 
			/>
		    {group}
		</group>
	)
}