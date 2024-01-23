import * as THREE from 'three'
THREE.ColorManagement.legacyMode = false

export const diamondEdgeMaterial = new THREE.MeshBasicMaterial({
	color: 0xffffff, 
	// flatShading: true,
	transparent: true,
	opacity: 0,
	wireframe: true
});
export const diamondMaterial = new THREE.MeshStandardMaterial({
	color: 0x00ff00, 
	flatShading: true,
	// transparent: true,
	// opacity: .8
	// wireframe: true
});
export const transparentMat = new THREE.MeshBasicMaterial({
	transparent: true,
	opacity: 0
});

export const textMaterial = new THREE.MeshPhongMaterial ({ 
	color: 0xffffff
})
export const textMaterialDark = new THREE.MeshBasicMaterial({ 
	color: 0x000000
})
export const tagTextMaterial = new THREE.MeshNormalMaterial({color: 0xcccccc})

export const phoneBaseMat1 = new THREE.MeshBasicMaterial({
	color: 0x2d2d2d, 
	// doubleSide: true,
	// flatShading: true
	// metalness: 0.4,
	// roughness: 0.9,
});
export const phoneBaseMat = new THREE.MeshStandardMaterial({ 
	color: 0x2d2d2d, 
	flatShading: true,
	metalness: 0.4,
	roughness: 0.9,
})

export const popSocketMat = new THREE.MeshStandardMaterial({ 
	color: 0x4d4d4d, 
	flatShading: true,
	metalness: 0.4,
	roughness: 0.9,
})