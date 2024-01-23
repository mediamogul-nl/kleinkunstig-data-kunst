import { useState, useMemo, useRef, useEffect  } from 'react'

import { Color } from 'three'

import {GetRandColor} from './helpers/ColorHelpers'
import SearchBox from './helpers/SearchBox'

import defaultTagOptions from './constants/defaultTagOptions'
import {TikTokCatsOrder} from './DiamondsGrid'

import { PhoneDayCounters, ActiveVisuals, EDTR_ACTIVE_DATA, SetEdtrActiveData } from  './helpers/VisualsDataExchange'
import { 
	DATA_OPTIONS, 
	VISUAL_OPTIONS, 
	VISUAL_OPTION_SHAPES, 
	VisHasOptionShape, 
	VisHasOptionShapeAndCurShape,
	VisHasOptionSpeed, 
	VisHasVisualOptions, 
	VisHasGridOptions 
} from  './constants/DataVisSettings'
import { shapeCounter } from './Layouter'
// User Logger
import { UserLog } from  './UserActivityLogger'


// import hashtagOptions from "./data/hashtags.json";
// import creatorOptions from "data/creator.json";

const colorRGBVals = []

function ColorOptions({editorCallBack, visualData, numOptions, colorOptions}) {

	const [curVisualData, setCurVisualData] = useState(visualData)
	const [curActiveColor, setCurActiveColor] = useState(visualData.displayColor)

	useEffect(() => {
		setCurVisualData(visualData)
		setCurActiveColor(visualData.displayColor)
	}, [visualData])


	if(!numOptions) { numOptions = 8; }

	if(!colorOptions) {
		colorOptions = []
		for(let i=0;i<numOptions;i++) {
			colorOptions.push( GetRandColor() )
		}
	}

	const [curColorOptions, setCurColorOptions] = useState(colorOptions)

	const SwatchClick = (cSwatch) => {
		// activeColor = cSwatch;
		setCurActiveColor(cSwatch)
		curVisualData.displayColor = cSwatch

		// Log it
		UserLog({ColorSwatchClick:cSwatch})

		editorCallBack(curVisualData, {type:'display:ColorOptions'})
	}


	// Get the options for the swatches
	const getSwatchOptions = (reset) => {
		let num2Get = numOptions;
		let colorSwatches = []


		let all_new = (reset) ? true : false;
		if(!all_new) {
			// Copy current
			colorSwatches = [...curColorOptions];
			let numAvail = colorSwatches.length;
			num2Get = numOptions - numAvail;
		}
		if(num2Get > 0) {
			for(let i=0;i<num2Get;i++) {
				let randColor = GetRandColor()
				colorSwatches.push( randColor )
				// generatedColorOptions
			}
		}
		// Reset color vals & populate, so can check if active color in there
		colorRGBVals.length = 0
		for(let clr of colorSwatches) {
			let clrTotal =  clr.r + ',' + clr.g + ',' + clr.b
			colorRGBVals.push( clrTotal  )
		}

		return colorSwatches;
	}
	// Get the swatch buttons
	let swatchBtns = []

	const ColorSwatches = () => {
		swatchBtns = []
		// console.log(colorRGBVals, curActiveColor)
		// If there's an active color
		if(curActiveColor) {
			// Check if its in the current options
			let compVal = curActiveColor.r + ',' + curActiveColor.g + ',' + curActiveColor.b
			if(colorRGBVals.indexOf(compVal) == -1) {
				// If not set as the first option
				curColorOptions[0] = curActiveColor
			}
		}


		// let swatches2Display = getSwatchOptions(reset)
		let option_i = 0;
		for(let cSwatch of curColorOptions) {
			// BG color
			const bgColorStyle = { backgroundColor: '#' + cSwatch.getHexString() }
			// Class
			let btnClassName = 'change-color';
			if(curActiveColor == cSwatch ) { btnClassName+= ' active';	}
			// Set element
			const optionLi = <li key={`color-op-${option_i}`}>
				<a 
					onClick={ (e) => { SwatchClick(cSwatch) } } 
					className={btnClassName}
				>
					<i style={bgColorStyle}></i>
				</a>
			</li>
			// Add to options
			swatchBtns.push(optionLi)

			option_i++
		}
		return swatchBtns;
	}
	useEffect(() => {
		initColorSet()
	}, [visualData.displayColor])

	function initColorSet() {
		let newColors = getSwatchOptions( false )
		setCurColorOptions( newColors )
	}

	const newColorSet = (e) => {
		UserLog({ColorOptions:'generated_new_options'})

		let newColors = getSwatchOptions( true )
		setCurColorOptions(newColors)
	}

	return 	<>
		<a id="get-new-color-ops" onClick={newColorSet}>genereer nieuwe opties</a>
		<ul>
			<ColorSwatches />
		</ul>
	</>
}

