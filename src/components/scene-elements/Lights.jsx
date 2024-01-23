import {useRef} from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useHelper, Sky } from '@react-three/drei'



export default function Lights() {
	const light = useRef()

    // useHelper(light, THREE.DirectionalLightHelper, 1)

    return <>
        <directionalLight
	        ref={light}
            castShadow
            position={ [ 0, 0, 16 ] }
            intensity={ 1.1 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 20 }
            shadow-camera-top={ 20 }
            shadow-camera-right={ 20 }
            shadow-camera-bottom={ - 20 }
            shadow-camera-left={ - 20 }
        />
        {/*<ambientLight intensity={ 0.3 } />*/}
        {/*<Sky />*/}
   </>
}
