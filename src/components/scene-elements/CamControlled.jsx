import { CameraControls } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, Canvas, useThree } from '@react-three/fiber'

export default function CamControlled({focusObject, customSettings}) {
	// Camera stuff
	const cameraControlsRef = useRef()
	const { camera } = useThree()
	const camControlSettings = {
		enabled: true,
		verticalDragToForward: false,
		minDistance: 5,
		maxDistance: 50,
		dollyToCursor: false,
		infinityDolly: false,
		initPosition: [-1.5, 10.7, 28.5]
	}
	if(customSettings) {
		for(let settingsKey in camControlSettings) {
			if(customSettings.hasOwnProperty(settingsKey)) {
				camControlSettings[settingsKey] = customSettings[settingsKey]
			}
		}
	}
	// https://github.com/yomotsu/camera-controls
	useEffect(() => {
		// console.log(cameraControlsRef.current)
		// cameraControlsRef.current.rotate(15 * DEG2RAD, 0, true)
		if(customSettings) {
			// console.log('Cam controls has customSettings!')
			cameraControlsRef.current.fitToBox(focusObject.current)
		} else {
			// console.log('Cam controls w DEFAULT SETTINGS!')
			
			cameraControlsRef.current.moveTo(-1.5, 10.7, 28.5, true)
			// const init_pos = new THREE.Vector3(-1.5, 0, 0)
			// cameraControlsRef.current.setPosition(init_pos, true);
		}
		
	}, [])

	return <CameraControls
		ref={cameraControlsRef}
		minDistance={camControlSettings.minDistance}
		maxDistance={camControlSettings.maxDistance}
		enabled={camControlSettings.enabled}
		verticalDragToForward={camControlSettings.verticalDragToForward}
		dollyToCursor={camControlSettings.dollyToCursor}
		infinityDolly={camControlSettings.infinityDolly}
	/>
}
