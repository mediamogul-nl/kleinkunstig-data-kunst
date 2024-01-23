import { useState, useMemo, useRef, useEffect  } from 'react'

import useAnimationFrame from './helpers/useAnimationFrame'
import FormatNumber from './helpers/FormatNumber'
import { clamp } from  './helpers/GridHelpers'
import { PhoneDayCounters, DAY_FRAMER } from  './helpers/VisualsDataExchange'
import {TikTokCategories, TikTokCatsOrder} from './DiamondsGrid'
import VisualsInfo from './VisualsInfo'
// User Logger
import { UserLog } from  './UserActivityLogger'
import { FRAME_DATES } from './constants/frameDates'


function CreatorHeader({visualMode, creatorName}) {

	const headerContent = <>
				<div className="pic"></div>
				<h3>@{creatorName}</h3>
			</>

	return <header className={visualMode}>{headerContent}</header>
}

let InfoReqAniFrID


function CreatorStats({grid, playBackSpeed, visualID, phoneDaySynced}) {

	const [curDayIndex, setCurDayIndex] = useState(0)


	useEffect(() => {
		const initDay = DAY_FRAMER.day // (phoneDaySynced) ? PhoneDayCounters[visualID] : 0
		setCurDayIndex( initDay )
	}, [visualID])

	// console.log('CreatorStats', grid)

	const numFollowers = grid.followers[curDayIndex]
	const numHearts    = grid.hearts[curDayIndex]
	const numVideos    = grid.num_vids[curDayIndex]

	if(!playBackSpeed) { playBackSpeed = 10;}

	// Set animation vars
	const maxFrames = 100
	let frame_i     = 0
	let dayI        = curDayIndex
	let prevDay     = -1

	// Start animating boiii
	
	const updateStatsDisplay = (deltaTime) => {
			dayI = DAY_FRAMER.day
			if(prevDay != dayI) {
				prevDay = dayI
				setCurDayIndex(dayI)
			}
	}
	const framer = useAnimationFrame(updateStatsDisplay)
	
	let dayCounter = curDayIndex + 1

	const maxVideos = 6

	// Creator vids
	const vids2Show = clamp(numVideos, 0, maxVideos)
	// console.log('CreatorStats: vids2Show', vids2Show)

	return <div className="stats-wrap">
		<div className="day-counter"><span>{dayCounter}</span></div>
		<ul>
			<li key="stats-numFollowers"><span>{FormatNumber(numFollowers, 1)}</span><label>Followers</label></li>
			<li key="stats-numHearts"><span>{FormatNumber(numHearts, 1)}</span><label>Likes</label></li>
			<li key="stats-numVideos"><span>{numVideos}</span><label>Videos</label></li>
		</ul>
		<CreatorVids numVids={vids2Show} />
	</div>
}

