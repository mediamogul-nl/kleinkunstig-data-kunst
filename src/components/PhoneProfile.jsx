import { useState, useMemo, useRef, useEffect  } from 'react'

import useAnimationFrame from './helpers/useAnimationFrame'
import FormatNumber from './helpers/FormatNumber'
import { clamp } from  './helpers/GridHelpers'

import { PhoneDayCounters } from  './helpers/VisualsDataExchange'

import { UAC_FRAMED_TIMELINE, USR_ACT_TIMELINE, UAC_visual_id } from  './UserActivityLogger'


export default function PhoneProfile({callBack}) {

	// console.log('UAC_FRAMED_TIMELINE', UAC_FRAMED_TIMELINE.frames)

	if(PhoneDayCounters.hasOwnProperty(UAC_visual_id)) {
		// console.log( 'cur UAC Frame:', PhoneDayCounters[UAC_visual_id] )
	}

	const uac_counter_spans = useRef({})

	const intro_text = <p>Sinds je bent begonnen is elke actie van je bijgehouden. Dit is jouw profiel data:</p>

	const displayBoxes = {
		0: {
			id: 'uac-box-01',
			keys: {
				adds: 'Toegevoegd', // 'Visuals Added',
				edits: 'Aangepast', // 'Visuals Edited',
				deletes: 'Verwijderd', // 'Visuals Deleted',
				info: 'Info geklikt',// 'Button Clicked',
				drags: 'Hoesje gedraaid', // 'Phone Cover Dragged'
			}
		},
		1: {
			id: 'uac-box-02',
			keys: {
				hashtags: 'Hashtags gekozen', //'Hashtags Loaded',
				searches: 'Gezocht', //'Terms Searched',
				creators: 'Accounts gekozen', //'Creators Loaded',
				randomTags: 'Random Items',				 //'Random Items',				
				categories: 'Categorien gekozen', //'Categories Loaded',
				swatchesGenerated: 'Kleuren gegenereerd' //'Pallets Generated'
			}
		},
		2: {
			id: 'uac-box-03',
			keys: {
				visType_DayBoxes: 'Visual gekozen', // 'Visual Selected',
				visType_DiamondsRing: 'Visual gekozen', // 'Visual Selected',
				visType_DayHeightMap: 'Visual gekozen', // 'Visual Selected',
				visType_PopSocket: 'Visual gekozen', // 'Visual Selected',
				visType_CreatorHeightmap: 'Visual gekozen', // 'Visual Selected',
				visType_DiamondsGrid: 'Visual gekozen', // 'Visual Selected',
			}
		},
		3: {
			id: 'uac-box-04',
			title: 'Gekozen Vormen', // Shapes selected
			keys: {
				shapeType_cube: '',
				shapeType_piramid: '',
				shapeType_capsule: '',
				shapeType_diamond: '',
				shapeType_emerald: '',
				shapeType_heart: '',
				shapeType_flower: '',
				shapeType_rose: '',
				shapeType_skull: '',				
			}
		}
	}

	const BoxesDisplay = useMemo(() => {
		let boxes = []
		for(let box_i in displayBoxes) {
			const BOX = displayBoxes[box_i]
			// Set title
			let boxTitle = (BOX.hasOwnProperty('title')) ? <h3>{BOX.title}</h3> : ''
			// Add the icons
			let icons_dusplay = []
			let boxKeys = BOX.keys

			for(let k in boxKeys) {
				let keyTxt = boxKeys[k]
				let label = (keyTxt == '') ? '' : <label>{keyTxt}</label>
				const keyLi = <li key={`box-icon-${k}`}>
					<i className={k}></i>
					{label}
					<kbd ref={ (element) => uac_counter_spans.current[k] = element }>0</kbd>
				</li>
				icons_dusplay.push(keyLi)
			}

			// Put together
			const boxMarkup = <div 
				id={BOX.id}
				key={BOX.id}
			>
			{boxTitle}
			<ul>{icons_dusplay}</ul>
			</div>

			boxes.push(boxMarkup)
			// console.log('displayBoxes', BOX)
		}
		return boxes

	}, [])

	// Update the values..
	let prevDay = -1
	useAnimationFrame(deltaTime => {
		// Day set ?
		if(PhoneDayCounters.hasOwnProperty(UAC_visual_id)) {
			let ProfileDay = PhoneDayCounters[UAC_visual_id]
			if(ProfileDay != prevDay) {
				prevDay = ProfileDay
				const statsList = uac_counter_spans.current
				const curStats = (UAC_FRAMED_TIMELINE.frames.length > 0) ? UAC_FRAMED_TIMELINE.frames[ProfileDay] : []
				for(let stat_key in statsList) {
					const el = statsList[stat_key]
					el.innerHTML = (curStats.hasOwnProperty(stat_key)) ? curStats[stat_key] : 0
				}

				// console.log(statsList)
			}
		}
	})
	// Clear the data.!
	const clearBtn = useRef()

	const ClearUserData = () => {
		if(confirm('Are you sure?')) {
			UAC_FRAMED_TIMELINE.frames = []
			// Clear const
			for(let k in USR_ACT_TIMELINE) {
				delete USR_ACT_TIMELINE[k]
			}
		}
		clearBtn.current.classList.add('unavailable')
	}

	return (
		<div id="user-profile-wrap">
			<header>
				<h1>Jouw Profiel</h1>
			</header>
			{intro_text}
			{BoxesDisplay}
			<button id="clearUserData" onClick={ClearUserData} ref={clearBtn}>Verwijder mijn profiel data</button>
		</div>
	)
}