const searchOpsLoaded = {
	creator: false,
	hashtag: false
}

export function TagOptionsTab({dataType, visualData, callBack}) {

	let dataTypes = dataType + 's';

	let extendTagOptionBtns = false

	const [tagOptions, setTagOptions] = useState( defaultTagOptions[dataTypes] )
	const [activeTag, setActiveTag] = useState( (visualData && visualData.hasOwnProperty('dataTag')) ? visualData.dataTag : '')

	const [dataOptions, setDataOptions] = useState([])

	const loadSearchOptions = async (fileName) => {
		const response = await fetch(`data/${fileName}.json`)
		const result = await response.json()
		dataOptionsLoaded(result)
		
	}
	const dataOptionsLoaded = (data) => {
		searchOpsLoaded[dataType] = data
		setDataOptions(data)
	}
	// Inital load, get the options from json file
	useEffect(()=>{
		if(searchOpsLoaded[dataType] == false) {
			searchOpsLoaded[dataType] = 'loading'
			console.log('loadSearchOptions', dataType)
			// searchOpsLoaded[dataType] = true
			loadSearchOptions(dataTypes)
		} else {
			setDataOptions( searchOpsLoaded[dataType] )
		}
	},[])

	useEffect(() => {
		if(visualData && visualData.hasOwnProperty('dataTag')) {
			setActiveTag(visualData.dataTag)
		}
	}, [visualData])


	const getRandOption = (event) => {
		UserLog({TagOptionsTab:'getRandOption'})

		let randTag = dataOptions[Math.floor(Math.random()*dataOptions.length)];
		// console.log('randTag', randTag)
		addToTagOps({name:randTag})
	}

	const addToTagOps = (item) => {
		const initOps =  [...tagOptions]
		if(initOps.indexOf(item.name) == -1) {
			initOps.push(item.name)
			setTagOptions(initOps)
			setSelectedTag(item.name)
		}
	}
	const setSelectedTag = (item) =>  {
		setActiveTag(item)
		// Log it
		UserLog({TagOptionsTab:'setSelectedTag:'+item})		
		callBack({dataType: dataType, dataTag: item })
	}


	// Create button array
	const tagBtns = [];

	// Add random button
	let btn_txt = 'random ' + dataType;
	tagBtns.push( <a key={`tag-random`} className={`rand-btn set-${dataType}`} onClick={getRandOption}>{btn_txt}</a> )

	// Add prev added random tag to options
	if(
		visualData
		&&
		visualData.dataTag
		&&
		visualData.dataType == dataType
		&&
		visualData.dataTag!='*' 
		&& 
		tagOptions.indexOf(visualData.dataTag) == -1
	) { 
		tagOptions.push(visualData.dataTag)
	}

	// Add cur options
	for(let tag of tagOptions) {

		let className = `set-${dataType}`
		if(tag == activeTag) {  className+= ' active' }
		tagBtns.push( <a 
				key={`tag-${tag}`} 
				className={className} 
				data-tag={tag} 
				onClick={ () => setSelectedTag(tag)}
			>{tag}</a> 
		)
	}

	return (
		<>
		{dataOptions.length &&
			<div className="tag-ops-wrap">
				<SearchBox optionsArray={dataOptions} callBack={addToTagOps} />
				<div className="ops-wrap">
					{tagBtns}
				</div>
			</div>			
		}
		</>
	)
}

