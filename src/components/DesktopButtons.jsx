import { useState, useMemo, useRef, useEffect  } from 'react'
import * as THREE from 'three'
import { ActiveVisuals } from './helpers/VisualsDataExchange'

// Ajax stuff
import axios from 'axios';
import {apiServerURL} from './helpers/ServerSettings'


function generate_uuidv4() {
	return Math.random().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15);
}
const APP_GUID = generate_uuidv4()

export function DesktopUXBtns({callback}) {

	const btnShare = useRef();
	const btnSave = useRef();

	const Share2Mobile = (e) => {
		callback({action: 'share2mobile'})
	}

	const TakeScreenshot = (e) => {
		callback({action: 'takescreenshot'})
	}

	return (
		<div id="desktop-ux-wrap">
			<a ref={btnShare} onClick={Share2Mobile} id="share-to-mobile"><i></i>share</a>
			<a ref={btnSave} onClick={TakeScreenshot} id="take-screenshot"><i></i>save</a>
		</div>
	)
}

export function Send4QRCode(visuals2Add, ShareQRCallback) {
	let numVisuals = Object.keys(visuals2Add).length
	if(numVisuals > 0) {
		// Parse for storage
		const shareData = {} // JSON.parse(JSON.stringify(visuals2Add))
		for(let vis_i in visuals2Add) {
			const thisvis = {}
			let visData = visuals2Add[vis_i];
			for (let visKey in visData) {
				if('displayColor' == visKey) {
					let clrdata = visData.displayColor
					let clr = {
						r: visData.displayColor.r,
						g: visData.displayColor.g,
						b: visData.displayColor.b,
					}
					// console.log('clr', clr, clrdata)
					thisvis.color = clr

				} else if('grid' != visKey) {
					thisvis[visKey] = visData[visKey]
				}
			}
			shareData[vis_i] = thisvis
		}
		// Set as postdata
		const postData = {
			visualsData: shareData,
			guid: APP_GUID
		}
		// Send it off
		axios.post(
			apiServerURL + '?req=getqrcode', 
			postData,
			{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' }	}			
		)		
	    .then(response => {
	    	const response_data = response.data
			ShareQRCallback( response_data )
	    })
	}
}

export function ShareImageDisplay({img, callback}) {
	const closeBtn = useRef()
	const app_wrap = document.getElementById('app-wrap')
	app_wrap.classList.add('modal-active')

	const closeShareImg = (e) => {
		app_wrap.classList.remove('modal-active')
		callback()
	}

	return (
		<div id="share-img-wrap">
			<a className="closer" onClick={closeShareImg}></a>
			<img src={img} alt="Share the visual" />
			<p>Scan this image on a mobile phone to view the visual on your phone</p>
		</div>
	)
}

export function Check4SharedURL(callback) {
	
	function parseSharedData(data){
		if(data.data.length > 0) {
			let visualData = JSON.parse(data.data)
			// Create the Colors again
			for(let vis_i in visualData) {
				const visData = visualData[vis_i]
				if(visData.hasOwnProperty('color')) {
					let clr = visData.color
					visualData[vis_i].displayColor = new THREE.Color(clr.r, clr.g, clr.b)
				}
				// Add to active visuals
				ActiveVisuals[vis_i] = visData
			}
			callback(visualData)
		}
	}

	let sethash = window.location.hash
	let find = 'shared:'
	if(sethash.indexOf(find) != -1) {
		let sharekey = sethash.split(find)[1]
		axios.post(
			apiServerURL + '?req=getshareddata', 
			{key: sharekey},
			{
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			}			
		)		
        .then(response => {
        	// console.log('Check4SharedURL ajax: response', sharekey, response)
        	parseSharedData(response)
        })
	}
}
