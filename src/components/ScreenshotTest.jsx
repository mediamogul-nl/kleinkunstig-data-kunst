import { useState, useMemo, useRef, useEffect  } from 'react'

// Ajax stuff
import axios from 'axios';
import {apiServerURL} from './helpers/ServerSettings'


export default function ScreenshotTest() {

	/*                                      __          __ 
	   __________________  ___  ____  _____/ /_  ____  / /_
	  / ___/ ___/ ___/ _ \/ _ \/ __ \/ ___/ __ \/ __ \/ __/
	 (__  ) /__/ /  /  __/  __/ / / (__  ) / / / /_/ / /_  
	/____/\___/_/   \___/\___/_/ /_/____/_/ /_/\____/\__*/

	const testcanvas = useRef()

	function PrepareScreenshot() {
		const crop_coords = {
			canvas_w: 300,
			canvas_h: 300,
			crop_x: 20,
			crop_y: 20,
			crop_w: 200,
			crop_h: 200
		}
		const screenshot = testcanvas.current.toDataURL('image/png')
		console.log(screenshot)
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
        	console.log('posted screenshot data', response)
        });
	}

	function drawOnCanvas() {
		// console.log(testcanvas)
		var context = testcanvas.current.getContext("2d");

		context.textBaseline = "top";
		context.font = " 22px 'Helvetica'";
		// context.fontWeight = 'bold';
		context.fillStyle = '#fff000';
		context.textAlign = 'center';
	    context.fillRect(0, 0, context.canvas.width, context.canvas.height)		
		context.fillStyle = '#000fff';
		context.fillText('Dit is een test texxxxt', 20, 50);
	}
	useEffect(() => {
		drawOnCanvas()
	}, [])

	/*
	
	const zeroRef = useRef()
	const zeroRef2 = useRef()
	const zeroSize = .1
	const zeroGeom = new THREE.BoxGeometry(zeroSize,zeroSize,zeroSize)
	const zeroMat = new THREE.MeshBasicMaterial({color: 0xff0000})
	const zeroBox = <mesh geometry={zeroGeom} position={[0,0,0]} material={zeroMat} ref={zeroRef} />
	const zeroBox2 = <mesh geometry={zeroGeom} position={[0,0,0]} material={zeroMat} ref={zeroRef2} />
	
	*/

	// camera={canvasCamProps}
	return (<>
		<button id="testss-btn" onClick={PrepareScreenshot}>SSS</button>
	    <canvas id="test-canvas" ref={testcanvas}></canvas>
	 	</>
	)
}