let projectiles = []

class Projectile {
  constructor(x, y, direction) {
    this.position = createVector(x, y)
    this.velocity = direction.mult(10)
    this.size = 10
    this.active = true // New attribute to track if the projectile is still active
    this.hitbox = new Rectangle(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
  }

  update() {
    if (!this.active) return // Skip update if the projectile is no longer active

    // Update the hitbox position before collision checks
    this.hitbox.x = this.position.x - this.size / 2
    this.hitbox.y = this.position.y - this.size / 2

    // Move the projectile
    this.position.add(this.velocity)

    // Check for collision with walls
    if (this.checkCollision()) {
      this.active = false // Deactivate the projectile on collision
      return
    }

    // Check if the projectile has left the screen
    if (this.isOffScreen()) {
      this.active = false // Deactivate the projectile
    }
  }

  draw() {
    if (!this.active) return // Only display active projectiles

    // Draw the projectile
    fill(181, 179, 181)
    ellipse(this.position.x, this.position.y, this.size, this.size)
  }

  isOffScreen() {
    return (
      this.position.x < 0 ||
      this.position.x > width ||
      this.position.y < 0 ||
      this.position.y > height
    )
  }

  checkCollision() {
    let potentialCollisions = quadTree.query(quadTreeBoundary)

    // Filter for collisions with objects of type 'wall' only
    let wallCollisions = potentialCollisions.filter(
      (obj) => obj.type === 'wall'
    )

    return wallCollisions.some((wall) => this.hitbox.intersects(wall.rect))
  }
}
