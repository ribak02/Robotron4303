// Player.js

class Player {
  constructor(x, y) {
    this.size = 20
    this.position = createVector(x, y)
    this.speed = 3
    this.hitbox = new Rectangle(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    )
    this.isInvincible = false
    this.isDoubleScoreActive = false

    this.rescueMessage = ''
    this.rescueMessageTimer = 0
  }

  checkCollisions() {
    for (let robot of robots) {
      if (this.hitbox.intersects(robot.hitbox)) {
        if (!this.isInvincible) {
          console.log('Game over!')
          gameState = 'gameOver'
        }
      }
    }
    for (let i = 0; i < humans.length; i++) {
      let human = humans[i]
      if (this.hitbox.intersects(human.hitbox)) {
        let scoreIncrement = this.isDoubleScoreActive
          ? human.score * 2
          : human.score
        score += scoreIncrement

        // Set the rescue message and start the timer
        this.rescueMessage = `Rescued ${human.constructor.name} +${scoreIncrement} points!`
        this.rescueMessageTimer = 120 // Display for 2 seconds assuming 60 FPS

        humans.splice(i, 1)
        console.log('Score:', score)
      }
    }
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i]
      if (this.hitbox.intersects(obstacle.hitbox)) {
        if (!this.isInvincible) {
          console.log('Game over!')
          gameState = 'gameOver'
        }
      }
    }
  }

  updatePowerUps() {
    // Logic to check for power-up collisions and activate them
    powerUps.forEach((powerUp, index) => {
      if (
        dist(
          this.position.x,
          this.position.y,
          powerUp.position.x,
          powerUp.position.y
        ) <
        this.size / 2 + powerUp.size / 2
      ) {
        powerUp.activate()
        // Remove power-up from the array after activation
        powerUps.splice(index, 1)
      }
    })
  }

  // Properly define the activatePowerUp method
  activatePowerUp(type, duration) {
    if (type === 'invincibility') {
      this.isInvincible = true
      setTimeout(() => {
        this.isInvincible = false
      }, duration)
    } else if (type === 'doubleScore') {
      this.isDoubleScoreActive = true
      setTimeout(() => {
        this.isDoubleScoreActive = false
      }, duration)
    }
    // Any additional logic for showing active power-up messages.
  }

  update() {
    // Update the hitbox position before collision checks
    this.hitbox.x = this.position.x - this.size / 2
    this.hitbox.y = this.position.y - this.size / 2

    if (keyIsDown(65)) this.tryMove(-this.speed, 0)
    if (keyIsDown(68)) this.tryMove(this.speed, 0)
    if (keyIsDown(87)) this.tryMove(0, -this.speed)
    if (keyIsDown(83)) this.tryMove(0, this.speed)

    this.checkCollisions()
    this.updatePowerUps()
  }

  draw() {
    // Draw the player
    fill(255)
    ellipse(this.position.x, this.position.y, this.size, this.size)

    // Display the rescue message if the timer is active
    if (this.rescueMessageTimer > 0) {
      push() // Save current drawing settings
      fill(255, 255, 0) // Yellow color for the message
      textSize(32)
      textAlign(CENTER, CENTER)
      text(this.rescueMessage, width / 2, height / 2)
      pop() // Restore original drawing settings
      this.rescueMessageTimer-- // Decrease the timer
    }
  }

  // Try to move the player if new position is within allowed areas
  tryMove(dx, dy) {
    let newPos = createVector(this.position.x + dx, this.position.y + dy)

    let playerRect = new Rectangle(
      newPos.x - this.size / 2,
      newPos.y - this.size / 2,
      this.size,
      this.size
    )

    // let potentialCollisions = quadTree.query(playerRect)
    let potentialCollisions = quadTree.query(quadTreeBoundary)

    // Filter the potential collisions for walls only
    let wallCollisions = potentialCollisions.filter(
      (obj) => obj.type === 'wall'
    )

    let hasCollision = wallCollisions.some((obstacle) =>
      playerRect.intersects(obstacle.rect)
    )

    // Additionally, check if the new position is within the canvas boundaries
    let withinCanvas =
      newPos.x - this.size / 2 >= 0 &&
      newPos.x + this.size / 2 <= width &&
      newPos.y - this.size / 2 >= 0 &&
      newPos.y + this.size / 2 <= height

    if (!hasCollision && withinCanvas) {
      this.position.set(newPos)
    }
  }

  shoot() {
    // Calculate direction towards the mouse cursor and create a projectile
    let direction = createVector(
      mouseX - this.position.x,
      mouseY - this.position.y
    )
    direction.normalize()
    projectiles.push(
      new Projectile(this.position.x, this.position.y, direction)
    )
  }
}
