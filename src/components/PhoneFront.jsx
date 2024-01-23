import { useState, useMemo, useRef, useEffect  } from 'react'

import useAnimationFrame from './helpers/useAnimationFrame'
import FormatNumber from './helpers/FormatNumber'
import { clamp } from  './helpers/GridHelpers'
import { PhoneDayCounters, ActiveVisuals } from  './helpers/VisualsDataExchange'
import {TikTokCategories, TikTokCatsOrder} from './DiamondsGrid'

import PhoneEditor from './PhoneEditor'
import PhoneFrontInfo from './PhoneFrontInfo'
import PhoneProfile from './PhoneProfile'
// User Logger
import { USR_ACT_TIMELINE, UserLog } from  './UserActivityLogger'


let PROFILE_BTN_ACTIVE = false

function ProfileButton({callBack, label}) {
	
	const [logsCounted, setLogsCounted] = useState(0)

	// Make Profile Button active when at least X amount of user actions have been logged
	const profileBtn = useRef()

	const minLogMoments = 10
	useEffect(() => {
		let numLogMoments = Object.keys(USR_ACT_TIMELINE).length
		// console.log('num log moments has changed', numLogMoments)
		if(!PROFILE_BTN_ACTIVE && numLogMoments >= minLogMoments) {
			PROFILE_BTN_ACTIVE = true
			profileBtn.current.classList.add('available')
		}
	}, [Object.keys(USR_ACT_TIMELINE).length])

	return <button id="profileShow" ref={profileBtn} onClick={callBack}>{label}</button>
}

function StartScreen() {
	return (
		<div className="start-screen">
			<i id="daysofdatalogo"></i>
			<div className="intro-text">
				<p>100 dagen lang werd 100 keer per dag<br />de data van alle trending video’s op TikTok in Nederland opgeslagen. </p>
				<p>De data van alle gebruikte hashtags, de makers die de video’s hebben gemaakt en de categorieën van de video’s werd opgeslagen in een grote database.</p>
				<p>Gebruik deze tool om diverse visualisaties te maken van deze data op het telefoonhoesje aan de rechterkant.</p>
				<p>Klik op + Data Visual om te beginnen :)</p>
			</div>
		</div>
	)
}

export default function PhoneFront({displayMode, visualIndex, visualData, callBack, controlI}) {


	const [curDisplayMode, setCurDisplayMode] = useState( displayMode )

	const [curVisualIndex, setcurVisualIndex] = useState( visualIndex )

	// btns collapserrr
	const [btnsCollapsed, setBtnsCollapsed] = useState(false)
	const toggleButtonRow = (e) => {
		setBtnsCollapsed( !btnsCollapsed )
	}
	let btn_collapse_class = (!btnsCollapsed) ? 'open' : 'collapsed'

	// console.log('_RNDR_PhoneFront: ', displayMode, curDisplayMode)

	// states:  » Start » Add » Edit » Info » Profile
	
	useEffect(() => {
		setCurDisplayMode(displayMode)
		setcurVisualIndex(visualIndex)
		// console.log('_useEffect:PhoneFront: ', displayMode, curDisplayMode)
	}, [controlI, displayMode])

	
	const closeFrontje = () => {
		callBack('start', -1, {})
	}

	// console.log('PhoneFront ici! - visualIndex', visualIndex, curDisplayMode, visualData.visualID)

	let displayClass = 'shown'

	const showProfile = () => {
		if(PROFILE_BTN_ACTIVE) {
			UserLog({clicked: 'showProfile'})
			// displayMode = 'profile'
			// setCurDisplayMode('profile')
			callBack('profile', -1, {})
		}
	}

	const addVisual = () => {
		if('add' != curDisplayMode) {
			const curNumVisuals = Object.keys(ActiveVisuals).length
			// setCurDisplayMode('add')
			// setcurVisualIndex(curNumVisuals)
			UserLog({clicked: 'addVisual'})
			callBack('set2add', visualIndex, {})
		}
	}

	const profileLabel = ('profile' == displayMode) ? 'Terug' : 'Profiel'

	const phoneFrontEditorCallback = (editorProps) => {
		// console.log('phoneFrontEditorCallback!', curDisplayMode, editorMode, editorData)
		callBack(editorProps.editorMode, visualIndex, editorProps.curVisualData)
	}
	const visualInfoCallback = (props) => {
		setvisual2Info(-1)
	}
	

	const editorModes = ['edit', 'add', 'set2add']
	const inEditMode = (editorModes.indexOf(curDisplayMode) != -1)

	return (
		<>
			<div className={`phoneFront ${displayClass} mode-${curDisplayMode}`}>
				<a id="closer" onClick={closeFrontje}>&times;</a>
				<div className="shapeSetter">
					<div className="inner">
						{'info' == curDisplayMode &&
						    <PhoneFrontInfo visualIndex={visualIndex} visualData={visualData} callBack={visualInfoCallback} />
						}
						{'start' == curDisplayMode &&
							<StartScreen />
						}
						{inEditMode &&
						    <PhoneEditor editorMode={curDisplayMode} visualIndex={visualIndex} visualData={visualData} callBack={phoneFrontEditorCallback} />
						}
						{'profile' == curDisplayMode &&
						    <PhoneProfile callBack={phoneFrontEditorCallback} />
						}						
						<div id="bottom-buttons" className={btn_collapse_class}>
							<ProfileButton callBack={showProfile} label={profileLabel} />
							<button id="visualAdd" onClick={addVisual}><span><i>+</i> Datavisual</span></button>
							<button id="toggleButtonRow" onClick={toggleButtonRow}></button>
						</div>
					</div>
				</div>
			</div>
		</>	
	)

}