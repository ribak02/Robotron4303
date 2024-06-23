class Obstacle {
  constructor(x, y) {
    this.position = createVector(x, y)
    this.size = 30 // Adjust size as needed
    this.score = 5 // Adjust score as needed
    this.color = [112, 30, 51]
    this.hitbox = new Rectangle(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
    this.isExploded = false // State to track if exploded
    this.explosionRadius = 100
    this.explosionTimer = 0
    this.explosionDuration = 30
    this.explosionOver = false
  }

  update() {
    this.hitbox.x = this.position.x - this.size / 2
    this.hitbox.y = this.position.y - this.size / 2

    if (this.isExploded) {
      this.explosionTimer++
      if (this.explosionTimer > this.explosionDuration) {
        // this.isExploded = false // Reset explosion state
        // this.explosionTimer = 0 // Reset timer
        this.explosionOver = true
      }
    }

    this.checkProjectileCollisions()
  }

  draw() {
    if (this.isExploded) {
      // Visual representation of the explosion
      fill(this.color)
      noStroke()
      ellipse(
        this.position.x,
        this.position.y,
        this.explosionRadius * 2,
        this.explosionRadius * 2
      )
    } else {
      // Draw the obstacle itself
      fill(this.color)
      noStroke()
      rect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)
    }
  }

  checkProjectileCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i]
      if (this.hitbox.intersects(projectile.hitbox)) {
        projectiles.splice(i, 1) // Remove the projectile
        this.isExploded = true
        this.explode()
        let scoreIncrement = player.isDoubleScoreActive
          ? this.score * 2
          : this.score
        score += scoreIncrement
      }
    }
  }

  explode() {
    // Loop through all robots to check if they are within the explosion radius
    for (let i = robots.length - 1; i >= 0; i--) {
      let distance = p5.Vector.dist(this.position, robots[i].position)
      if (distance < this.explosionRadius) {
        robots[i].isDestroyed = true // Mark the robot as destroyed
      }
    }
  }
}
