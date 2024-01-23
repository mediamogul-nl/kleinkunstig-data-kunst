import { useGLTF, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useRef, useEffect  } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGesture } from "@use-gesture/react"

import {TikTokLogo, UXIconEdit, UXIconInfo, UXIconDelete, UXIconMove, UXIconScaleUp, UXIconScaleDown, UXIconCreator} from './shapes/Phone'
import {invertColor} from './helpers/ColorHelpers'
import ApiDataLoader from './ApiDataLoader'

import {DayBoxesGrid, setShapeInitYs} from './DayBoxesGrid'
import {VISUAL_OPTIONS} from './constants/DataVisSettings'
import CreatorHeightmap from './CreatorHeightmap'
import DiamondsRing from './DiamondsRing'
import DayHeightMap from './DayHeightMap'
import DiamondsGrid from './DiamondsGrid'
import BigSingleShape from './BigSingleShape'

import LoadingIcon from './helpers/LoadingIcon'
import {getCTRLPos, fit2Bounds, SCALE_PRESSED, reset_scale_pressed} from './DragScale'
import TextDisplay from './TextDisplay'

import {
 	PhoneDayCounters, 
	ActiveVisuals, 
	EditorState, 
	EDTR_ACTIVE_DATA, 
	RESPONSIVE_MODE,
	SHARE_SETTINGS,
	setVisualObject3D 
} from  './helpers/VisualsDataExchange'

import {textMaterial, tagTextMaterial, textMaterialDark, transparentMat} from './materials/ProjectMaterials'

// User Logger
import { UserLog } from  './UserActivityLogger'

THREE.ColorManagement.legacyMode = false

// console.log(MeshRefractionMaterial)

const obstacleMaterial = new THREE.MeshStandardMaterial({ 
	color: 0x00ff00,
	flatShading: true,
	// transparent: true,
	// opacity: .9,
	metalness: 0.4,
	roughness: 0.9,
})
let maxRenderOrder = 100
function showDataVisControls(index, ref2Set, renderer) {
	maxRenderOrder++
	// console.log(ref2Set.current)
	let DataVis = ref2Set.current[index]
	DataVis.renderOrder = maxRenderOrder

	// DataVis.onBeforeRender = function( renderer ) { renderer.clearDepth(); };
	// Hide all others
	let DataVisses = ref2Set.current
	for (let [dv_i, dv] of DataVisses.entries()) {
		if(dv) {
			// console.log('dv', dv, DataVisses)
			let ctrl_btns = dv.getObjectByName('edit_btns')
			if(dv_i == index) {
				// console.log('dv_i', ctrl_btns.visible)
				ctrl_btns.visible = (ctrl_btns.visible) ? false  : true
			} else {
				ctrl_btns.visible = false
				dv.renderOrder = 0
			}
		}
	}
	// renderer.clearDepth()
}

