import { OrbitControls, useTexture, Text3D, CameraControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree } from '@react-three/fiber'

THREE.ColorManagement.legacyMode = true

// Project modules
import {GridHelper} from './helpers/GridHelpers'
import Lights from './scene-elements/Lights'

import ApiDataLoader from './ApiDataLoader'
import {TagOptionsTab} from './PhoneEditor' 

import Ground from './scene-elements/Ground'
import CamControlled from './scene-elements/CamControlled'
import {textMaterialDark} from './materials/ProjectMaterials'

const months = {
	Februari: {
		1: -1,
		2: -1,
		3: -1,
		4: -1,
		5: -1,
		6: -1,
		7: -1,
		8: -1,
		9: -1,
		10: -1,
		11: -1,
		12: -1,
		13: -1,
		14: 0,
		15: 1,
		16: 2,
		17: 3,
		18: 4,
		19: 5,
		20: 6,
		21: 7,
		22: 8,
		23: 9,
		24: 10,
		25: 11,
		26: 12,
		27: 13,
		28: 14,
	},
	Maart: {
		1: 15,
		2: 16,
		3: 17,
		4: 18,
		5: 19,
		6: 20,
		7: 21,
		8: 22,
		9: 23,
		10: 24,
		11: 25,
		12: 26,
		13: 27,
		14: 28,
		15: 29,
		16: 30,
		17: 31,
		18: 32,
		19: 33,
		20: 34,
		21: 35,
		22: 36,
		23: 37,
		24: 38,
		25: 39,
		26: 40,
		27: 41,
		28: 42,
		29: 43,
		30: 44,
		31: 45,
	},
	April: {
		1: 46,
		2: 47,
		3: 48,
		4: 49,
		5: 50,
		6: 51,
		7: 52,
		8: 53,
		9: 54,
		10: 55,
		11: 56,
		12: 57,
		13: 58,
		14: 59,
		15: 60,
		16: 61,
		17: 62,
		18: 63,
		19: 64,
		20: 65,
		21: 66,
		22: 67,
		23: 68,
		24: 69,
		25: 70,
		26: 71,
		27: 72,
		28: 73,
		29: 74,
		30: 75,
	},
	Mei: {
		1: 76,
		2: 77,
		3: 78,
		4: 79,
		5: 80,
		6: 81,
		7: 82,
		8: 83,
		9: 84,
		10: 85,
		11: 86,
		12: 87,
		13: 88,
		14: 89,
		15: 90,
		16: 91,
		17: 92,
		18: 93,
		19: 94,
		20: 95,
		21: 96,
		22: 97,
		23: 98,
		24: 99,
		25: -1,
		26: -1,
		27: -1,
		28: -1,
		29: -1,
		30: -1,
		31: -1,
	}
}

const daysPweek = 7
const DayW = .3
const DayMarge = .05

const dayBlock = new THREE.BoxGeometry(DayW,DayW,DayW / 4)
const matDayActive  = new THREE.MeshBasicMaterial({ 
	color: 0xff286d, 
});
const matExtenders  = new THREE.MeshBasicMaterial({ 
	color: 0x000000,
	// wireframe: true 
});
const matDayInActive  = new THREE.MeshBasicMaterial({ 
	color: 0xe0e0e0, 
});
const txtBlue = new THREE.MeshBasicMaterial({ 
	color: 0x002d73, 
});


function CalendarDayHeightSetter({grid, ref2Set}) {


	const gridParsed = GridHelper(grid, true)

	// console.log(grid)	

	const maxOffset = 1
	const divide = maxOffset  / gridParsed.max

	const extenders = []

	var worldTarget = new THREE.Vector3(); // create once an reuse it

	// console.log(gridParsed)
	for(let dayBoxI in ref2Set.current) {
		const dayBox = ref2Set.current[dayBoxI]
		const extendVal = gridParsed.gridArray[dayBoxI] * divide
		dayBox.position.z = extendVal

		// Zet er boxie achter
		const extendDayBlock = new THREE.BoxGeometry(DayW,DayW, (extendVal - DayW / 4) )
		// Positioneer t tov dayblock
		dayBox.getWorldPosition(worldTarget)
		const extendPos = [ worldTarget.x, worldTarget.y, worldTarget.z / 2 ]

		extenders.push(<group 
				key={`extender-${dayBoxI}`}
				position={extendPos}
			>
				<mesh geometry={extendDayBlock} material={matDayActive} />
				<mesh geometry={extendDayBlock} material={matExtenders} />
			</group>
		)
	}
	// console.log(extenders)
	return extenders
}

