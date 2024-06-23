class Robot {
  constructor(x, y, target = null) {
    this.position = createVector(x, y)
    this.velocity = createVector()
    this.maxSpeed = 1.5
    this.size = 20
    this.state = 'Exploring' // Initial state
    this.target = target // Target position
    this.directionChangeCounter = 0 // Counter to change direction
    this.moveOrientation = random([true, false]) // true for X, false for Y
    this.isDestroyed = false
    this.sightRange = 200 // Example range within which the robot can "see" the player
    this.hitbox = new Rectangle(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
    this.score = 10
    this.color = [200, 0, 0]
  }

  update() {
    this.checkStateTransition()

    if (this.state === 'Exploring') {
      this.wander()
    } else if (this.state === 'Pursuing') {
      this.seek()
    }

    // Update the hitbox position before collision checks
    this.hitbox.x = this.position.x - this.size / 2
    this.hitbox.y = this.position.y - this.size / 2

    this.checkProjectileCollisions()

    // Before adding the velocity to position, check if the next move is valid
    if (this.isNextMoveValid()) {
      this.position.add(this.velocity)
    } else {
      this.velocity.mult(-1) // Reverse direction if next move is not valid
      this.changeDirection() // Optionally, change to a new direction
    }
  }

  wander() {
    if (this.directionChangeCounter <= 0) {
      this.changeDirection()
    } else {
      this.directionChangeCounter--
    }
  }

  seek() {
    // Implement seeking logic here
    let desiredVelocity = p5.Vector.sub(
      this.target.position,
      this.position
    ).setMag(this.maxSpeed)
    this.velocity = p5.Vector.lerp(this.velocity, desiredVelocity, 0.2) // Smooth steering towards the target
  }

  checkProjectileCollisions() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i]
      if (this.hitbox.intersects(projectile.hitbox)) {
        projectiles.splice(i, 1) // Remove the projectile
        this.isDestroyed = true
        let scoreIncrement = player.isDoubleScoreActive
          ? this.score * 2
          : this.score
        score += scoreIncrement
      }
    }
  }

  isNextMoveValid() {
    let newPos = p5.Vector.add(this.position, this.velocity)
    let robotRect = new Rectangle(
      newPos.x - this.size / 2,
      newPos.y - this.size / 2,
      this.size,
      this.size
    )

    // Query the quadtree with the future position rectangle
    let potentialCollisions = quadTree.query(quadTreeBoundary)

    let hasCollision = potentialCollisions.some((obstacle) =>
      robotRect.intersects(obstacle.rect)
    )

    // Additionally, check if the new position is within the canvas boundaries
    let withinCanvas =
      newPos.x - this.size / 2 >= 0 &&
      newPos.x + this.size / 2 <= width &&
      newPos.y - this.size / 2 >= 0 &&
      newPos.y + this.size / 2 <= height

    // If there are no potential collisions, the move is valid
    return !hasCollision && withinCanvas
  }

  changeDirection() {
    // Change direction logic
    // For simplicity, randomly choose a new direction
    this.velocity = p5.Vector.random2D().mult(this.maxSpeed)
    this.directionChangeCounter = random(30, 120) // Change direction after a random number of frames
  }

  checkStateTransition() {
    // Determine if the robot can "see" the target
    if (this.canSeeTarget()) {
      this.state = 'Pursuing'
    } else {
      this.state = 'Exploring'
    }
  }

  canSeeTarget() {
    // Calculate the distance to the player
    let distance = p5.Vector.dist(this.position, this.target.position)

    // Check if the player is within sight range
    if (distance <= this.sightRange) {
      return true
    }
    return false
  }

  draw() {
    // Visual representation of the robot
    fill(this.color)
    rect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)
  }
}
