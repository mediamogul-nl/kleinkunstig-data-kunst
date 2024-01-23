import * as THREE from 'three'
import { useMemo, useState, useRef  } from 'react'
import { useFrame } from '@react-three/fiber'

import {invertColor} from './helpers/ColorHelpers'
import {PhoneDayCounters, DAY_FRAMER} from './helpers/VisualsDataExchange'

/* Shader stuff */
const effectController = {
	minColor: '#00ffff',
	maxColor: '#ff00ff',
	edgeColor: '#0000ff',
	bgColor: '#000000',
	DaysColor: '#ffffff',
	speed: 10
}
// let playBackSpeed = 10;

// import * as DBx from './DayBox'

const materialEdges = new THREE.MeshBasicMaterial({
	color: 0xff0000, 
	wireframe: true,
	transparent: true,
	opacity: .2
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
let 	dayBlockSize     = (numBlocks / (10 + (borderWidth / blocksPerRow) ) )
let 	dayBlockH        = dayBlockSize;
const 	dayBlockWidth    = .05;
let 	dayBlockGeom     = new THREE.BoxGeometry(dayBlockWidth, dayBlockH, dayBlockWidth);
const   dayBlockOffset   = borderWidth;
const   dayZeroPoint     = {x: (-.5 * numBlocks) + dayBlockOffset, y: (-.5 * numBlocks) + dayBlockOffset};
let    dayBlockScaleSize = 1;

let dayIndex = {}
const zigzag = true;

function getGridIndex(i) {
	let tileStartI = Math.floor( i / (gridSize * 10));
	let endIndex   = i.toString();
	endIndex       = endIndex.substring(endIndex.length - 2)
	let tileEndI   = Math.floor( endIndex / 10 )

	if(zigzag && tileStartI%2 === 1 ) {
		tileEndI = Math.abs( tileEndI - 9 )
		// console.log('reverse ordah!', tileStartI, 'tileEndI:', tileEndI, revTileEndI)
	}

	let tileIndex  = tileStartI.toString() + tileEndI.toString()

	// console.log('tileIndex', tileStartI)

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

let points2GridIndex = {};
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
			vUv.y = (bboxMax.z == bboxMin.z) ? 0.0 : (position.z - bboxMin.z) / (bboxMax.z - bboxMin.z);
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


let vertices2Update = [];

let geomPosAttr;
let dayVertices = {}
let activeGrid
let geometry
let curAmountMin, curDivide

function HeightMap({grid, playBackSpeed, visualID}) {
	
	// console.log('Build that HeightMap!', grid)
	activeGrid = grid;

	vertices2Update = [];
	dayIndex = {}
	points2GridIndex = {}

	const {amount_min, amount_max} = get_min_max(grid);//['00.00'];
	// const amount_max = grid['99.99'];
	const max_h      = 100;
	const divide     = max_h / amount_max;

	// Set to outside scope cuz we lazy
	curAmountMin = amount_min;
	curDivide = divide;

	// console.log('amount_min',amount_min, 'amount_max', amount_max, 'divide', divide)

	const pointsPerSide = (pointsRowBruto - 1);

	geometry          = new THREE.PlaneGeometry(numBlocks, numBlocks, pointsPerSide, pointsPerSide);
	geomPosAttr = geometry.getAttribute( 'position' );
	const maxFrames = geomPosAttr.count / 10;
	// console.log(maxFrames)

	let maxYH = 0
	dayBlockH = dayBlockSize
	
	let gridIndexI = 0

	for ( let i = 0; i < geomPosAttr.count; i ++ ) {

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
				let yIncr = getGridYIncr(gridPointDef)

				// Add to day block data
				let curDay = gridPointDef.split('.')[0]
				if(!dayVertices.hasOwnProperty(curDay)) { dayVertices[curDay] = []; }

				// Add to vertices2update if has actual height change
				if(yIncr > 0) {	
					vertices2Update[i] = gridPointDef; 
					dayVertices[curDay].push(i);
				}

				if(yIncr > maxYH) { maxYH = yIncr}			

				gridIndexI++

				// Put clickmap together of this here fuckery
				let row_i   = Math.floor( i / pointsRowBruto);
				let coord_x = ( i - (row_i * pointsRowBruto) ) - (gridSize / 2);
				let coord_y = row_i - (gridSize / 2);

				// Add itttt
				points2GridIndex[coord_x + '.' + coord_y] = {
					gridPoint: gridPointDef, 
					poleX: coord_x,
					poleY: yIncr,
					poleZ: coord_y,
				}
			}	
		}
	}
	// console.log( dayVertices )

	if(maxYH > dayBlockH) { dayBlockH = maxYH } else { dayBlockH = dayBlockSize}


	let prev_day = -1
	let dayFrame = DAY_FRAMER.day
	let frame_i = 0;

	let animationReset = false;
	const maxDayFrames = 99

	useFrame((state) => {
		const time = state.clock.getElapsedTime()
		frame_i++;
		// Calc lerp increment (percentage to change from old to new point 0, 0.9)
		let offset   = frame_i%playBackSpeed;
		let lerpIncr = offset / playBackSpeed;
		if(lerpIncr == 0) { lerpIncr = 1; }

		updateFrameVertices(dayFrame, lerpIncr, animationReset)

		if(prev_day != DAY_FRAMER.day) {
			let dayDifference = DAY_FRAMER.day - prev_day
			if(dayDifference != 1) { MeshReset( (DAY_FRAMER.day) )	}					
			prev_day = DAY_FRAMER.day
			dayFrame = DAY_FRAMER.day
			// console.log('dayFrame', dayFrame)
			// Time for a reset
			if(dayFrame == 0) {
				MeshReset()
			}
		}
	})

	function MeshReset( reset2Day = 0 ) {
		let dayFrameMin = maxDayFrames;
		for(let revDayI = dayFrameMin; revDayI >= 0; revDayI-- ) {
			let dayKey = (revDayI < 10) ? '0'+revDayI : revDayI;
			if(dayVertices.hasOwnProperty(dayKey)) {
				let dayVertices2Update = dayVertices[dayKey]
				// to zero, or reset to prev val
				let set2Val = (revDayI < reset2Day) ? true : false
				for(let vI of dayVertices2Update) {
					let yIncr  = 0
					if(set2Val) {
						let frameGridIndex = vertices2Update[vI];
						yIncr = getGridYIncr(frameGridIndex)
					}
					let geomPosI = vI * 3;
			        geomPosAttr.array[geomPosI + 2] = yIncr;
				}
			}
		}
	}

	return <group position={10,10,0}>
		{/*<mesh  geometry={geometry} material={materialEdges} position-y={.01} rotation-x={ Math.PI * -0.5 } />*/}
		<mesh receiveShadow castShadow geometry={geometry} material={shaderMaterial} rotation-x={ Math.PI * -0.5 } />
	</group>
	// console.log('get that HeightMap', grid)
}
function getGridYIncr(gridPoint) {
	let yIncr = (activeGrid.hasOwnProperty(gridPoint)) ? activeGrid[gridPoint] : 0;
	yIncr -= curAmountMin
	yIncr = yIncr * curDivide;
	if(yIncr < 0) { yIncr = 0; }
	return yIncr;
}

function updateFrameVertices(day_i, lerpIncr, reset) {
	// console.log('day_i', day_i)
	let dayKey = (day_i < 10) ? '0'+day_i : day_i;
	if(dayVertices.hasOwnProperty(dayKey)) {
		let dayVertices2Update = dayVertices[dayKey]
		// console.log(dayKey, dayVertices2Update)
		for(let vI of dayVertices2Update) {
			let frameGridIndex = vertices2Update[vI];
			let yIncr          = (reset) ? 0 : getGridYIncr(frameGridIndex)
			let geomPosI       = vI * 3;
			// Determine current point
			var v = new THREE.Vector3(geomPosAttr.array[geomPosI], geomPosAttr.array[geomPosI + 1], geomPosAttr.array[geomPosI + 2]);
			// Create new vec3 for that
	        var v2 = new THREE.Vector3(geomPosAttr.array[geomPosI], geomPosAttr.array[geomPosI + 1], yIncr );
	        // Lerp to it
	        v.lerp(v2, lerpIncr);
	        // Update the points Y position
	        geomPosAttr.array[geomPosI + 2] = v.z;
		}
		GeometryUpdated()
	}
}

function GeometryUpdated() {
    // to to make sure our changes to the buffer attribute is taken into account
    geometry.attributes.position.needsUpdate = true;
    // compute normals so shading works properly
    geometry.computeVertexNormals()

	geometry.computeBoundingBox()

	updateMaterialColors()

}
function updateMaterialColors() {
	// console.log(geometry.boundingBox)
	shaderMaterial.uniforms.bboxMin.value = geometry.boundingBox.min;
	shaderMaterial.uniforms.bboxMax.value = geometry.boundingBox.max;
	shaderMaterial.uniforms.color1.value = new THREE.Color( effectController.minColor )

	materialEdges.color.set(effectController.edgeColor);
}
function get_min_max(grid) {
	let min = grid['00.00'];
	let max = grid['99.99'];
	for (let gi in grid) {
		let grVal = grid[gi];
		if(grVal <  min) { min = grVal; }
		if(grVal > max) { max = grVal; }
	}
	return {amount_min: min, amount_max: max }
	// const amount_max = grid['99.99'];

}
 
export default function CreatorHeightmap({grid, playBackSpeed, displayColor, visualID}) {

	const [dataGrid, setDataGrid] = useState(grid.gridindex)

	// console.log('dataGrid', dataGrid)

	effectController.minColor = displayColor
	effectController.edgeColor= invertColor( displayColor.getHexString() )


		    

	return (
		<group 
			position={[-5.25,0.1,-5.25]} 
			scale={[.104,.055,.104]}
			rotation-y={Math.PI}
			name="vis_type_wrapper"
		>
			<HeightMap grid={dataGrid} visualID={visualID} playBackSpeed={playBackSpeed} />
		</group>
	)
}