function CategoriesSelector({dataType, visualData, callBack}) {

	// console.log('CategoriesSelector!', visualData)

	// 


	const [activeCats, setActiveCats] = useState([])

	useEffect(() => {
		let curActive = TikTokCatsOrder;
		if(visualData.hasOwnProperty('activeCats')) {
			if(visualData.activeCats != '*') {
				curActive = visualData.activeCats.split(',')
			}
		}
		setActiveCats(curActive)
	}, [visualData])

	const updateActiveCats = (event) => {

		const updateCurActive = [...activeCats]
		const cbChecked = event.target.checked
		const cbVal = event.target.value
		// console.log('cb ', cbChecked)
		if(!cbChecked) {
			const valI = updateCurActive.indexOf(cbVal)
			const xd = updateCurActive.splice(valI, 1);
			// delete updateCurActive[valI]
		} else {
			updateCurActive.push(cbVal)
		}
		setActiveCats(updateCurActive)
		const callBackTagVal = (updateCurActive.length == TikTokCatsOrder.length) ? '*' : updateCurActive.join(',')
		// Log it
		UserLog({updateActiveCats:callBackTagVal})

		callBack({dataType: dataType, dataTag: '*', activeCats: callBackTagVal })
	}

	const catsCheckBoxList = []
	TikTokCatsOrder.map(function(catName, index){
		const isChecked = (activeCats.indexOf(catName) != -1) ? true : false
		catsCheckBoxList.push(<li key={`cat-op-${catName}`}>
			<label>
				<input onChange={updateActiveCats} type="checkbox" name="active-categories" value={catName} checked={isChecked} />
				{catName}
			</label>
		</li>)
	})



	return <section className="categories-select-wrap">
			<ul>{catsCheckBoxList}</ul>
	</section>	
}

function EditorDataTabs({editorCallBack, visualData}) {

	const [activeTab, setActiveTab] = useState( visualData.dataType )
	const [curVisualData, setCurVisualData] = useState(visualData)


	useEffect(() => {
		setActiveTab(visualData.dataType)
		setCurVisualData(visualData)
	}, [visualData])


	const SwapTab = (event) => {
		let newActive = event.target.dataset.mode;
		// Log it
		UserLog({SwappedTab:newActive})

		let updateSettings = false;
		if('categories' == newActive && 'categories' != curVisualData.dataType) {
			curVisualData.dataTag = '*'
			updateSettings = true;
			curVisualData.visType = 'DiamondsGrid'
			curVisualData.shapeType = 'DiamondsGridMini'
			// delete curVisualData.visType
			delete curVisualData.displayColor		
		// Not the initial data type? Clear the tag			
		} else if(curVisualData.hasOwnProperty('dataType') && newActive != curVisualData.dataType ) {			
			delete curVisualData.dataTag
			delete curVisualData.visType
			delete curVisualData.displayColor

			updateSettings = true;
		}
		if(updateSettings) { 
			curVisualData.dataType = newActive
			updateDataSettings(curVisualData) 
		}
		setActiveTab(newActive)
	}

	const updateDataSettings = (dataSettings) => {
		const newVisData = { ...curVisualData, ...dataSettings }
		// setCurVisualData( newVisData )
		// console.log('updateDataSettings', newVisData)
		editorCallBack(newVisData, {type:'data:EditorDataTabs'})
		// JSON.parse(JSON.stringify(curVisualData));
	}

	const TabHeader = () => {
		
		let headerBtns = []

		for(let tabKey in DATA_OPTIONS) {
			let tabData = DATA_OPTIONS[tabKey];
			let activeClass = ( tabData.variations.indexOf(activeTab) != -1  ) ? 'active' : '';
			const tabBTN = <li key={`tab-${tabKey}`}><a onClick={SwapTab} className={activeClass} rel={`tab-${tabKey}`} data-mode={tabKey}>{tabData.name}</a></li>
			headerBtns.push(tabBTN)
		}

		return 	<header>
			<ul>{headerBtns}</ul>
		</header>
	}

	const tabsClass = 'tab';


	return <div className="tab-group">
		<TabHeader />
		{/* Hashtags */}
		<div className={tabsClass + (DATA_OPTIONS['hashtag'].variations.indexOf(activeTab) != -1 ? ' active' : '')} id="tab-hashtag">
			<TagOptionsTab dataType="hashtag" visualData={curVisualData} callBack={updateDataSettings}  />
		</div>
		{/* Creator */}
		<div className={tabsClass + (DATA_OPTIONS['creator'].variations.indexOf(activeTab) != -1 ? ' active' : '')} id="tab-creator">
			<TagOptionsTab dataType="creator" visualData={curVisualData} callBack={updateDataSettings}  />
		</div>
		{/* Categorie */}
		<div className={tabsClass + (DATA_OPTIONS['categories'].variations.indexOf(activeTab) != -1 ? ' active' : '')} id="tab-categorie">
			<div className="categories-ops-wrap ops-wrap">
				<CategoriesSelector dataType="categories" visualData={curVisualData} callBack={updateDataSettings} />
			</div>
		</div>
	</div>
}

