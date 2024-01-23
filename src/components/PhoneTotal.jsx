import { OrbitControls, useTexture, Text3D, CameraControls, Environment, PresentationControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import { Debug } from '@react-three/rapier'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree } from '@react-three/fiber'
// Log the Drag
import { createUseGesture, dragAction } from '@use-gesture/react'
const useGesture = createUseGesture([dragAction])
// Ajax stuff
import axios from 'axios';
import {apiServerURL} from './helpers/ServerSettings'


// console.log(THREE)
const { DEG2RAD } = THREE.MathUtils

// PROJECT MODULES
// Scene elements
import Lights from './scene-elements/Lights'
import Ground from './scene-elements/Ground'
import CamControlled from './scene-elements/CamControlled'
import CameraAnimator from './scene-elements/CameraAnimator'
// Components
import ApiDataLoader from './ApiDataLoader'
import PhoneFront from './PhoneFront'
import DataVisualInstance from './DataVisualInstance'
import Timeline from './Timeline'
import {ToggleEditButtons, PHONE_DIMS} from './Layouter' // {getGridBoxes, LayoutVisuals, ToggleEditButtons }
import {setDragAR, DragVisual, ScaleVisual} from './DragScale'
// Shapes
import { PhoneBackBase } from './shapes/Phone'
// Helpers
import {GetRandColor} from './helpers/ColorHelpers'
import {
	PhoneDayCounters, 
	getMyCounters, 
	ActiveVisuals, 
	EditorState, 
	EDTR_ACTIVE_DATA, 
	DAY_FRAMER,
	SHARE_SETTINGS,
	RESPONSIVE_MODE
} from './helpers/VisualsDataExchange'
// Constants
import { VisHasOptionSpeed, VISUAL_OPTIONS } from  './constants/DataVisSettings'
import { DesktopUXBtns, Check4SharedURL, Send4QRCode, ShareImageDisplay } from  './DesktopButtons'

// User Logger
import { GetUserLog, UserLog } from  './UserActivityLogger'
import { UAC_Cube } from './UserActShape'

/* Post processing 
// npm install @react-three/postprocessing
// npm uninstall @react-three/postprocessing
import { EffectComposer, SSAO } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

function Effects() {
	return (
		<EffectComposer>
			<SSAO
			blendFunction={BlendFunction.MULTIPLY}
			samples={30}
			radius={15}
			intensity={30}
			/>
		</EffectComposer>
	);
}
<Effects />
*/


THREE.ColorManagement.legacyMode = true

let RE_BUILD_MODE = false
let BUILD_INDEX = 0

let U3_objects

let VISUAL_ADDED = 0 