/*
let dataSettings = {mode, tag}
let visualData = {
	shape: getRandShape(),
	color: getRandColor(),
	speed: 15
*/
export default function DataVisualInstance({controller, visualData, index, ref2Set}) {

	// console.log('DATAVISUALINSTANCEDATAVISUALINSTANCEDATAVISUALINSTANCEDATAVISUALINSTANCE')

	// Data Input: tag
	const [curVisualData, setCurVisualData] = useState(visualData)
	const [mode2Load, setMode2Load] = useState( visualData.dataType )
	const [tag2Load, setTag2Load] = useState( visualData.dataTag )

	const [cats2Load, setCats2Load] = useState( '*' )
	const [editI, setEditI] = useState(0)
	
	useEffect(() => {
		console.log('DataVisualInstance:useEffect - visualData has changed')
		setCurVisualData(visualData)
	}, [visualData])
	
	// Data input: Grid
	const [grid, setGrid] = useState(false)
	const [loadingMode, setLoadingMode] = useState(true)

	const dataLoaded = (props) => {
		setLoadingMode(false)
		let vd = {...curVisualData}
		vd.grid = props
		setCurVisualData(vd)
		setGrid(props)
	}

	// console.log('_RNDRD_ DataVisualInstance!', visualData, grid)


	// Data Display: Shape to load
	let initShape = (!curVisualData.shapeType) ? 'cube' : curVisualData.shapeType ;

	let	modelPath = "/models/dayshapes/shapes-bottomed-20231211.gltf"; // dayshapes.gltf
	useGLTF.preload(modelPath);
	
    const DayBoxMaterial = obstacleMaterial.clone();
    DayBoxMaterial.color = curVisualData.displayColor;

	// Data Display: Speed
	const [playBackSpeed, setPlayBackSpeed]	 = useState( curVisualData.hasOwnProperty('displaySpeed') ? curVisualData.displaySpeed : 15 )

	function calculateNewSpeed(newSpeed) {
		const maxSpeed  = 20;
		let speedOffset = newSpeed%maxSpeed;
		let revSpeed    = maxSpeed - speedOffset;
		revSpeed        = (speedOffset == 0) ? 1 : revSpeed + 1;
		// console.log('setPlayBackSpeed',  revSpeed)
		setPlayBackSpeed( revSpeed );
	}
	// Prep an object w nessecaru data for the controller
	const getCallBackObj = () => {
		const visData = {...curVisualData}
		// console.log('- - - triggerInfoMode - - - ', visualIndex)
		if(grid && !visData.hasOwnProperty('grid')) {
			visData.grid = grid	
		}
		return {
    		index: index,
    		visualData: visData
		}
	}

	const triggerInfoMode = () => {
		controller({}, getCallBackObj(), updatePhoneSettings, 'info')
	}

    // Updater
    const props2Update = [
    		'dataType', 
    		'dataTag', 
    		'displayColor', 
    		'displaySpeed', 
    		'visualID', 
    		'visType', 
    		'shapeType',
			'textDisplayTag',
			'textDisplayPos',
			'textDisplayStats',
			'textStatsType',
	]
    const updatePhoneSettings = (props) => {
    	// console.log('DataVisualInstance:updatePhoneSettings!', props.edit, curVisualData )
		// setCurVisualData(props)
    	if(props.hasOwnProperty('edit')) {
    		let editedData = props.edit
    		console.log('editedData', editedData)
    		let triggerInfo = true
    		if(editedData.hasOwnProperty('displaySpeed')) {
    			calculateNewSpeed( parseInt( editedData.displaySpeed ) )
    		}
    		// Categories selected?
    		if(
    			editedData.visType.indexOf('DiamondsGrid') != -1
    			&&
    			editedData.hasOwnProperty('activeCats')
			) {
	    		setCurVisualData(editedData)
	    	}
	    	// Changed to categories ? (dataType was overrwitten somewhere else already, hacky fix incoming :3 )
	    	if(
	    		editedData.shapeType
	    		&&
	    		editedData.shapeType.indexOf('DiamondsGrid') != -1
	    		&&
	    		(
	    			curVisualData.shapeType.indexOf('DiamondsGrid') == -1
	    			||
	    			(
	    				curVisualData.grid.hasOwnProperty('followers')
	    				|| 
	    				curVisualData.grid.hasOwnProperty('videos')
	    			)
	    		)
	    	) {
	    		curVisualData.dataType = 'reset4Cats'
	    	}

    		for(let prop of props2Update) {
				let editHasProp    = editedData.hasOwnProperty(prop)
				let currentHasProp = curVisualData.hasOwnProperty(prop)
    			let propChanged = false
    			if(editHasProp && currentHasProp) {
    				// console.log(curVisualData[prop], editedData[prop], 'same?', (editedData[prop] == curVisualData[prop]))
    			}
    			// console.log(prop, 'edit', editHasProp, 'cur', currentHasProp)

    			if(
    				editedData.hasOwnProperty(prop) 
    				&& 
    				(
	    				(curVisualData.hasOwnProperty(prop) && curVisualData[prop] != editedData[prop])
	    				||
	    				(!curVisualData.hasOwnProperty(prop))
	    			)
				) {
					// console.log('we gonna update', prop)
    				switch(prop) {
	    				case 'dataType':
	    				case 'dataTag':
	    					// Reload the entire ting anyway
	    					setGrid(false)
	    					delete curVisualData['grid']; 
	    					// setLoadingMode(true)
				    		setCurVisualData(editedData)
				    		triggerInfo = false
	    				  break;
	    				default:
				    		setCurVisualData(editedData)	    					
	    				  break;
	    				  /*
	    				case 'shapeType':
	    					curVisualData.shapeType = editedData.shapeType
	    				  break;
	    				case 'displayColor':
	    					curVisualData.displayColor = editedData.displayColor
	    				  break;
	    				  */
    				}
				}
    		}
    		UserLog({visualEdited:editedData})
    		setEditI( editI + 1 )
    	}
    }

    // Position
    const getBasePosition = () => {
    	let defaultPos = [0,0,0]
    	if(ActiveVisuals[index]) {
			const basePos =	(ActiveVisuals[index].hasOwnProperty('position')) ? ActiveVisuals[index].position : defaultPos 
			ActiveVisuals[index].position = basePos
			return basePos
		}
		return defaultPos
    }

    const getBaseScale = () => {
    	let initScale = VISUAL_OPTIONS[curVisualData.visType].scaleInit
    	if(ActiveVisuals[index]) {
	    	ActiveVisuals[index].scale_init = initScale
			let scaledPerc =	ActiveVisuals[index].hasOwnProperty('scale_percentage') ? ActiveVisuals[index].scale_percentage : 100
			if(scaledPerc > 100) { scaledPerc = 100 }
			if(scaledPerc != 100) {
				let ScaleMultiplier = scaledPerc / 100
				initScale = [ initScale[0] * ScaleMultiplier, initScale[1] * ScaleMultiplier, initScale[2] * ScaleMultiplier]
			}
			ActiveVisuals[index].scale_percentage = scaledPerc
		}
    	// console.log('getBaseScale',  visualData.visType, initScale)
		return initScale;
    }

	// Edit Button settings
	const btnBasicColor  = curVisualData.displayColor// new THREE.Color( 0x4d4d4d);
	const matUXBtn       = new THREE.MeshBasicMaterial({color: 0x777777})
	matUXBtn.depthTest = false
	// matUXBtn.depthFunc = THREE.AlwaysDepth
	const ctrl_btns_ref = useRef()

	const iconBtnColor = textMaterialDark.clone()
	iconBtnColor.depthTest = false

	// const matUXBtnInfo   = new THREE.MeshBasicMaterial()
	// matUXBtn.color       = btnBasicColor;
	// matUXBtnInfo.color   = btnBasicColor

	function setBtnsEnabled() {
		if(
			SHARE_SETTINGS.sharing
			||
			RESPONSIVE_MODE
		) {
			return false
		}
		return true
	}
	
	const BTNS_ENABLED = setBtnsEnabled()

	let PhoneCTRLdata = {}	
	const DataVisBtnClick = function(btnMode) {
		if(BTNS_ENABLED) {
			UserLog({visualEditBtnClick:btnMode})
			controller(event, PhoneCTRLdata, updatePhoneSettings, btnMode)
		}
	}
	// Try Scaling continuesly
	let frame_i = 0
	let per_frame = 7
	useFrame(() => {
		frame_i++
		if(SCALE_PRESSED.down && SCALE_PRESSED.visIndex == index) {
			if(frame_i%per_frame == 0) DataVisBtnClick('scale_down')			
		}
		if(SCALE_PRESSED.up && SCALE_PRESSED.visIndex == index) {
			if(frame_i%per_frame == 0) DataVisBtnClick('scale_up')			
		}
	})

    // Caller
	function VisualControl({index, controller, visualData}) {
		// console.log('get VisualControl BTNS', visualData)
		const boxGeometry = new THREE.BoxGeometry(1.4,.1,1.4)
		
		// Add grid to visualData
		visualData.grid = grid

		PhoneCTRLdata = {
			index: index,
			visualID: visualData.visualID,
			visualData: visualData,
			grid: grid
		}
		if(visualData.dataType.indexOf('categories')!=-1) {
			PhoneCTRLdata.activeCats = visualData.activeCats
		}

		const UpdatePosition = ({ offset: [x, y], event, active }) => {
			if(!BTNS_ENABLED) { return }
			// console.log(props)
			const DragEventData = {
				x: x,
				y: y,
				event: event,
				active: active
			}
			controller(DragEventData, PhoneCTRLdata, updatePhoneSettings, 'drag')
			event.stopPropagation()
		}

		triggerInfoMode()

		// Get button icon geometries
		const editIconGeom  = UXIconEdit()
		const infoIconGeom  = UXIconInfo()
		const delIconGeom   = UXIconDelete()
		const iconMove      = UXIconMove()
		const iconScaleUp   = UXIconScaleUp()
		const iconScaleDown = UXIconScaleDown()

		const dragBinder = useGesture({
			onDrag: UpdatePosition,
		})


		let btn_move
		if(VISUAL_OPTIONS[visualData.visType].move) {
			btn_move = <mesh
					{...dragBinder()}
					position={[1.45,.5,-.8]}
					geometry={boxGeometry}
					material={matUXBtn}
					name="visualBtnDrag"
					>
						<mesh
							geometry={iconMove}
							position={[0,.1,-.02]}
							scale={[.8,.8,.8]}
							material={iconBtnColor}
						>				
						</mesh>
				</mesh>			
		}

		let btns_scale
		if(VISUAL_OPTIONS[visualData.visType].scale) {
			btns_scale = <>
				<mesh
					position={[1.45,.5,-2.25]}
					geometry={boxGeometry}
					material={matUXBtn}
					name="visualBtnScaleDown"
		        	onPointerDown={(event) => {
		        		SCALE_PRESSED.down = true
		        		SCALE_PRESSED.visIndex = index
			        	event.stopPropagation();
		        	}}
		        	onPointerUp={(event) => { reset_scale_pressed()	}}
		        	onPointerLeave={(event) => { reset_scale_pressed() }}
				>
						<mesh
							geometry={iconScaleDown}
							position={[0,.1,-.02]}
							scale={[.8,.8,.8]}
							material={iconBtnColor}
						>				
						</mesh>
				</mesh>
				{/* Scale UP */}
				<mesh
					position={[1.45,.5,-3.7]}
					geometry={boxGeometry}
					material={matUXBtn}
					name="visualBtnScaleUp"
		        	onPointerDown={(event) => {
		        		SCALE_PRESSED.up = true		        		
		        		SCALE_PRESSED.visIndex = index
			        	event.stopPropagation();
		        	}}
		        	onPointerUp={(event) => { reset_scale_pressed() }}
		        	onPointerLeave={(event) => { reset_scale_pressed() }}
					>
						<mesh
							geometry={iconScaleUp}
							position={[0,.1,-.02]}
							scale={[.8,.8,.8]}
							material={iconBtnColor}
						>				
						</mesh>
				</mesh>
			</>
		}
		// 
		const EditorBGGeom = new THREE.BoxGeometry(2.9, .001, 4.4);

		let btnsPosY = index * 4.5
		const btnsScale = .7
		return <group 
					ref={ctrl_btns_ref} 
					name="edit_btns" 
					renderOrder={Infinity}
					visible={false}
					position={getCTRLPos(visualData.visType, index)} 
					scale={[btnsScale,btnsScale,btnsScale]}
				>
				<mesh
					position={[.7,.5,-2.3]}
					geometry={EditorBGGeom}
					material={transparentMat}
				/>
				{/* Edit */}
				<mesh
					position={[0,.5,-.8]}
					geometry={boxGeometry}
					material={matUXBtn}
					name="visualBtnEdit"
		        	onClick={(event) => {
			        		DataVisBtnClick('edit')
				        	event.stopPropagation();
			        	}
		        	}
					>
						<mesh
							geometry={editIconGeom}
							scale={[.8,.8,.8]}
							renderOrder={999}
							material={iconBtnColor}
							position={[0,-.05,-.15]}
						>				
						</mesh>
				</mesh>
				{/* Info */}
				<mesh
					position={[0,.5,-2.25]}
					geometry={boxGeometry}
					material={matUXBtn}
					name="visualBtnInfo"
		        	onClick={(event) => {
			        		DataVisBtnClick('info')
				        	event.stopPropagation();
			        	}
		        	}
					>
						<mesh
							geometry={infoIconGeom}
							scale={[.8,.8,.8]}
							material={iconBtnColor}
							position={[0,-.05,-.02]}
						>				
						</mesh>
				</mesh>
				{/* Delete */}
				<mesh
					position={[0,.5,-3.7]}
					geometry={boxGeometry}
					material={matUXBtn}
					name="visualBtnDelete"
		        	onClick={(event) => {
			        		DataVisBtnClick('delete')
				        	event.stopPropagation();
			        	}
		        	}
					>
						<mesh
							geometry={delIconGeom}
							position={[0,.1,-.02]}
							scale={[.8,.8,.8]}
							material={iconBtnColor}
						>				
						</mesh>
				</mesh>
				{/* Drag*/}
				{btn_move}
				{/* Scale Down */}
				{btns_scale}
			</group>
	}

	let loadedMeshGeom;
	const { nodes } = useGLTF(modelPath);
	if(nodes.hasOwnProperty(curVisualData.shapeType)) {
		loadedMeshGeom = nodes[curVisualData.shapeType].geometry
		setShapeInitYs(curVisualData.shapeType, loadedMeshGeom)
	}

	let tagIcon = (curVisualData.dataType.indexOf('creator')!= -1) ? 'creator' : 'hashtag'
	if(curVisualData.dataType.indexOf('categories')!=-1) { tagIcon = 'categories' }

	let diamondGridGeom;
	let gridSize
	let gridScaleY

	if(curVisualData.hasOwnProperty('visType') && curVisualData.visType.indexOf('DiamondsGrid')!=-1) {
		// console.log('is categories grid now')
		diamondGridGeom = nodes.emerald_simple.geometry
		gridSize = (curVisualData.shapeType == 'DiamondsGridMini') ? 'mini' : 'full'
		gridScaleY = .375 // ('mini' == gridSize) ? .375 : .235
		if(!curVisualData.hasOwnProperty('activeCats')) {
			curVisualData.activeCats = '*'
		}
	}

	const CTRL_BTNS = <VisualControl index={index} controller={controller} visualData={curVisualData} />

	function getTextDisplay() {
		console.log('- - - - getTextDisplay CALLED - - - -')
		return <TextDisplay tagIcon={tagIcon} index={index} visualData={curVisualData} />
	}
	// Set the ref
	const setDataVisualRef = (element) => {
		ref2Set.current[index] = element
		setVisualObject3D(visualData.visualID, element)
		// ActiveVisuals[index].ref = element
		// console.log('setDataVisualRef!')
		/*
			useEffect(() => {
			// console.log('VisualObjects3D has changed!', visualData.visualID)
			setVisObj( getVisualObject3D(visualData.visualID)  )
		}, [VisualObjects3D] )
		*/
		// Fit2Bounds after update
		// fit2Bounds(element, {index, visualData})

	}
	if('reset4Cats' == curVisualData.dataType) { curVisualData.dataType = 'categories' }
	
	const PopSocketIncluded = ('BigSingleShape' == curVisualData.visType) ? false : true

	const zeroBoxSize = .01
	const zeroBoxH = 10
	const zeroBoxGeom = new THREE.BoxGeometry(zeroBoxSize,zeroBoxH,zeroBoxSize)
	const zeroBoxMat = new THREE.MeshBasicMaterial({color: 0xff0000})
	const zeroBox = <mesh geometry={zeroBoxGeom} material={zeroBoxMat} position={[0,(zeroBoxH / 2),0]} />

	const handleMouseOverVis = (mouseOver, event) => {
		ctrl_btns_ref.current.visible = (mouseOver) ? true : false
		event.stopPropagation()
		// console.log('handleMouseOverVis!', mouseOver, ctrl_btns_ref)
	}
	const renderer = useThree((state) => {
		return state.gl
		// console.log(state)
	})

	const DataVisClicked = (e) => {
		if(BTNS_ENABLED) {
			// console.log('DataVisClicked', e.eventObject)
			showDataVisControls(index, ref2Set, renderer)
			DataVisBtnClick('info')
		}
		e.stopPropagation()
	}

	// Make each Visual load its own data
	return (
		<>
			<ApiDataLoader context={'r3f'} mode={curVisualData.dataType} loadVal={curVisualData.dataTag} dataLoaded={dataLoaded} />
			<group 
				name="visualWrap" 
				rotation={[Math.PI * .5, Math.PI, 0]}
				// onPointerEnter={(event) => handleMouseOverVis(true, event)}
				// onPointerLeave={(event) => handleMouseOverVis(false, event)}
			>
				{grid && !loadingMode && 
					<>
					{'DayBoxes' == curVisualData.visType &&
						<group 
							name="vis_mover"
					        ref={ (element) => setDataVisualRef(element) }
					        userData={{visType:'DayBoxes'}}
					        position={getBasePosition()}
						>	
							<group 
								name="set2zero" 
								position={[5.25,-.05,0]}
								onClick={(event) => DataVisClicked(event)}
							>
								<group name="vis_scaler"> 
									<group 
										name="normalizer" 
										position={[0,0,0]}
										scale={getBaseScale()}
									>
										<DayBoxesGrid 
											name="actual_visual"
											grid={grid} 
											boxMat={DayBoxMaterial} 
											shapeType={curVisualData.shapeType} 
											playBackSpeed={playBackSpeed}
											meshGeom={loadedMeshGeom} 
											visualID={curVisualData.visualID}
										/>
									{getTextDisplay()}
									</group>
								</group>
							</group>
							{CTRL_BTNS}
						</group>
					}
					{'DayHeightMap' == curVisualData.visType &&
						<group 
							name="vis_mover"
					        ref={ (element) => setDataVisualRef(element) }
					        userData={{visType:'DayHeightMap'}}
					        position={getBasePosition()}
						>
							<group 
								name="set2zero" 
								position={[5.25,-.1,0]}
								onClick={(event) => DataVisClicked(event)}
							>
								<group name="vis_scaler"> 
									<group 
										name="normalizer" 
										position={[0, 0, 0]}
										scale={getBaseScale()}
									>
										<DayHeightMap 
											grid={grid} 
											displayColor={curVisualData.displayColor}
											playBackSpeed={(playBackSpeed * 4)}
											visualID={curVisualData.visualID}
										/>
									{getTextDisplay()}
									</group>
								</group>
							</group>
							{CTRL_BTNS}
						</group>
					}
					{'CreatorHeightmap' == curVisualData.visType &&
						<group 
							name="vis_mover"
					        ref={ (element) => setDataVisualRef(element) }
					        userData={{visType:'CreatorHeightmap'}}
					        position={getBasePosition()}
						>
							<group 
								name="set2zero" 
								position={[5.25, -.1, 0]}
								onClick={(event) => DataVisClicked(event)}
							>
								<group name="vis_scaler"> 
									<group 
										name="normalizer" 
										scale={getBaseScale()}
									>
									<CreatorHeightmap 
										grid={grid} 
										displayColor={curVisualData.displayColor}
										playBackSpeed={(playBackSpeed * 1)}
										visualID={curVisualData.visualID}
									/>
									{getTextDisplay()}
									</group>
								</group>
							</group>
							{CTRL_BTNS}
						</group>
					}
					{'DiamondsGrid' == curVisualData.visType &&
						<group 
							name="vis_mover"
					        ref={ (element) => setDataVisualRef(element) }
					        userData={{visType: curVisualData.shapeType }}
					        position={getBasePosition()}
						>
							<group 
								name="set2zero" 
								position={[5.25,0,0]}
								onClick={(event) => DataVisClicked(event)}
							>
								<group name="vis_scaler">
									<group 
										name="normalizer" 
										scale={getBaseScale()} 
									>
										<DiamondsGrid 
											grid={grid} 
											cats2Show={curVisualData.activeCats}
											meshGeom={diamondGridGeom}
											displayColor={curVisualData.displayColor}
											playBackSpeed={(playBackSpeed)}
											gridSize={gridSize}
											visualID={curVisualData.visualID}
										/>
									</group>
								</group>
							</group>
							{CTRL_BTNS}
						</group>
					}
					{'DiamondsRing' == curVisualData.visType &&
						<group 
							name="vis_mover"
					        ref={ (element) => setDataVisualRef(element) }
					        userData={{visType: 'DiamondsRing' }}
					        position={getBasePosition()}
						>
							<group 
								name="vis_scaler" 
								position={[0,-8.4, 0]} 
								scale={[1,.97,1]} 
								onClick={(event) => DataVisClicked(event)}
							>
								<DiamondsRing 
									grid={grid} 
									displayColor={curVisualData.displayColor}
									shapeType={curVisualData.shapeType} 
									visualID={curVisualData.visualID}
								/>
							</group>
							{CTRL_BTNS}
							{getTextDisplay()}
						</group>
					}
					{('PopSocket' == curVisualData.visType || 'BigSingleShape' == curVisualData.visType) && 
						<group 
							name="vis_mover"
					        ref={ (element) => setDataVisualRef(element) }
					        userData={{visType: 'PopSocket' }}
					        position={getBasePosition()}
						>
							<group 
								name="vis_scaler"
								onClick={(event) => DataVisClicked(event)}
							>
								<group 
									name="normalizer" 
									position={[0, 0, 0]} 
									scale={getBaseScale()} 
								>
									<BigSingleShape 
										grid={grid} 
										displayColor={curVisualData.displayColor} 
										shapeType={curVisualData.shapeType} 
										playBackSpeed={playBackSpeed}
										visualID={curVisualData.visualID}
										PopSocket={PopSocketIncluded}
									/>
								{getTextDisplay()}									
								</group>
								
							</group>
							{CTRL_BTNS}
						</group>
					}
					</>
				}
				{loadingMode &&
					<LoadingIcon />
				}
				
			</group>
		</>
	)
}