function VisualTypesSelect({editorCallBack, visualData}) {

	const [curVisualData, setCurVisualData] = useState(visualData)
	const [curType, setCurType]             = useState(visualData.visType)
	const [curShape, setCurShape]           = useState(visualData.shapeType)

	// console.log('VisualTypesSelect!', visualData, curVisualData)

	useEffect(() => {
		setCurVisualData(visualData)
		setCurType(visualData.visType)
		setCurShape(visualData.shapeType)
	}, [visualData])


	// console.log('visualData', visualData)
	const availableOptions = DATA_OPTIONS[visualData.dataType].visual_options

	const setVisOption = (event) => {
		const visType = event.target.dataset.vis
		if(curVisualData.visType != visType) {
			setCurType( visType )
			// Set new prop to visualdata
			curVisualData.visType = visType
			// Remove some props from visualdata
			// delete curVisualData.shapeType
			// delete curVisualData.displayColor
			// setCurShape('')
			// console.log('setVisOption', visualData)
			// Log it
			UserLog({setVisOption:visType})
			// Update the caller
			editorCallBack(curVisualData, {type:'display:setVisOption'})
		}
	}

	const setShapeOption = (event) => {
		const shapeType = event.target.dataset.shape
		// console.log('shapeType!', shapeType)
		if(curVisualData.shapeType != shapeType) {
			setCurShape( shapeType )
			curVisualData.shapeType = shapeType
			// Log it
			UserLog({setShapeOption:shapeType})
			editorCallBack(curVisualData, {type:'display:setShapeOption'})
		}
	}

	const VisualOptionsList = () => {
		
		let visOpBtns = []

		for(let visOp of availableOptions) {			
			let activeClass = ( curType == visOp  ) ? 'active' : '';
			// Is not active (as in currently being edited)
			let addOption = true
			if('' == activeClass ) {
				if(VISUAL_OPTIONS[visOp].hasOwnProperty('max')) {
					const maxInstances = VISUAL_OPTIONS[visOp].max
					const shape2Check =  VISUAL_OPTIONS[visOp].shape
					if(shapeCounter[shape2Check] >= maxInstances) {
						addOption = false
					}
				}

			}
			if(addOption) {
				const tabBTN = <li key={`visual-option-${visOp}`}><a onClick={setVisOption} className={activeClass}  data-vis={visOp}></a></li>
				visOpBtns.push(tabBTN)
			}
		}

		return 	<ul className={`visual-options num-${availableOptions.length}`}>{visOpBtns}</ul>
	}

	const ShapeOptionsList = () => {
		if(VisHasOptionShape(curType)) {
			let shapeOpBtns = []
			for(let shapeOp of VISUAL_OPTION_SHAPES[curType]) {
				let activeClass = ( curShape == shapeOp  ) ? 'active' : '';
				const tabBTN = <li key={`visual-option-${shapeOp}`}><a onClick={setShapeOption} className={activeClass}  data-shape={shapeOp}></a></li>
				shapeOpBtns.push(tabBTN)
			}

			return 	<div id="visual-shape-ops-wrap">
				<h3>Kies een vorm</h3>
				<ul className={`shape-options num-${availableOptions.length}`}>{shapeOpBtns}</ul>
			</div>
		}
	}

	return <div id="visual-types-wrap">
		<h3>Soort visual</h3>
		<VisualOptionsList />
		<ShapeOptionsList />
	</div>
}
function GridSizeSelect({editorCallBack, visualData}) {
	const [curVisualData, setCurVisualData] = useState(visualData)
	const [curType, setGridSize]             = useState(visualData.shapeType)

	useEffect(() => {
		setCurVisualData(visualData)
		setGridSize(visualData.shapeType)
	}, [visualData])


	const availableOptions = DATA_OPTIONS[visualData.dataType].grid_options
	const numOptions       = Object.keys(availableOptions).length

	const setGridOption = (event) => {
		curVisualData.visType = 'DiamondsGrid'
		const gridSize = event.target.dataset.grid
		if(curVisualData.shapeType != gridSize) {
			setGridSize( gridSize )
			// Set new prop to visualdata
			curVisualData.shapeType = gridSize
			// Remove some props from visualdata
			// delete curVisualData.displayColor
			// Log it
			UserLog({GridSizeSelect:gridSize})
			// Update the caller
			editorCallBack(curVisualData, {type:'display:GridSizeSelect'})
		}
	}

	const GridOptionsList = () => {
		
		let visOpBtns = []

		for(let gridSize in availableOptions) {
			let visOp = availableOptions[gridSize]
			let activeClass = ( curType == visOp  ) ? 'active' : '';
			const tabBTN = <li key={`grid-option-${visOp}`}><a onClick={setGridOption} className={activeClass}  data-grid={visOp}>{gridSize}</a></li>
			visOpBtns.push(tabBTN)
		}

		return 	<ul className={`grid-options num-${numOptions}`}>{visOpBtns}</ul>
	}

	return <div id="grid-types-wrap">
		<h3>Grid Grootte</h3>
		<GridOptionsList />
	</div>

}

