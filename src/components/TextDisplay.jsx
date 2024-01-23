import { useState, useRef, useEffect  } from 'react'
import { Text3D } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

import { PhoneDayCounters, DAY_FRAMER, ActiveVisuals, VisualObjects3D, getVisualObject3D } from  './helpers/VisualsDataExchange'
import {GridHelper} from './helpers/GridHelpers'
import FormatNumber from './helpers/FormatNumber'
import {textMaterial, tagTextMaterial, textMaterialDark, transparentMat} from './materials/ProjectMaterials'
import {PHONE_DIMS} from './Layouter'
import {getVisualBoundingBox} from './DragScale'

export default function TextDisplay({tagIcon, visualData, index}) {
	// console.log('TextDisplay', index)
	// console.log(ActiveVisuals)

	const [VisObj, setVisObj] = useState( null )

	useEffect(() => {
		// console.log('VisualObjects3D has changed!', visualData.visualID)
		setVisObj( getVisualObject3D(visualData.visualID)  )
	}, [VisualObjects3D] )

	// Text Settings
	if(VisObj) {
		// Toon tag
		let curDisplayTag = (visualData.hasOwnProperty('textDisplayTag')) ? visualData.textDisplayTag : true
		// Text position
		let curDisplayPos = getTextDisplayPos(visualData)
		// Toon Stats
		let curDisplayStats = (visualData.hasOwnProperty('textDisplayStats')) ? visualData.textDisplayStats : true
		// Stats type (day || minmax)
		let curStatsType = getTextStatsMode(visualData)

		if(!curDisplayTag) { return }

		let rotate_z = 0
		// Determine text size
		let tagText   = visualData.dataTag
		let txtlen    = tagText.length;
		let txtHeight = .2
		let txtSize   = (txtlen > 12) ? .9 : 1

		txtSize = .5
		// console.log('tagIcon', tagIcon)

		// Determine icon
		let txtPrefix = (tagIcon == 'hashtag') ? '#' : ''
		let iconPrefix 
		if(tagIcon == 'creator') {
			txtPrefix = '@';
		}
		// Categories?
		if(tagIcon == 'categories') { tagText = 'categories' }

		// Change font-size for PopSocket
		switch(visualData.visType) {
			case 'PopSocket':
				// txtSize = txtSize / 1.5
				// txtHeight = txtHeight / 2
			  break;
		}


		let grid
		if(visualData.grid) {
			grid = (visualData.grid.hasOwnProperty('num_per_day')) ? visualData.grid.num_per_day : visualData.grid.followers
		} 
		let visualID = visualData.visualID

		if(!grid) { curDisplayStats = false }

		const txt_placement = getTextPlacement(visualData, VisObj, index)

		// console.log('TextDisplay: grid', grid, visualData.grid)
		// tagText = tagText.toUpperCase()
		const DayTxt =  <>
					{iconPrefix}
					<Text3D 
				        material={textMaterial} //tagTextMaterial
			        	font="./../fonts/TASA_Orbiter_Display_Black.json"
			        	size= {txtSize}
			        	height={txtHeight}  
			        	position={txt_placement.position}    	
			        	rotation={txt_placement.rotation}
		        	>{`${txtPrefix}${tagText}`}
			        </Text3D>
			        {curDisplayStats &&
				        <DayStats tagIcon={tagIcon} statsMode={curStatsType} placement={txt_placement} visualData={visualData} grid={grid} />
				    }
		        </>
	    return DayTxt;
	}
}
function getTextDisplayPos(visualData) {
	return visualData.hasOwnProperty('textDisplayPos') ? visualData.textDisplayPos : 'top'
}
function getTextStatsMode(visualData) {
	if(visualData.hasOwnProperty('textDisplayStats') && visualData.textDisplayStats == false) {
		return 'none'
	}
	return visualData.hasOwnProperty('textStatsType') ? visualData.textStatsType : 'minmax'
}

const VISUAL_DIMENSIONS = {
	DayBoxes: [10,10],
	DayHeightMap: [10,10],
	CreatorHeightmap: [10,10],
	DiamondsGrid: [10,16],
	DiamondsGridMini: [10,4],
	DiamondsRing: [12,24],
	PopSocket: [5,5],	
}

