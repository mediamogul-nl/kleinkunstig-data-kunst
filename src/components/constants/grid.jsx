/*             _     __
   ____ ______(_)___/ /
  / __ `/ ___/ / __  / 
 / /_/ / /  / / /_/ /  
 \__, /_/  /_/\__,_/   
/____/  settings*/

export const gridSize = 100

// Points per day block
export const pointsBlock = 100
export const pointsSide = Math.sqrt(pointsBlock)
// Vertex width of Border around the full grid
export const borderWidth = 1
export const borderSize = borderWidth * 2;
// How many blocks to place
export const numBlocks = 100;
// Blocks per row
export const blocksPerRow = Math.sqrt(numBlocks)

export const pointsRowNetto = (blocksPerRow * pointsSide)
export const pointsRowBruto = pointsRowNetto  + borderSize