function CreatorVids({numVids}) {
	const [vids2Show, setVids2Show] = useState(numVids)

	useEffect(() => {
		setVids2Show(numVids)
	}, [numVids])

	const vids = []
	for(let i=0; i < vids2Show; i++) {
		const vidDisplay = <div className="vid-ph" key={`vid-${i}`}><div><i></i></div></div>
		vids.push(vidDisplay)
	}
	// console.log('CreatorVids', vids2Show, numVids, vids)
	return	<div className="vids-display">{vids}</div>

}
function CreatorButtons() {
	return <div className="btns-wrap">
		<button>Follow</button>
		<button className="options">&nbsp;</button>
	</div>
}
function HashTagPage({grid, tag, playBackSpeed, visualID, phoneDaySynced}) {
	// console.log('dataSettings', dataSettings)

	let initDayIndex = DAY_FRAMER.day // (phoneDaySynced) ? PhoneDayCounters[visualID] : 0
	const [curDayIndex, setCurDayIndex] = useState(initDayIndex)

	if(!playBackSpeed) { playBackSpeed = 20; }
	/*
	useEffect(() => {
		// console.log('HashTagPage: initDayIndex', initDayIndex, 'phoneDaySynced: ', phoneDaySynced, visualID)
		setCurDayIndex(initDayIndex)
	}, [visualID])
	useEffect(() => {
		console.log('HashTagPage - useffect DAY_FRAMER.day', DAY_FRAMER.day)
		setCurDayIndex( DAY_FRAMER.day )
	}, [DAY_FRAMER])
	*/


	const vidsList = useRef()

	const maxFrames = 100
	let frame_i     = 0
	let dayI        = curDayIndex
	
	const animate = true
	const animateDays = true


	let prevDay = -1

	if(animate) {
		useAnimationFrame(deltaTime => {

			const vList = vidsList.current
			if(vList) {
				let scrollDelay = 0
				if(prevDay != DAY_FRAMER.day) {
					setCurDayIndex(DAY_FRAMER.day)
					prevDay = DAY_FRAMER.day
					if(curDayIndex == 0) { vList.scrollTop = 0 }
				}
				const loH = vList.offsetHeight
				const lsH = vList.scrollHeight

				// console.log(dayI, 'loH: ', loH, 'lsH', lsH)
				if((loH * 2 ) < lsH) vList.scrollTop+= 10


				if(vList.scrollTop + loH >= lsH) {
					vList.scrollTop = 0
				}
			}
		})
	}


	// Day Counter
	let dayIndex = curDayIndex + 1
	const dayCounter = <div className="day-counter"><span>{dayIndex}</span></div>

	// #hashtag - X number of vids 'video's trending'
	// console.log(curDayIndex)
	let numVideos  = (grid.hasOwnProperty('num_per_day')) ? grid.num_per_day[curDayIndex] : false
	if(!numVideos) { numVideos = 0}

	const cur_day_search_q = () => {
		const replacers = {
			Feb: 'February',
			Mar: 'March',
			Apr: 'April',
			Mei: 'May'
		}
		let cur_date = FRAME_DATES[ DAY_FRAMER.day ]
		for(let find in replacers ) {
			if(cur_date.indexOf(find) != -1) {
				cur_date = cur_date.replace(find, replacers[find])
			}
		}
		cur_date+= ' 2023'
		return cur_date.replaceAll(' ', '+')
	}

	// Get a google search link for this tag & date
	const GoogleURL = `https://www.google.com/search?q=${tag}+${cur_day_search_q()}`
	const GoogleBtn = <a target="_blank" title="Zoek op Google" href={GoogleURL} id="google-btn">google</a>
	// Set header tag, amount trending & btn
	const vidsHeader = <h1><strong>#{tag}</strong> - {numVideos} &times; trending {GoogleBtn}</h1>

	// lijst van vids:
	// #hashtag, desc, authorname, diggcount
	const dayVideoIDs = (grid.hasOwnProperty('day_videos')) ? grid.day_videos[curDayIndex] : []
	// if(!dayVideoIDs) { return }

	return <div className="hashtag-page">
		{dayCounter}
		{vidsHeader}
		<div ref={vidsList} className="vids-display">
			<HashtagVids videoIDs={dayVideoIDs} videoData={grid.videos} tag={tag} />
		</div>
	</div>
}
function HashtagVids({videoIDs, videoData, tag}) {
	const vidPreviews = []

	const maxVids = 20 // Math.floor( videoIDs.length / 2) * 2;

	if(videoIDs && videoIDs.length > 0) {
		videoIDs.map(function(videoID, index) {
			if(index < maxVids) {
				const vidData = videoData[videoID]
				const vidDisplay = <div key={`vid-display-${videoID}-${index}`} className="vid-ph">
					<div><i></i></div>
					<div className="desc-wrap">
						#{tag} {vidData.d}
					</div>
					<div className="author-wrap">
						<i></i> {vidData.a}
					</div>
					<div className="likes-wrap">
						<i></i> {FormatNumber(vidData.l)}
					</div>
				</div>
				vidPreviews.push(vidDisplay)
			}
		})
	}
	return vidPreviews
}
function CategoriesPage({grid, visualID, phoneDaySynced, playBackSpeed, activeCats}) {

	let initDayIndex = DAY_FRAMER.day // (phoneDaySynced) ? PhoneDayCounters[visualID] : 0
	const [curDayIndex, setCurDayIndex] = useState(initDayIndex)

	if(activeCats!='*') { activeCats = activeCats.split(',') }
	const showingAll = (activeCats == '*' || activeCats.length == TikTokCatsOrder.length) ? true : false
	if(showingAll) { activeCats = TikTokCatsOrder }


	if(!playBackSpeed) { playBackSpeed = 20; }

	// const CategoryBoxes = []
	const catBoxRef = useRef([])

	useEffect(() => {
		// console.log('CategoriesPage: initDayIndex', initDayIndex, 'phoneDaySynced: ', phoneDaySynced, visualID)
		setCurDayIndex(initDayIndex)
	}, [visualID])
	

	const {CategoryBoxes, CatBoxIndexes} = useMemo(() => {
		// console.log('activeCats', activeCats)
		const CategoryBoxes = []
		const CatBoxIndexes = {}
		// Create the boxes once
		for(let i in TikTokCategories) {
			const CatName = TikTokCategories[i].name
			// console.log(CatName)
			if(activeCats.indexOf(CatName)!= -1) {
				// console.log('CatName', CatName)		
				let swatchColor = 'efefef';
				if(TikTokCategories[CatName].hasOwnProperty('material')) {
					swatchColor = TikTokCategories[CatName].material.color.getHexString()
				}

				const bgStyle = {
					backgroundColor: '#' + swatchColor
				}
				// console.log('swatchColor', swatchColor)

				const catButton = <li 
					className="catButton"
					key={`catbtn-${CatName}`}
					ref={ (element) => catBoxRef.current[i] = element }
				>
					<i style={bgStyle}></i>
					{CatName}
					<div className="stat-no"><span></span> <small></small></div>
				</li>
				CategoryBoxes.push( catButton )

				CatBoxIndexes[CatName] = i
			}

			// i++
		}
		return {CategoryBoxes, CatBoxIndexes}
	}, [visualID, activeCats])


	// console.log('CatBoxIndexes', CatBoxIndexes)

	const maxFrames = 100
	let frame_i     = 0
	let dayI        = curDayIndex
	
	const animate = true
	const animateDays = true

	// console.log( catBoxRef.current )

	let prevDay = -1

	useAnimationFrame(deltaTime => {
		dayI = DAY_FRAMER.day
		if(prevDay != dayI) {
			setCurDayIndex(dayI)
			prevDay = dayI
		}
	})

	const updateCatButtons = () => {
		// Go thru each button. update those stats boiii
		const dayGrid = grid[curDayIndex]
		let Cat2Index = {}
		// Sort categories in same order, makes more sense visually
		for(let index in dayGrid) {
			Cat2Index[dayGrid[index].name] = index
		}
		for(let CatName of TikTokCatsOrder) {
			let refIndex = CatBoxIndexes[CatName]
			// console.log('refIndex', refIndex)
			let DayCatI = Cat2Index[CatName]
			if(dayGrid[DayCatI] &&  catBoxRef.current[refIndex]) {
				let dayData = dayGrid[DayCatI]
				let statsWrap = catBoxRef.current[refIndex].children[1]
				// console.log(statsWrap)
				
				let amountSpan = statsWrap.children[0]
				let percSmall = statsWrap.children[1]
				amountSpan.innerHTML = dayData.amount
				percSmall.innerHTML = '(' + dayData.percentage.toFixed(2) + '%)'
				// console.log( amountSpan )
			}
		}
		// console.log( catBoxRef.current)

		// console.log(dayGrid)
	}
	updateCatButtons()

	const dayCounter = curDayIndex + 1

	return <div className="categories-wrap">
		<div className="day-counter"><span>{dayCounter}</span></div>
		<h2>Trending video’s per categorie</h2>
		<ul>{CategoryBoxes}</ul>
	</div>
}

