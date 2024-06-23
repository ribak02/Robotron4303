class Room {
  constructor(x, y, width, height) {
    // Align the room's position to the grid
    this.x = Math.floor(x / gridCellSize) * gridCellSize
    this.y = Math.floor(y / gridCellSize) * gridCellSize
    // Ensure the room's dimensions are a multiple of gridCellSize
    this.width = Math.floor(width / gridCellSize) * gridCellSize
    this.height = Math.floor(height / gridCellSize) * gridCellSize
  }

  // Method to draw the room on the canvas
  draw() {
    noStroke() // Rooms will not have an outline stroke
    fill(levelColor) // Let's choose a dark gray color for the room
    rect(this.x, this.y, this.width, this.height) // Draw the rectangle representing the room
  }

  // Returns the center point of the room, useful for connecting corridors
  getCenter() {
    return createVector(this.x + this.width / 2, this.y + this.height / 2)
  }

  // A utility function to check if a point is within the room - useful for collision detection, etc.
  contains(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    )
  }

  // Additional methods as needed...
}