function EditorSubmitActive(visualData) {
	let btnActive = false
	// console.log('EditorSubmitActive?', visualData)
	// categories? color set: yes
	if(
		visualData.hasOwnProperty('visType')
		&&
		VisHasOptionShape( visualData.visType )
	) {
		let VisShapeSet = VisHasOptionShapeAndCurShape(visualData.visType,visualData.shapeType)
		if(VisShapeSet && visualData.displayColor) {
			btnActive = true	
		}		
	} else 	if(
		visualData.displayColor
	) {
		btnActive = true
	}
	// 
	return btnActive
}
function EditorStepReady(step, visualData) {
	let ready = false
	// console.log('EditorStepReady?', step, visualData)
	switch(step) {
		case 'color':
			if('categories' == visualData.dataType && visualData.visType) {
				ready = true
			} else if(
				visualData.visType
				&&
				(
					visualData.shapeType
					||
					!VisHasOptionShape(visualData.visType)
				)
			) {
				ready = true
				if(!VisHasOptionShapeAndCurShape(visualData.visType, visualData.shapeType)) {
					ready = false
				}
			}
		  break;
		case 'speed':
			if(visualData.hasOwnProperty('displayColor')) { ready = true }
		  break;
	}
	return ready
}

const Select = ({ label, value, options, onChange }) => {
	return (
		<label>
			{label}
			<select value={value} onChange={onChange}>
			{options.map((option) => (
				<option key={`select-op-${option.value}`} value={option.value}>{option.label}</option>
			))}
			</select>
		</label>
	);
};
const RadioGroup = ({ name, value, options, onChange }) => {
	const cbBtns = []
	options.map(function(option, index){
		let isChecked = (value == option.value) ? 'checked' : ''
		cbBtns.push( 
			<label key={`cb-op-${option.value}`} ><input name={name} checked={isChecked} onChange={onChange} type="radio" value={option.value} /> {option.label} </label> 
		)
	})
	return (<div className="radio-group-wrap">{cbBtns}</div>)
}
const Checkbox = ({ label, value, onChange }) => {
  return (
    <label>
      <input type="checkbox" checked={value} onChange={onChange} />
      {label}
    </label>
  );
};
function TypeSettings({visualData, editorCallBack}) {

	const [curVisualData, setCurVisualData] = useState(visualData)


	const [editI, setEditI] = useState(0)

	useEffect(() => {
		setCurVisualData(visualData)
	}, [visualData])

	// Set defaults
	const TYPE_DEFAULT = {
		textDisplayTag: true,	// Toon tag
		textDisplayPos: 'top',	// Text position
		textDisplayStats: true,	// Toon Stats
		textStatsType: 'minmax'	// Stats type (day || minmax)
	}
	for(let key in TYPE_DEFAULT) {
		if(!curVisualData.hasOwnProperty(key)) {
			curVisualData[key] = TYPE_DEFAULT[key]
		}
	}

	let textType = ('creator' == curVisualData.dataType) ? 'creator' : 'hashtag'

	const handleCBChange = (key) => {
		let newVal = !curVisualData[key]
	    // settextDisplayTag(!textDisplayTag)
	    curVisualData[key] = newVal
		setCurVisualData(curVisualData)
		setEditI( editI + 1 )
		console.log('handletextDisplayTagChange', newVal, curVisualData[key])
	};

	// Position select
	const 	positionOps = [
				{value: 'top', 	label: 'Boven'},
				{value: 'bot', 	label: 'Onder'},
				{value: 'right', label: 'Rechts'},
				{value: 'left',	label: 'Links'},
			]

	const parsePosition = (e) => {
		let txt_display_pos = e.target.value
		curVisualData.textDisplayPos = txt_display_pos
		setCurVisualData(curVisualData)
		// editorCallBack( curVisualData, {type:'type:parsePosition'} )
	}

	const parseStatsType = (e) => {
		let txt_stats_type = e.target.value
		curVisualData.textStatsType = txt_stats_type
		setCurVisualData(curVisualData)
		setEditI( editI + 1 )

		// editorCallBack( curVisualData, {type:'type:parseStatsType'} )
	}
	// Can the current visual display stats?
	let STATS_OPS = false

	let visType = (curVisualData.visType) ? curVisualData.visType : visualData.visType

	if(visType) {
		STATS_OPS = (VISUAL_OPTIONS[visType].txtSettings.statsOptions.length > 1)
	}

	const statsTypeOps = [
		{value: 'minmax', label: 'Min & Max waardes'},
		{value: 'day', label: 'Aantal per dag'},
	]

	return (
		<div className="text-inputs-wrap">
			<Checkbox
				label="Toon Tekst"
				value={curVisualData.textDisplayTag}
				onChange={(e) => { handleCBChange('textDisplayTag') }}
			/>		
			{curVisualData.textDisplayTag &&
				<>
				<div className="text-position-setter">
					<Select
				        label="Positie"
				        options={positionOps}
				        value={curVisualData.textDisplayPos}
				        onChange={parsePosition}
					/>
				</div>
				{/*Stats*/}
					<Checkbox
						label="Toon Stats"
						value={curVisualData.textDisplayStats}
						onChange={(e) => { handleCBChange('textDisplayStats') }}
					/>		
					{curVisualData.textDisplayStats && STATS_OPS &&
						<RadioGroup
							name="set-stats-type"
					        options={statsTypeOps}
					        value={curVisualData.textStatsType}
					        onChange={parseStatsType}
						/>
					}
				</>
			}
		</div>
	)
}