export default function CalendarView() {

	// Add body Class
	useEffect(() => {
		document.body.classList.add("calendar-page");
		return () => { document.body.classList.remove("calendar-page"); };
	}, []);	


	const refCalMonths = useRef()
	const days100 = useRef([])

	// Memo the Lights
	const sceneLights = useMemo(() => {
		return <Lights />
	}, [])

	// Memo the Ground
	const sceneGround = useMemo(() => {
		return <Ground />
	}, [])

	// Memo the Environment
	const sceneEnvironment = useMemo(() => {
		return <Environment files="/imgs/wasteland_clouds_puresky_1k.hdr" background />
	}, [])

	// Memo the phones
	const CalendarGroup = useMemo(() => {

		const CalMonths = []
		const MonthWidth = 2.6

		let month_i = 0
		for(let monthName in months) {
			const monthDays = months[monthName]
			const monthDaysGrps = []


			const MonthTxtPos = [-.15,.3,0]
			const MonthTxtRot = [0,0,0] // [Math.PI * .5, Math.PI, 0]
			// Plaats maand text
			const monthNameTxt = <Text3D 
			        material={textMaterialDark}
		        	font="./../fonts/TASA_Orbiter_Display_Black.json"
		        	size= {.25}
		        	height={.02}  
		        	position={MonthTxtPos}    	
		        	rotation={MonthTxtRot}
	        	>{monthName}
		        </Text3D>

			// go thru days
	        let dayCount = 0
	        for(let dayI in monthDays) {
	        	const day100i = monthDays[dayI]
	        	
	        	const dayMat = (day100i == -1) ? matDayInActive : matDayActive
	        	// const dayRef = (day100i == -1) ? null : (ele)
	        	const xCounter = dayCount%daysPweek
	        	const posX = (xCounter * DayW) + (xCounter * DayMarge)
	        	const posY = 0 - Math.floor( dayCount / daysPweek ) * (DayW + DayMarge)

	        	const dayPos = [posX,posY, 0]

	        	const DayTxtPos = [-0.12, .05, 0.04]

	        	const dayTxt = <Text3D 
					        material={txtBlue}
				        	font="./../fonts/TASA_Orbiter_Display_Regular.json"
				        	size= {.07}
				        	height={.01}  
				        	position={DayTxtPos}    	
			        	>{dayI}
				        </Text3D>

				const dayKey = `dayBox-${monthName}-${dayI}`

				let ttDayTxt = null
				if(day100i != -1) {
					const DayTxtPosTT = [0, -.1, 0.04]
					let ttDayi = day100i + 1
					ttDayTxt = <Text3D 
					        material={textMaterialDark}
				        	font="./../fonts/TASA_Orbiter_Display_Black.json"
				        	size= {.07}
				        	height={.001}  
				        	position={DayTxtPosTT}    	
			        	>{ttDayi}
				        </Text3D>
				}

				const dayBox = <mesh
					castShadow
					receiveShadow
					geometry={dayBlock}
					material={dayMat}
				>{dayTxt}{ttDayTxt}</mesh>

				let DayBoxGrp
				if(day100i == -1) {
					DayBoxGrp = <group key={dayKey} position={dayPos}
							>{dayBox}</group>
				} else {
					DayBoxGrp = <group 
							name={`day-box-${day100i}`}
							key={dayKey} 
							ref={ (element) => days100.current[day100i] = element }
							position={dayPos}
						>{dayBox}</group>
				}

				monthDaysGrps.push(DayBoxGrp)


	        	dayCount++
	        }

	        // Month position
	        const row_i = month_i%2
			const posX = (row_i) * MonthWidth
			const posY = (month_i < 2) ? 0 : -2.4
			const grpPos = [posX, posY, 0]		        

		    const CalMonth = <group key={`month-group-${monthName}`} position={grpPos}>
		    	{monthNameTxt}
		    	{monthDaysGrps}
		    </group>
		    CalMonths.push(CalMonth)

		    month_i++
		}


		return <group ref={refCalMonths} position={[0,2.4,0]}>
					{CalMonths}
				</group>
	}, [])

	const customCamSettings = { minDistance: 4 }

	const [grid, setGrid] = useState(false)

	const dataLoaded = (props) => {
		setGrid(props)
	}

	const resetGrid = (event) => {
		setGrid(null)
		// Move them all back
		for(let db of days100.current) {
			db.position.z = 0
		}
	}

	const resetButton = (grid) ? <button onClick={resetGrid} id="resetGridBtn">Reset</button> : null

	const [activeTag, setActiveTag] = useState()

	const HashTagSelected = (props) => {
		setActiveTag(props.dataTag)
	}

	let tagTextDisplay
	if(activeTag) {
		const TagTxtPos = [4.4,-1.6,0]
		const TagTxtRot = [0,0,0]
		tagTextDisplay = <Text3D 
			        material={textMaterialDark}
		        	font="./../fonts/TASA_Orbiter_Display_Black.json"
		        	size= {.25}
		        	height={.02}  
		        	position={TagTxtPos} 
	        	>#{activeTag}
		        </Text3D>
	}


	return (<>
		<div className="calendar-ui">
			{resetButton}
			<ApiDataLoader context={'r3f'} mode={'hashtag'} loadVal={activeTag} dataLoaded={dataLoaded} />
			<TagOptionsTab dataType="hashtag" callBack={HashTagSelected}  />
		</div>
	    <Canvas>
    		<CamControlled focusObject={refCalMonths} customSettings={customCamSettings} />
			{sceneLights}
			{CalendarGroup}
			{grid &&
				<>
					<CalendarDayHeightSetter grid={grid.num_per_day} ref2Set={days100} />
					{tagTextDisplay}
				</>
			}
	        {/*{sceneGround}*/}
	        {sceneEnvironment}	        
	        <color args={[0xefefef]} attach="background" />
	    </Canvas>
	</>
	)

}