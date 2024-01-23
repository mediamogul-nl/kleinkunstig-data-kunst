
export function gridObj2Array(grid, force100) {
	let gridArray = []

	if(!force100) {
		let gridKeys = Object.keys(grid)
		for(let gk of gridKeys) {
			gridArray.push( grid[gk] )
		}
	} else {
		let maxKeys = 100;
		for(let dayI = 0; dayI < maxKeys; dayI++) {
			let dayVal = (grid && grid.hasOwnProperty(dayI)) ? grid[dayI] : 0
			gridArray.push(dayVal)
		}
	}
	return gridArray;
}

export function GridHelper(grid, force100) {
	// console.log('GridHelper', grid)
	if(!Array.isArray(grid)) {
		grid = gridObj2Array(grid, force100)
	}

	const valMax = Math.max( ...grid )
	const valMin = Math.min( ...grid )

	return {
		gridArray: grid,
		min: valMin,
		max: valMax
	}
}

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