function PageDisplay({visualMode, visualData, playBackSpeed, phoneDaySynced}) {
	const pageSections = []

	// console.log('PageDisplay!', visualData, 'visualMode', visualMode)
	UserLog({InfoPageDisplay: visualMode})

	if('creator' == visualMode ) {
		pageSections.push(<CreatorHeader key="phone-header" visualMode={visualMode} creatorName={visualData.dataTag} />)
		pageSections.push(<CreatorStats key="creator-stats" playBackSpeed={playBackSpeed} grid={visualData.grid} visualID={visualData.visualID} phoneDaySynced={phoneDaySynced} />)
		pageSections.push(<CreatorButtons key="creator-btns" />)
	} else if('hashtag' == visualMode ) {
		pageSections.push(<HashTagPage key="hashtag-page" grid={visualData.grid} visualID={visualData.visualID} phoneDaySynced={phoneDaySynced} tag={visualData.dataTag} playBackSpeed={playBackSpeed} />)
	} else if('categories' == visualMode ) {
		pageSections.push(<CategoriesPage activeCats={visualData.activeCats} key="categories-page" grid={visualData.grid} visualID={visualData.visualID} phoneDaySynced={phoneDaySynced} playBackSpeed={playBackSpeed} />)
	}
	return pageSections;
}

