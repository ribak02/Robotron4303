class Corridor {
  constructor(startX, startY, endX, endY, gridCellSize) {
    this.startX = startX
    this.startY = startY
    this.endX = endX
    this.endY = endY
    this.gridCellSize = gridCellSize
    this.path = this.calculatePath() // Array of grid cells that make up the corridor
  }

  // Calculates a path from start to end, filling cells in a straight line
  calculatePath() {
    const path = []
    let x = this.startX
    let y = this.startY

    // Determine the direction for horizontal and vertical movement
    const xStep = x < this.endX ? this.gridCellSize : -this.gridCellSize
    const yStep = y < this.endY ? this.gridCellSize : -this.gridCellSize

    // Move horizontally until x aligns with endX
    while (x !== this.endX) {
      path.push({ x: x, y: y })
      x += xStep
    }

    // Move vertically until y aligns with endY
    while (y !== this.endY) {
      path.push({ x: x, y: y })
      y += yStep
    }

    return path
  }

  // Draw the corridor on the canvas as filled grid cells
  draw() {
    noStroke()
    fill(levelColor) // Color for corridors
    this.path.forEach((cell) => {
      rect(cell.x, cell.y, this.gridCellSize, this.gridCellSize)
    })
  }
}
