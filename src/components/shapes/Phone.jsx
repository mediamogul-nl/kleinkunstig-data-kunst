import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useRef  } from 'react'
import { useFrame } from '@react-three/fiber'

import {phoneBaseMat} from './../materials/ProjectMaterials'

const phoneModelPath = "/models/phone/phoneBack.gltf";

THREE.ColorManagement.legacyMode = false


export function PhoneBackBase({setRef}) {

	const { nodes } = useGLTF(phoneModelPath);

	let phoneBase = nodes.phoneBack.geometry

	let phoneRot = [Math.PI * -0.5, 0, 0 ]

	return (
		<group name="PhoneBackBase" position={[0,0,-1.05]} ref={setRef} rotation={phoneRot} scale={[1,1,1]}>
	        <mesh
	        	receiveShadow
		        name="phoneBackMesh"
			    geometry={phoneBase}
			    material={phoneBaseMat}
	        ></mesh>
		</group>
	)
}

const matTTblack = new THREE.MeshBasicMaterial({color: 0x000000 });
const matTTred = new THREE.MeshBasicMaterial({color: 0xff004f });
const matTTblue = new THREE.MeshBasicMaterial({color: 0x00f6ee });

export function TikTokLogo() {

	const { nodes } = useGLTF(phoneModelPath);

	let tiktokBlack = nodes.TT_BLACK.geometry
	let tiktokRed = nodes.TT_RED.geometry
	let tiktokBlue = nodes.TT_BLUE.geometry

	const logoGroup = useRef()

	const [speed] = useState(() => (Math.random() + .2) * ( Math.random() < .5 ? -1 : 1 )  ) 

	useFrame((state) => {
		const time = state.clock.getElapsedTime()
		let rotationX = Math.sin(time * 4);
		logoGroup.current.rotation.y = rotationX / 10;// rotation
	})

	const logoScale = .7

	return (
		<group ref={logoGroup} castShadow name="tiktokLogo" scale={[logoScale,logoScale,logoScale]} rotation-z={Math.PI * -1} position={[0,1.1,2]}>
	        <mesh
		        name="ttblack"
			    geometry={tiktokBlack}
			    material={matTTblack}
			    position={[0,0,1]}
	        ></mesh>
	        <mesh
		        name="ttred"
			    geometry={tiktokRed}
			    material={matTTred}
			    position={[0,.2,1]}
	        ></mesh>
	        <mesh
		        name="ttblue"
			    geometry={tiktokBlue}
			    material={matTTblue}
			    position={[0,.2,1]}
	        ></mesh>
		</group>
	)
}
/*
ICON_creator
ICON_delete
ICON_edit
ICON_info
*/
export function UXIconEdit() {
	const { nodes } = useGLTF(phoneModelPath);
	const editBtnGeom =  nodes.ICON_edit.geometry
	return editBtnGeom
}
export function UXIconInfo() {
	const { nodes } = useGLTF(phoneModelPath);
	const infoBtnGeom =  nodes.ICON_info.geometry
	return infoBtnGeom
}
export function UXIconDelete() {
	const { nodes } = useGLTF(phoneModelPath);
	const deleteBtnGeom =  nodes.ICON_delete.geometry
	return deleteBtnGeom
}
export function UXIconMove() {
	const { nodes } = useGLTF(phoneModelPath);
	const moveBtnGeom =  nodes.ICON_move.geometry
	return moveBtnGeom
}
export function UXIconScaleUp() {
	const { nodes } = useGLTF(phoneModelPath);
	const scaleUpBtnGeom =  nodes.ICON_scale_up.geometry
	return scaleUpBtnGeom
}
export function UXIconScaleDown() {
	const { nodes } = useGLTF(phoneModelPath);
	const scaleDownBtnGeom =  nodes.ICON_scale_down.geometry
	return scaleDownBtnGeom
}
export function UXIconCreator() {
	const { nodes } = useGLTF(phoneModelPath);
	const creatorBtnGeom =  nodes.ICON_creator.geometry
	return creatorBtnGeom
}
export function GeomSkull() {
	const { nodes } = useGLTF(phoneModelPath);
	const creatorBtnGeom =  nodes.skull.geometry
	return creatorBtnGeom
}
export function BigShapeGeom(shape) {
	console.log('shape to get: ', shape)
	const { nodes } = useGLTF(phoneModelPath);
	if(!nodes.hasOwnProperty(shape)) { 
		shape = 'flower' 
	}
	const geom =  nodes[shape].geometry
	return geom
	// flower / brilliant / heart / rose / skull
}
export function PhoneBackGeom(shape) {
	const { nodes } = useGLTF(phoneModelPath);
	const geom = nodes.phoneBack.geometry
	return geom
}


useGLTF.preload(phoneModelPath);