export default function PhoneFrontInfo({visualIndex, visualData, callBack}) {

	// console.log('------============------============ PhoneFrontInfo', visualIndex, visualData)//, visualData

	let displayClass = '';
	if(visualIndex >= 0) {
		displayClass = 'shown';
	} 
	const [curvisualIndex, setCurvisualIndex] = useState( visualIndex )

	const visualDataSet = Object.keys(visualData).length > 0

	useEffect(() => {
		setCurvisualIndex(visualIndex)
	}, [curvisualIndex])


	const closeInfo = (event) => {
		// console.log('closeInfo!')
		/*visualIndex = -1
		setCurvisualIndex( visualIndex )
		displayClass = '';*/
		callBack({closeInfo: true})
	}

	/* Tabs*/
	const infoTabs = {
		'data': 'Data input',
		'visual': 'Over de visual'
	}

	const [tabMode, setTabMode] = useState('data')

	const SwapTab = (event) => {
		let newTab = event.target.dataset.mode;
		setTabMode(newTab)
	}

	const TabHeader = () => {
		
		let headerBtns = []

		for(let tabKey in infoTabs) {
			let tabLabel = infoTabs[tabKey];
			let activeClass = ( tabMode == tabKey  ) ? 'active' : '';
			const tabBTN = <li key={`info-tab-${tabKey}`}>
				<a onClick={SwapTab} className={activeClass} rel={`tab-${tabKey}`} data-mode={tabKey}>{tabLabel}</a>
			</li>
			headerBtns.push(tabBTN)
		}
		return 	<div id="info-page-tabs-wrap">
			<ul>{headerBtns}</ul>
		</div>
	}

	// const 
	let initGrid = (visualDataSet) ? visualData.grid : null
	const [grid, setGrid] = useState( initGrid )

	let visualMode = 'none'; 
	if(visualDataSet) {
		let phDataType = visualData.dataType
		// console.log('phDataType', phDataType)
		visualMode = (phDataType.indexOf('creator') != -1) ? 'creator' : 'hashtag'
		// but a secret third thing...
		if( phDataType.indexOf('categories') != -1 || ('reset4Cats' == phDataType) ) { visualMode = 'categories' 	}
	} 

	const playBackSpeed = (visualDataSet) ? visualData.displaySpeed : 1

	const phoneDaySynced = (visualDataSet) ? PhoneDayCounters.hasOwnProperty( visualData.visualID ) : false
	if(visualDataSet) {
		// console.log('PhoneFrontInfo:', visualData.visualID,'phoneDaySynced: ',phoneDaySynced, playBackSpeed)
	}
	return (
		<>
			<div className={`phoneFrontInfo ${displayClass} mode-${visualMode}`}>
				<div className="shapeSetter">
					<div className="inner">
						<TabHeader />
						{'data' == tabMode &&
							<PageDisplay 
								visualMode={visualMode} 
								grid={grid} 
								phoneDaySynced={phoneDaySynced} 
								visualData={visualData} 
								playBackSpeed={playBackSpeed} 
							/>
						}
						{'visual' == tabMode &&
							<VisualsInfo visualData={visualData} />
						}
					</div>
				</div>
			</div>
		</>	
	)
}