export default function PhoneEditor({visualIndex, visualData, callBack, editorMode}) {
	
	// const [displayClass, setDisplayClass] =  useState('')
	const [initVisualData, setInitVisualData] = useState( visualData )
	const [curVisualData, setCurVisualData] = useState( {...visualData} )
	const [editType, setEditType] = useState('')

	// don't update unnecessarily
	// if ('edit' == editorMode && curVisualData !== visualData) { setCurVisualData(visualData);  }
	useEffect(() => {
		if('add' == editorMode ) { visualData = {} }
		// console.log('PhoneEditor:useEffect! visualData has changed ', editorMode, visualData)
		setCurVisualData( {...visualData} )
		setInitVisualData( visualData )
	}, [visualData, editorMode])

	// const titlePrefix = (editorMode == 'edit') ? 'Edit' : 'Add'
	const titlePrefix             = (editorMode == 'edit') ? 'Aanpassen' : 'Toevoegen'
	const dateInputTitlePrefix    = (editorMode == 'edit') ? 'aanpassen' : 'selecteren'
	const visualOutputTitlePrefix = (editorMode == 'edit') ? 'aanpassen' : 'selecteren'

	let displayClass = '';
	if(editorMode == 'edit' || editorMode == 'add') {
		displayClass = 'shown';
	}

	const closeBtn = useRef();

	const closeEditor = (event) => {
		visualIndex = -1
		displayClass = '';
		callBack(event)
		// setDisplayClass('')
	}

	const defaultPlaybackSpeed = (curVisualData && curVisualData.hasOwnProperty('displaySpeed')) ? curVisualData.displaySpeed : 10

	const setPlayBackSpeed = (event) => {
		curVisualData.displaySpeed = parseInt( event.target.value )
		setCurVisualData(curVisualData)
	}

	const changePhoneSettings = (dataSettings, editType) => {
		console.log('editType', editType)
		setCurVisualData(dataSettings)
		updateSectionsToggled(editType.type)
		setEditType( editType.type )
	}
	// Has visual options? (alleen categories niet)
	let hasVisualOptions  = VisHasVisualOptions(curVisualData)
	let hasGridOptions    = VisHasGridOptions(curVisualData)
	// Speed control ?
	const hasSpeedControl = false // VisHasOptionSpeed(curVisualData.visType)
	// Show color options ?
	let stepReadyColor    = EditorStepReady('color', curVisualData) // (editorMode == 'edit') ? true : 
	// Show speed option ?
	let stepReadySpeed    = EditorStepReady('speed', curVisualData) // (editorMode == 'edit') ? true : 
	// Show Submit ?
	let submitDisplay     = EditorSubmitActive(curVisualData)

	// Commit
	const commitVisual = () => {
		// setInitVisualData(curVisualData)
		// console.log(editorMode, 'commitVisual!', curVisualData)
		SetEdtrActiveData(curVisualData)
		// Log it
		UserLog({CommitVisual:editorMode})
		callBack({editorMode, curVisualData})
		// Clear prev relevant data
		setCurVisualData({})
		editorMode = ''
	}
	const labelSubmit = (titlePrefix == 'Aanpassen') ? 'Wijzigingen Opslaan' : 'VISUAL TOEVOEGEN'

	// Toggle sections display
	const sectionData   = useRef()
	const sectionVisual = useRef()
	const sectionType   = useRef()
	const sectionRefs   = [sectionData, sectionVisual, sectionType]

	let sectionDisplayData = (editorMode == 'edit') ? 'hidden' : ''
	let sectionDisplayVisual = (editorMode == 'edit') ? '' : ''
	let sectionDisplayType = (editorMode == 'edit') ? '' : ''

	function updateSectionsToggled(editType) {
		if('edit' == editorMode && editType.indexOf('display:') != -1 ) {
			toggleSectionDisplay('data', 'off')
		}
	}

	function toggleSectionDisplay(section, mode) {

		// not needed in add mode
		if('add' == editorMode) { return false }

		let relRef, newDisplay
				// console.log('toggleSectionDisplay ', section,', cur: ', sectionDisplayData)
		if('data' == section) {
			relRef             = sectionData
		} else if('visual' == section) {
			relRef               = sectionVisual
		} else if('type' == section) {
			relRef             = sectionType
		}
		newDisplay = (relRef.current.classList.contains('hidden')) ? '' : 'hidden'
		if(mode) { newDisplay = ('off' == mode) ? 'hidden' : ''  }
		// Toggle it
		if(newDisplay == '') {
			relRef.current.classList.remove('hidden')
			// Hide the other sections
			if('edit' == editorMode) {
				for(let sref of sectionRefs) {
					if(sref != relRef) {
						sref.current.classList.add('hidden')
					}
				}
			}
		} else {
			relRef.current.classList.add('hidden')
		}			
	}
	// console.log('curVisualData', curVisualData, 'visualData', visualData)
	// let visType = (curVisualData.visType) ? curVisualData.visType : visualData.visType
	let TXT_SECTION = false
	if(
		curVisualData.hasOwnProperty('visType')
		&&
		'edit' == editorMode 
		&& VISUAL_OPTIONS[curVisualData.visType].txtSettings
	) {
		TXT_SECTION = true	
	}
	 

	return <div id="editorOutput" className={displayClass}>
			<header>
				<h1>Visual {titlePrefix}</h1>
			</header>
			<section ref={sectionData} id="data-input" className={sectionDisplayData}>
				<h2 onClick={(e) => toggleSectionDisplay('data')}>Data input <em>{dateInputTitlePrefix}</em> </h2>
				{/* Edit DATA_INPUT */}
				<div className="editor-section-wrap">
					<EditorDataTabs editorCallBack={changePhoneSettings} visualData={curVisualData} />
				</div>
			</section>
			{/* dataTag Chosen ? Proceed to step 2 */}
			{curVisualData.hasOwnProperty('dataTag') &&			
				<section ref={sectionVisual} id="data-display" className={sectionDisplayVisual}>
					<h2 onClick={(e) => toggleSectionDisplay('visual')}>Visuele output <em>{visualOutputTitlePrefix}</em></h2>
					<div className="editor-section-wrap">
						{hasVisualOptions &&
							<VisualTypesSelect editorCallBack={changePhoneSettings} visualData={curVisualData} />
						}
						{hasGridOptions &&
							<GridSizeSelect editorCallBack={changePhoneSettings} visualData={curVisualData} />					
						}
						{/* Edit COLOR */}
						{stepReadyColor && 
						<div id="color-wrap">
							<h3><i></i> Kleur</h3>
							<ColorOptions visualData={curVisualData} editorCallBack={changePhoneSettings}  numOptions={9} />
						</div>
						}
						{/* Edit SPEED */}
						{hasSpeedControl && stepReadySpeed &&
						<div id="speed-wrap">
							<h3><i></i> Snelheid</h3>
							<input onChange={setPlayBackSpeed} type="range" id="playBackSpeed" min="1" max="20" defaultValue={defaultPlaybackSpeed} step="1" />
						</div>
						}
					</div>
				</section>
			}
			{TXT_SECTION &&
				<section ref={sectionType} id="type-display" className={sectionDisplayType}>
					<h2 onClick={(e) => toggleSectionDisplay('type')}>Tekst <em>instellingen</em></h2>
					<div className="editor-section-wrap">
						<TypeSettings visualData={curVisualData} editorCallBack={changePhoneSettings} />
					</div>
				</section>

			}
			{submitDisplay &&
				<button id="submit-data-visual" onClick={commitVisual}>{labelSubmit}</button>
			}
		</div>
}
