import * as THREE from 'three'
import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from 'react'

const modelPath = "/models/dayshapes/cubeZeroed.gltf";

const newVertices2Update = [10,13, 16, 19];

const materialEdges = new THREE.MeshPhongMaterial({
	color: 0x0000ff, 
	wireframe: true
});

const materialCube = new THREE.MeshBasicMaterial({
	color: 0xff0000,
	// wireframe: true,
	transparent: true,
	opacity: 0.5
});


export default function Cube(props) {
	const { nodes } = useGLTF(modelPath);

	let loadedMeshGeom = nodes.CUBE.geometry
	let initPosAttr = loadedMeshGeom.getAttribute( 'position' );

	const vertices2Update = [4,10,16,22,25,28,31,34];
	const upperVertices2Update = [25,28,31,34];




	let cubeH = (props.height) ? props.height : 2;


	// console.log(initPosAttr)

	const updateBoxGeom = () => {
		// loadedMeshGeom.setAttribute('position', initPosAttr);
		// const geomPosAttr2 = loadedMeshGeom.getAttribute( 'position' );
		// console.log('updateBoxGeom', props.height, cubeH, geomPosAttr2.array);
		 
		for(let vI of vertices2Update) {
			if(upperVertices2Update.indexOf(vI) != -1) {
				initPosAttr.array[vI] = cubeH + .1;
			} else {
				initPosAttr.array[vI] = cubeH;				
			}
		}
        loadedMeshGeom.attributes.position.needsUpdate = true;
	}
	// updateBoxGeom();

	return (
		<>
			{/*
	        <mesh
			    geometry={loadedMeshGeom}
			    material={materialCube}
			    position={[0,cubeH,0]}
	        ></mesh>
	        */}
	        <mesh
			    geometry={loadedMeshGeom}
			    material={materialEdges}
			    position={[0, 0.01 ,0]}
	        ></mesh>
	        <mesh
			    geometry={loadedMeshGeom}
			    material={materialCube}
			    position={[0, 0 ,0]}
	        ></mesh>
        </>
	)
}

useGLTF.preload(modelPath);