export default function PhoneTotal(props) {

	const [timelinePlaying, setTimelinePlaying] = useState( false )

	const [visualIndex, setVisualIndex] = useState( -1 )
	const [visualData, setVisualData] = useState({})
	const [controlI, setControlI] = useState(0)

	const [visuals2Add, setVisuals2Add] = useState({})

	const [frontDisplayMode, setFrontDisplayMode] = useState('start')

	const [layoutIndex, setLayoutIndex] = useState(0)


	console.log('PhoneTotal:frontDisplayMode', frontDisplayMode)

	const uiCanvas  = useRef()
	const phoneWrap = useRef()
	const camControl = useRef()

	const visualsPlaced = useRef([]);
	
	const changePhoneCallback = useRef(null);
	
	
	const setCanvasProps = (scene_objs) => {
		U3_objects = scene_objs
		setDragAR(U3_objects)
		scene_objs.gl.preserveDrawingBuffer = true
	}

	// Add body Class
	useEffect(() => {
		document.body.classList.add("phone-page");
		return () => { document.body.classList.remove("phone-page"); };
	}, []);	


	/*      _                  __              ______               __  
	 _   __(_)______  ______ _/ /  _________ _/ / / /_  ____ ______/ /__
	| | / / / ___/ / / / __ `/ /  / ___/ __ `/ / / __ \/ __ `/ ___/ //_/
	| |/ / (__  ) /_/ / /_/ / /  / /__/ /_/ / / / /_/ / /_/ / /__/ ,<   
	|___/_/____/\__,_/\__,_/_/   \___/\__,_/_/_/_.___/\__,_/\___/_/|_*/

	const VisualTotalCaller = (event, phoneData, clicker, mode) => {

		// console.log('VisualTotalCaller', phoneData.index, mode)
		const visIndex = parseInt(phoneData.index)

		changePhoneCallback.current = clicker;
		let switchFrontMode = true
		switch(mode) {
			case 'edit':
				setVisualIndex( visIndex )
				setVisualData( phoneData.visualData )
				// console.log('edit: visualIndex ', visualIndex, phoneData.index, controlI)
			  break
			case 'info':
				closeEditor()
				setVisualIndex( visIndex )
				setVisualData( phoneData.visualData )

				// Auto info called after the placing of a visual ? THEN t				
				if(Object.keys(event).length == 0) {
					console.log('»»»»»»» info called! ('+visIndex+') w empty', event, RE_BUILD_MODE)

					if(RESPONSIVE_MODE) { 
						mode = 'start'
						// switchFrontMode = false 
					}
					
					if(RE_BUILD_MODE) {
						CheckReady2Layout(visIndex)
					} else {
						TriggerLayout()
					}
					// only trigger layout after the last auto info caller
					// if(RE_BUILD_MODE && )
				}
				// 		controller({}, infoCallBackObj, updatePhoneSettings, 'info')
			  break
			case 'delete':
				switchFrontMode = false
				if(!RESPONSIVE_MODE) { 
					setVisualIndex( visIndex )
					if(confirm('Are you sure?')) {
						switchFrontMode = true
						mode = 'start'
						deleteVisual(visIndex)
					}
				}
			  break
			case 'layoutReady':
				switchFrontMode = false
				let newlI = layoutIndex + 1
				setLayoutIndex( newlI )			
				console.log('layoutReady: layoutIndex', layoutIndex, newlI)
			  break
			case 'drag':
				switchFrontMode = false
				// console.log(visualsPlaced, phoneData.index)
				DragVisual(visualsPlaced.current[ phoneData.index ], event, phoneData)
			  break
			case 'scale_up':
			case 'scale_down':
				switchFrontMode = false
				// console.log(visualsPlaced, phoneData.index)
				ScaleVisual(visualsPlaced.current[ phoneData.index ], mode, phoneData)
			  break
		}
		if(switchFrontMode) {
			setFrontDisplayMode(mode)
		}
	}
	// Delete a visual from the ting
	const deleteVisual = (visualIndex) => {
		if(ActiveVisuals.hasOwnProperty(visualIndex))  {
			delete  ActiveVisuals[visualIndex]
			delete  visuals2Add[visualIndex]
			
			UserLog({DeletedVisual:visualIndex})

			setControlI( controlI + 1 )
		}
	}

	/*  ____                 __                ______               __  
	   / __/________  ____  / /_   _________ _/ / / /_  ____ ______/ /__
	  / /_/ ___/ __ \/ __ \/ __/  / ___/ __ `/ / / __ \/ __ `/ ___/ //_/
	 / __/ /  / /_/ / / / / /_   / /__/ /_/ / / / /_/ / /_/ / /__/ ,<   
	/_/ /_/   \____/_/ /_/\__/   \___/\__,_/_/_/_.___/\__,_/\___/_/|*/
	// add, edit, info? visualindex, data

	const phoneFrontTotalCaller = (frontMode, visualIndex, visualData) => {
		console.log('phoneFrontTotalCaller!', frontMode, visualIndex, visualData)
		switch(frontMode) {
			case 'add':
				let visualKeys = Object.keys(ActiveVisuals)
				let newVisualKey = visualKeys.length
				if(newVisualKey > 0) {
					let curMaxKey = Math.max(...visualKeys)
					newVisualKey = curMaxKey + 1
				}
				// Start the counter
				if(VISUAL_ADDED == 0 ) {
					setTimelinePlaying(true)
					VISUAL_ADDED++
				}
				visuals2Add[newVisualKey] = visualData
				setVisuals2Add(visuals2Add)
				// Add to global ActiveVisuals
				ActiveVisuals[newVisualKey] = visualData
				// Set editorstate for so can call info screen after adding later on
				EditorState.editedIndex = -1
				EditorState.newIndex = newVisualKey
				// set to start modus for now
				setFrontDisplayMode('start')
				setVisualIndex(-1)
				// Add to user log
				UserLog({AddedVisual:visualData})
				// Force ReMemo - phonefront (hacky...)
				setControlI( controlI + 1 )
			  break;
			case 'edit':
				console.log('====edited visualIndex', visualIndex, visualData, EDTR_ACTIVE_DATA)
				// Set editorstate for so can call info screen after editing later on
				EditorState.editedIndex = visualIndex
				EditorState.newIndex = -1
				// Call the update function in the relevant visual
				changePhoneCallback.current({'edit': EDTR_ACTIVE_DATA})
				// Update global activevisuals object
				ActiveVisuals[visualIndex] = EDTR_ACTIVE_DATA
				UserLog({EditedVisual:EDTR_ACTIVE_DATA})
			  break;
			case 'set2add':
				setFrontDisplayMode('add')
			  break;
			case 'profile':
				let newDisplayMode = frontMode
				if('profile' == frontDisplayMode) {
					newDisplayMode = 'start'
				}
				setFrontDisplayMode(newDisplayMode)
				// CamPivot('darkside')
			  break;
			case 'start':
				setFrontDisplayMode(frontMode)
			  break;
		}
	}
	

	const closeEditor = () => {
		// setVisualIndex(-1)
	}

	/*                                    __                          __      
	   _____________  ____  ___     ___  / /__  ____ ___  ___  ____  / /______
	  / ___/ ___/ _ \/ __ \/ _ \   / _ \/ / _ \/ __ `__ \/ _ \/ __ \/ __/ ___/
	 (__  ) /__/  __/ / / /  __/  /  __/ /  __/ / / / / /  __/ / / / /_(__  ) 
	/____/\___/\___/_/ /_/\___/   \___/_/\___/_/ /_/ /_/\___/_/ /_/\__/___*/	
	// Memo the Lights

	const sceneLights = useMemo(() => {
		return <Lights />
	}, [BUILD_INDEX])

	// Memo the Ground
	const sceneGround = useMemo(() => {
		return <Ground />
	}, [])

	// Memo the Phone Background
	const PhoneBack = useMemo(() => {
		return <PhoneBackBase setRef={phoneWrap}  />
	}, [])

	// Memo the Environment
	const sceneEnvironment = useMemo(() => {
		return <Environment files="/imgs/wasteland_clouds_puresky_1k-V02.hdr" background />
	}, [])

	const CanvasDoubleClick = () => {
		// GetUserLog()
	}

	const camPivotFunction = useRef(null)
	// After initialization of CamAnimator, it does a callback to this, so the control function can be set
	const CamAnimationControl = (CamControlFunction, scene_objs) => {
		U3_objects = scene_objs;
		setDragAR(U3_objects)
		camPivotFunction.current = CamControlFunction
		// Screenshot mode ?
		if('screenshot' == frontDisplayMode) { 
			scene_objs.gl.preserveDrawingBuffer = true
			setTimeout(function(){
				PrepareScreenshot() 
			}, 100)
		}
	}
	
	useEffect(() => {
		const side = ('profile' == frontDisplayMode) ? 'darkside' : 'brightside'
		if(camPivotFunction.current) { camPivotFunction.current({moveTo: side}) }
	}, [frontDisplayMode])
	

	/* Place & memo the
	 _   __(_)______  ______ _/ /____
	| | / / / ___/ / / / __ `/ / ___/
	| |/ / (__  ) /_/ / /_/ / (__  ) 
	|___/_/____/\__,_/\__,_/_/___*/	

	let xIncr = 12;
	let yIncr = 0;//-1.5;

	const VisualsGroup = useMemo(() => {
		RE_BUILD_MODE = true
		console.log('update VisualsGroup!', visuals2Add)
		let AddedVisuals = [];
		for(let phone_i in visuals2Add) {
			let thisVisualData = visuals2Add[phone_i];
			// console.log(thisVisualData)
			let mode       = thisVisualData.dataType;
			let visual     = thisVisualData.visType;
			let tag        = thisVisualData.dataTag;

			let visualID = `visual--${visual}-${mode}-${tag}-${phone_i}`

			// Add ID to visualdata
			thisVisualData.visualID = visualID
			// Needs a global daycounter ?
			// if(VisHasOptionSpeed(thisVisualData.visType)) { PhoneDayCounters[visualID] = 0 }


			const visPosition = [0,0,0]

			AddedVisuals.push(
				<group 
					name={visualID}
					position={visPosition} 
					key={visualID}
				>
					<DataVisualInstance 
						controller={VisualTotalCaller}
						visualData={thisVisualData}
						index={phone_i}
						ref2Set={visualsPlaced}
					/>
				</group>
			)
		}

		return <>{AddedVisuals}</>
	}, [controlI])

	/*  __                        __ 
	   / /___ ___  ______  __  __/ /_
	  / / __ `/ / / / __ \/ / / / __/
	 / / /_/ / /_/ / /_/ / /_/ / /_  
	/_/\__,_/\__, /\____/\__,_/\__/  
	        /___*/	

	function CheckReady2Layout(visIndex) {
		// Ready4Layout()
		if(RE_BUILD_MODE) {
			const maxVisIndex = Math.max(...Object.keys(ActiveVisuals) )
			if(visIndex == maxVisIndex) {
				RE_BUILD_MODE = false
				TriggerLayout()
			}
		}
	}
	function TriggerLayout() {
		console.log('- - - - - - TriggerLayout!')
		BUILD_INDEX++
	}
	useEffect(() => {
		// console.log('_____hi_____ this is LAYOUT updatings ready', visualsPlaced)
		// LayoutVisuals(visualsPlaced)
	}, [BUILD_INDEX])


	/*      _             
	 _   __(_)__ _      __
	| | / / / _ \ | /| / /
	| |/ / /  __/ |/ |/ / 
	|___/_/\___/|__/|_*/

	// Camera default postition
	const canvasCamProps = {
		position:[-1.5, 12, 12.5],
		rotation:[0,0,0]  // [0,Math.PI,0] 4 other side 
	}
	const visualPositions = {
		phoneCover: [5, 11.5, -5],
		userVisual: [-7, 11, 36.5]
	}
	let SNAP_MODE = false

	const [presentationEnabled, setPresentationEnabled] = useState(true)

	// Presentation control settings 4 da foon
	const PCP_init_polar = [-Math.PI / 3, Math.PI / 2]
	const PCP_init_azimuth = [-Math.PI / 1.8, Math.PI / 2.6]
	const PRES_CONTROL_PHONE = {
		zoom: .8,
		rotation: [0, 0, 0],
		polar: PCP_init_polar,
		azimuth: PCP_init_azimuth,
		snap: false
	}
	// Presentation control settings 4 USER Activity Cube
	const PRES_CONTROL_UAC = {
		zoom: .8,
		rotation: [0, 0, 0],
		polar: [-Math.PI, Math.PI],
		azimuth: [-Math.PI, Math.PI]
	}
	const presentatlon_global = false // (RESPONSIVE_MODE) ? true : false

	if(
		RESPONSIVE_MODE
		||
		'screenshot' == frontDisplayMode
	) {
		centerVisual()
		if('screenshot' == frontDisplayMode) {
			PRES_CONTROL_PHONE.polar = [0, 0]
			PRES_CONTROL_PHONE.azimuth = [0, 0]
		}
	}
	function centerVisual() {
		canvasCamProps.position[0] = 0
		visualPositions.phoneCover[0] = 0
		visualPositions.phoneCover[1] = ('screenshot' == frontDisplayMode) ? 12 : 13
		visualPositions.userVisual[0] = -3.4		
	}


	// Grid box helper
	// const GridBoxes = getGridBoxes()
	
	const dragBinder = useGesture({
		onDragEnd: () => { UserLog({phoneCover:'dragged'}) }
	})	

	// Desktop controller
	const DesktopUXController = (props) => {
		if(props.action) {
			switch(props.action) {
				case 'share2mobile':
					console.log('share 2 mobile plzzzz')
					GetShareQR();
				  break;
				case 'takescreenshot':
					// console.log('take a screenshotski')
					setFrontDisplayMode('screenshot')
				  break;
			}
		}
	}
	/*       __                  
	   _____/ /_  ____ _________ 
	  / ___/ __ \/ __ `/ ___/ _ \
	 (__  ) / / / /_/ / /  /  __/
	/____/_/ /_/\__,_/_/   \__*/	
	const [shareImg, setShareImg] = useState('');

	const ShareQRCallback = (qr_code_img) => {
		if(qr_code_img.indexOf('.png')!= -1) {
			setShareImg(qr_code_img)
		}
	}
	function GetShareQR() {
		Send4QRCode(visuals2Add, ShareQRCallback)
	}
	function resetShareImg() {
		setShareImg('')
	}
	const [shareMode, setShareMode] = useState(false)

	useEffect(() => {
		if(shareMode) { 
			document.body.classList.add("share-mode") 
			SHARE_SETTINGS.sharing = true
		}
		return () => { document.body.classList.remove("share-mode") };
	}, [shareMode])

	const SetSharedVisuals = (data) => {
		setShareMode(true)
		setFrontDisplayMode('share')
		setVisuals2Add(data)
		setControlI( controlI + 1 )
		setTimeout(function(){
			setTimelinePlaying(true)
			// TriggerLayout()
		}, 1000)
	}
	useEffect(() => {
		Check4SharedURL(SetSharedVisuals)
	}, [])


	/*                                      __          __ 
	   __________________  ___  ____  _____/ /_  ____  / /_
	  / ___/ ___/ ___/ _ \/ _ \/ __ \/ ___/ __ \/ __ \/ __/
	 (__  ) /__/ /  /  __/  __/ / / (__  ) / / / /_/ / /_  
	/____/\___/_/   \___/\___/_/ /_/____/_/ /_/\____/\__*/

	const pg_z = .5
	const phoneGhostRef = useRef()
	const phoneGhostGeom = new THREE.BoxGeometry( PHONE_DIMS.w, PHONE_DIMS.h, pg_z )
	const ghostMat = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.5})
	const PhoneBackGhost = <mesh geometry={phoneGhostGeom} position={[0,0, -1 * (pg_z / 2) ]} material={ghostMat} ref={phoneGhostRef} />

	const screenshotAreaStyle = {}
	function getCropCoordinates() {

		const topLeft = new THREE.Vector3(
			0 - (PHONE_DIMS.w / 2),
			visualPositions.phoneCover[1] + (PHONE_DIMS.h / 2),
			(pg_z * 1.65) + visualPositions.phoneCover[2]
		)
		const botRight = new THREE.Vector3(
			(PHONE_DIMS.w / 2),
			visualPositions.phoneCover[1] - (PHONE_DIMS.h / 2),
			(pg_z * 1.65) + visualPositions.phoneCover[2]
		)

		const screen_top_left = ProjectVector(topLeft)
		const screen_bot_right = ProjectVector(botRight)

		return {
			canvas_w: screen_top_left.canvas_w,
			canvas_h: screen_top_left.canvas_h,
			crop_x: screen_top_left.x,
			crop_y: screen_top_left.y,
			crop_w: screen_bot_right.x - screen_top_left.x,
			crop_h: screen_bot_right.y - screen_top_left.y
		}
	}

	function ProjectVector( vector) {
		const canvas = U3_objects.gl.domElement; // `renderer` is a THREE.WebGLRenderer
		vector.project(U3_objects.camera); // `camera` is a THREE.PerspectiveCamera
		let canvas_w = canvas.width
		let canvas_h = canvas.height
		vector.x = Math.round((0.5 + vector.x / 2) * (canvas_w / window.devicePixelRatio));
		vector.y = Math.round((0.5 - vector.y / 2) * (canvas_h / window.devicePixelRatio));
		vector.canvas_w = canvas_w;
		vector.canvas_h = canvas_h;

		return vector;
	}
	function PrepareScreenshot() {
		ToggleEditButtons(visualsPlaced, 'off')
		// Wait a tick to hide the edit-buttons
		setTimeout(function(){
			const crop_coords = getCropCoordinates()
			let canvas = U3_objects.gl.domElement;
			canvas.getContext('webgl' , {preserveDrawingBuffer: true});

			const screenshot = canvas.toDataURL('image/png')
			// console.log(screenshot)
			const postData = {
				coords: crop_coords,
				imgdata: screenshot
			}
			// Send it off
			axios.post(
				apiServerURL + '?req=getscreenshot', 
				postData,
				{
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				}			
			)		
	        .then(response => {
	        	// console.log('posted screenshot data', response)
	        	const response_data = response.data
	        	if(response_data.indexOf('&url')!= -1) {
		        	window.location = response_data;
		        	// Reset to start + show edit buttons
					setTimeout(function(){
						setFrontDisplayMode('start')
						// ToggleEditButtons(visualsPlaced, 'on')
					}, 100)
		        }
	        });
       }, 100);
	}
	
	
	const zeroRef = useRef()
	const zeroRef2 = useRef()
	const zeroSize = 10
	const zeroGeom = new THREE.BoxGeometry(zeroSize,zeroSize,zeroSize)
	const zeroMat = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
	const zeroBox = <mesh geometry={zeroGeom} position={[0,0,0]} material={zeroMat} ref={zeroRef} />
	const zeroBox2 = <mesh geometry={zeroGeom} position={[0,0,0]} material={zeroMat} ref={zeroRef2} />
	
	

	// camera={canvasCamProps}
	return (<>
	    <Canvas shadows ref={uiCanvas} gl={{ preserveDrawingBuffer: true }} onDoubleClick={CanvasDoubleClick} onCreated={setCanvasProps} camera={canvasCamProps}>
	    	<CameraAnimator callback={CamAnimationControl} />
	    	{/*<OrbitControls />*/}
	    	{/*{zeroBox}{zeroBox2}*/}
    		{/*<CamControlled useRef={camControl} />*/}
	    	{/*<Perf position="bottom-right" />*/}
			<group name="phoneCoverPositioner" position={visualPositions.phoneCover} {...dragBinder()} >
				<PresentationControls 
					global={presentatlon_global}
					zoom={PRES_CONTROL_PHONE.zoom} 
					rotation={PRES_CONTROL_PHONE.rotation} 
					polar={PRES_CONTROL_PHONE.polar} 
					azimuth={PRES_CONTROL_PHONE.azimuth}
					snap={PRES_CONTROL_PHONE.snap}
					enabled={presentationEnabled}
				>
					{VisualsGroup}
					{PhoneBack}
					{/*{PhoneBackGhost}*/}
				</PresentationControls>
				{sceneLights}
			</group>
			{'profile' == frontDisplayMode &&
				<group name="phoneCoverPositioner" position={visualPositions.userVisual} {...dragBinder()} >
					<PresentationControls 
						global={presentatlon_global}
						zoom={PRES_CONTROL_UAC.zoom} 
						rotation={PRES_CONTROL_UAC.rotation} 
						polar={PRES_CONTROL_UAC.polar} 
						azimuth={PRES_CONTROL_UAC.azimuth} 					
					>
					<UAC_Cube />
					</PresentationControls>
				</group>
			}
	        {sceneGround}
	        {/*<Background />*/}
	        {sceneEnvironment}
	        
	        <color args={['#cccccc']} attach="background" />
	    </Canvas>
	    <PhoneFront 
	    	displayMode={frontDisplayMode}
	    	visualIndex={visualIndex} 
	    	visualData={visualData}
			callBack={phoneFrontTotalCaller}
			controlI={controlI}
	    />
	    {'profile' != frontDisplayMode &&
		    <>
			    <DesktopUXBtns callback={DesktopUXController} />
			    {timelinePlaying &&
				    <Timeline />
				}
			</>
		}
		{shareImg !='' &&
			<ShareImageDisplay img={shareImg} callback={resetShareImg} />
		}
	</>
	)
}