function getTextPlacement(visualData, VisObj, index) {
	
	const vis_h_is_z = ['DiamondsRing']

	const visType = visualData.visType

	const txtPlacement = getTextDisplayPos(visualData)
	const curStatsType = getTextStatsMode(visualData)

	const vis_bb = (VisObj) ? getVisualBoundingBox(visType, index, true, true) : null
	const vis_h =  vis_bb.y //  (vis_h_is_z.indexOf(visType) != -1 ) ? vis_bb.z : vis_bb.y
	console.log(visType, 'getTextPlacement:height', vis_h)

	// Default top position
	let dayTxtPos = [0, 0, .4]
	
	// Bottom
	if('bot' == txtPlacement) {
		dayTxtPos[2] = -1 * (vis_h + .65 )
	}

	// Determine position, depending on type of visual
	switch(visType) {
		case 'PopSocket':
		case 'BigSingleShape':
			dayTxtPos[0] = 3
			dayTxtPos[1] = ('PopSocket' == visType) ?  2.7 : 0
			dayTxtPos[2] = ('bot' == txtPlacement) ? -3.1 : 3.7
			//, .4]
		  break;
		case 'CreatorHeightmap':
			dayTxtPos[1] = .1;
			if('bot' == txtPlacement) { dayTxtPos[2] = -11.2 }
		  break;
	}


	let txtRotation = [Math.PI * .5, Math.PI, 0]

	if('right' == txtPlacement || 'left' == txtPlacement) {
		txtRotation[0] =  Math.PI * .5
		txtRotation[2] = - Math.PI * 1.5
		txtRotation[1] =   -Math.PI
		// Position
		dayTxtPos[0] = (curStatsType == 'minmax' && 'left' == txtPlacement) ? 1.3 : 0.7
		if('right' == txtPlacement) {
			dayTxtPos[0] -= vis_bb.x + 1.5
		}
		dayTxtPos[2] = -6
	}
	if(PopSocketLikeVis(visType)) {
		if('left' == txtPlacement) {
			dayTxtPos[0] = vis_bb.x / 2 + 1.4
		} else if('right' == txtPlacement) {
			dayTxtPos[0] = -vis_bb.x / 2 - .5
		}
		if(!txtPlacedVertical(txtPlacement)) {
			dayTxtPos[2] = -1.5
		} else {
			dayTxtPos[0] -= 1
		}
	}
	if('DiamondsRing' == visType) {
		dayTxtPos = [5.7, -.4, 11.8]
		dayTxtPos[2] = ('bot' == txtPlacement) ? -12 : 11.8
		if(!txtPlacedVertical(txtPlacement)) {
			dayTxtPos[2] = -3
			dayTxtPos[0] = ('left' == txtPlacement) ? 7 : -6.4
		}
	}
	if('none' == curStatsType) {
		dayTxtPos[0] -= .4
	}

	return {
		position: dayTxtPos,
		rotation: txtRotation
	}
}
function txtPlacedVertical(mode) {
	return ('top' == mode || 'bot' == mode)
}
export function PopSocketLikeVis(visType) {
	return ('PopSocket' ==  visType || 'BigSingleShape' == visType )
}
function DayStats({placement, visualData, grid, tagIcon, statsMode}) {

	let gridData = GridHelper(grid, true)
	let gridAr   = gridData.gridArray

	const [dayFrame, setDayFrame] = useState(0)

	const visType = visualData.visType
	const txtPlacement = getTextDisplayPos(visualData)

	let day_amount = (gridAr.hasOwnProperty(dayFrame)) ? gridAr[dayFrame] : 0;
	day_amount = FormatNumber(day_amount, 1)
	let dayI = dayFrame + 1;

	let suffix = (tagIcon == 'hashtag') ? 'vids' : '' //followers

	let displayText = `Dag ${dayI} - ${day_amount} ${suffix}`;
	// console.log(displayText, dayFrame)
	let txtSize = .3
	let txtHeight = .1
	let dayTxtPos = [...placement.position]
	switch(txtPlacement) {
		case 'left':
		case 'right':
			dayTxtPos[0] -= 0.5
		  break;
		default:
			dayTxtPos[0] -= 7
		  break;
	}

	const visualID =  visualData.visualID

	// const statsMode = (visualData.hasOwnProperty('statsType')) ? visualData.statsType : 'minmax'

	if('minmax' == statsMode) {
		console.log(gridData)
		let statMin  = gridData.min
		let statMinDay = gridAr.indexOf(statMin) + 1
		let statMax  = gridData.max
		let statMaxDay = gridAr.indexOf(statMax) + 1
		displayText = `Min: Dag ${statMinDay} - ${FormatNumber(statMin, 1)} `+"\n"+`Max: Dag ${statMaxDay} - ${FormatNumber(statMax, 1)}`;
		dayTxtPos[2] += (PopSocketLikeVis(visType)) ? 0 : .3
	}
// case 'BigSingleShape':
 // ('PopSocket' == visType) ?
	if(PopSocketLikeVis(visType) && txtPlacedVertical(txtPlacement)) {
		dayTxtPos[0] += 7
		if('bot' == txtPlacement) {
			dayTxtPos[2] -= ('minmax' == statsMode) ? .2 : .55
		} else {
			dayTxtPos[2] -= .6
		}
		// dayTxtPos[1] -= 2.5
	}

	if('DiamondsRing' == visType) {
	}
	
	if('bot' == txtPlacement) {
		dayTxtPos[2] -= ('day' == statsMode) ? 0 : .3
	}

	let prev_day = -1

	useFrame((state) => {
		if('day' == statsMode) {
			let cur_day = DAY_FRAMER.day //PhoneDayCounters[visualID]
			if(cur_day != prev_day) {
				setDayFrame( DAY_FRAMER.day )
				prev_day = cur_day
			}
		}
	})



	const DayTxt =  <>
				<Text3D 
			        material={textMaterial} //tagTextMaterial
		        	font="./../fonts/TASA_Orbiter_Text_Regular.json"
		        	size= {txtSize}
		        	height={txtHeight}  
		        	position={dayTxtPos}    	
		        	rotation={placement.rotation}
	        	>{displayText}
		        </Text3D>
	        </>
    return DayTxt;
}

function getTextSize(text2Display) {
	let txtlen    = text2Display.length;
	
	const txtSizeSetter = {
		12: .9,
		14: .75,
		16: .72,
		18: .65,
		20: .62,
		22: .6,
		24: .5,
		26: .45,
		50: .3
	}
	for(let sizeKey in txtSizeSetter) {
		if(txtlen <= sizeKey) {
			txtSize = txtSizeSetter[sizeKey]
			break;
		}
	}
	return txtSize;
}