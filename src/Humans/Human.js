class Human {
  constructor(x, y) {
    this.position = createVector(x, y)
    this.velocity = createVector()
    this.maxSpeed = 1.5
    this.size = 20
    this.state = 'Exploring' // Initial state
    this.target = player // Target position
    this.directionChangeCounter = 0 // Counter to change direction
    this.sightRange = 200 // Example range within which the robot can "see" the player
    this.moveOrientation = random([true, false]) // true for X, false for Y
    this.isDestroyed = false
    this.color = (0, 0, 0)
    this.hitbox = new Rectangle(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
  }

  update() {
    this.checkStateTransition()

    if (this.state === 'Exploring') {
      this.avoid()
    } else if (this.state === 'Pursuing') {
      this.seek()
    }

    // Update the hitbox position before collision checks
    this.hitbox.x = this.position.x - this.size / 2
    this.hitbox.y = this.position.y - this.size / 2

    this.checkCollisions()

    // Before adding the velocity to position, check if the next move is valid
    if (this.isNextMoveValid(this.velocity)) {
      this.position.add(this.velocity)
    } else {
      this.velocity.mult(-1) // Reverse direction if next move is not valid
      this.changeDirection() // Optionally, change to a new direction
    }
  }

  avoid() {
    let avoidanceForce = createVector(0, 0)
    let count = 0

    // Loop through the robots array to check for nearby robots
    robots.forEach((robot) => {
      let distance = p5.Vector.dist(this.position, robot.position)
      if (distance < this.sightRange && distance > 0) {
        let diff = p5.Vector.sub(this.position, robot.position)
        diff.normalize().div(distance) // The closer the robot, the stronger the avoidance force
        avoidanceForce.add(diff)
        count++
      }
    })

    if (count > 0) {
      avoidanceForce.div(count)
    }

    // Apply wandering behavior by adding a small random force
    let wanderForce = p5.Vector.random2D()
    wanderForce.mult(0.3) // Adjust the strength of the wandering

    // Combine wander and avoidance forces
    let newVelocity = p5.Vector.add(this.velocity, wanderForce)
    newVelocity.add(avoidanceForce)
    newVelocity.limit(this.maxSpeed)

    // Check if the new velocity results in a valid move before applying
    if (this.isNextMoveValid(newVelocity)) {
      this.velocity = newVelocity
    } else {
      this.changeDirection() // Change direction if the move is not valid
    }
  }

  seek() {
    let desiredVelocity = p5.Vector.sub(
      this.target.position,
      this.position
    ).setMag(this.maxSpeed)
    let newVelocity = p5.Vector.lerp(this.velocity, desiredVelocity, 0.2) // Smooth steering towards the target

    // Check if the new velocity results in a valid move before applying
    if (this.isNextMoveValid(newVelocity)) {
      this.velocity = newVelocity
    } else {
      this.changeDirection() // Change direction if the move is not valid
    }
  }

  checkCollisions() {
    for (let robot of robots) {
      if (this.hitbox.intersects(robot.hitbox)) {
        if (robot instanceof Transformer) {
          this.transformIntoDrone(this)
        }
        if (robot instanceof Terminator) {
          this.isDestroyed = true
        }
      }
    }
  }

  transformIntoDrone(human) {
    // Remove the human from the humans array
    const humanIndex = humans.indexOf(human)
    if (humanIndex > -1) {
      humans.splice(humanIndex, 1)
    }

    // Create a new SuperRobot at the same position
    const newDrone = new Drone(this.position.x, this.position.y, player) // Assuming 'player' is globally accessible

    // Add the new SuperRobot to the robots array
    robots.push(newDrone)
  }

  isNextMoveValid(newVelocity) {
    let newPos = p5.Vector.add(this.position, newVelocity)
    let humanRect = new Rectangle(
      newPos.x - this.size / 2,
      newPos.y - this.size / 2,
      this.size,
      this.size
    )

    // Query the quadtree with the future position rectangle
    let potentialCollisions = quadTree.query(quadTreeBoundary)

    let hasCollision = potentialCollisions.some((obstacle) =>
      humanRect.intersects(obstacle.rect)
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
    triangle(
      this.position.x - this.size / 2,
      this.position.y + this.size / 2,
      this.position.x + this.size / 2,
      this.position.y + this.size / 2,
      this.position.x,
      this.position.y - this.size / 2
    )
  }
}
