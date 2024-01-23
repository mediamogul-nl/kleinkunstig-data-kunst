import * as THREE from 'three'
import { useState, useMemo, useRef, useEffect  } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import { RESPONSIVE_MODE} from './../helpers/VisualsDataExchange'


export default function CameraAnimator({callback}) {
	const [animating, setAnimating]   = useState(false)
	const [activeSide, setActiveSide] = useState('brightside')
	const [move2Q, setMove2Q]         = useState(null)
	const [move2P, setMove2P]         = useState(null)

	const vec = new THREE.Vector3();

	const SideCoords = {
		brightside: {
			position: [-1.5, 12, 12.5],
			q: [0, 0, 0, 1]
		},
		darkside: {
			position: [-3.5, 10.7, 28.5],
			q: [0, 1, 0, 0]
		}
	}

	if(RESPONSIVE_MODE) {
		SideCoords.brightside.position[0] = 0
		SideCoords.darkside.position[0] = -3.4
	}


	// rotation:[0,0,0]  // [0,Math.PI,0] 4 other side 
    const PivotCamera = (props) => {
    	if(props.hasOwnProperty('moveTo')) {
    		if(props.moveTo != activeSide) {
    			let newQ = SideCoords[props.moveTo].q 
    			let newP = SideCoords[props.moveTo].position
    			
    			let setQ = new THREE.Quaternion();
				setQ.x = newQ[0]
				setQ.y = newQ[1]
				setQ.z = newQ[2]
				setQ.w = newQ[3]

    			setActiveSide( props.moveTo )
    			setMove2Q(setQ)
    			setMove2P(newP)
    			setAnimating( true )
    		}
    	}
    }

    const scene_objs = useThree()
    // Give pivot function back to main PhoneTotal
	useEffect(() => {
		callback(PivotCamera, scene_objs)
	}, [callback]);

	const aniFrames = 600

	let lerpVal     = 0
	let lerpIncr    = 1 / aniFrames

	useFrame( (state) => {
		if (animating) {
			lerpVal += lerpIncr
			// console.log(lerpVal,)
			if(lerpVal < 1) {
				state.camera.position.lerp( vec.set(move2P[0], move2P[1], move2P[2]), lerpVal)
				state.camera.quaternion.slerp(move2Q, lerpVal)
			} else {
    			setAnimating( false )
			}
		} 
		return null
	})

	return null;
}
