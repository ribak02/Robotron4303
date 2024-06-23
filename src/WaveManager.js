let robots = []
let humans = []
let obstacles = []
let powerUps = []

class WaveManager {
  constructor() {
    this.currentWave = 0
    // this.robots = [] // Active robots
    this.spawnLocations = [] // Potential spawn locations
    this.player = null // Reference to the player object
  }

  setup(player, spawnLocations) {
    this.player = player
    this.spawnLocations = spawnLocations
  }

  clearEntities() {
    // Clear the arrays
    robots = []
    humans = []
    obstacles = []

    // Rebuild the QuadTree to clear previous entities
    this.rebuildQuadTree()
  }

  startWave() {
    // Clear existing entities before starting a new wave
    this.clearEntities()

    this.currentWave++
    let numberOfRobots = this.calculateNumberOfRobots()

    // Spawn obstacles
    rooms.forEach((room) => {
      // Generate obstacles inside the room
      let numberOfObstacles = 1 // Or any other logic to determine the number of obstacles
      for (let i = 0; i < numberOfObstacles; i++) {
        let obstacleX = random(room.x + 50, room.x + room.width - 50) // 50 pixels padding from room boundaries
        let obstacleY = random(room.y + 50, room.y + room.height - 50)
        let obstacle = new Obstacle(obstacleX, obstacleY)
        obstacles.push(obstacle)

        // Re-insert the new obstacle into the quadtree
        quadTree.insert({ type: 'obstacle', rect: obstacle.hitbox })
      }
    })

    // Spawn basic robots
    for (let i = 0; i < numberOfRobots; i++) {
      let spawnLocation = this.getRandomSpawnLocation()
      let robot = new Robot(spawnLocation.x, spawnLocation.y, this.player)
      robots.push(robot)
    }

    // Spawn terminators
    for (let i = 0; i < this.currentWave; i++) {
      let spawnLocation = this.getRandomSpawnLocation()
      let terminator = new Terminator(spawnLocation.x, spawnLocation.y, humans)
      robots.push(terminator)
    }

    // Spawn transformers
    for (let i = 0; i < this.currentWave - 1; i++) {
      let spawnLocation = this.getRandomSpawnLocation()
      let transformer = new Transformer(
        spawnLocation.x,
        spawnLocation.y,
        humans
      )
      robots.push(transformer)
    }

    // Spawn Drones
    for (let i = 0; i < this.currentWave; i++) {
      let spawnLocation = this.getRandomSpawnLocation()
      let drone = new Drone(spawnLocation.x, spawnLocation.y, this.player)
      robots.push(drone)
    }

    // Spawn humans
    let spawnLocation = rooms[rooms.length - 3]
    let mother = new Mother(
      spawnLocation.x + 100,
      spawnLocation.y + 100,
      this.player
    )
    spawnLocation = rooms[rooms.length - 2]
    let father = new Father(
      spawnLocation.x + 100,
      spawnLocation.y + 100,
      this.player
    )
    spawnLocation = rooms[rooms.length - 1]
    let child = new Child(
      spawnLocation.x + 100,
      spawnLocation.y + 100,
      this.player
    )

    humans.push(mother)
    humans.push(father)
    humans.push(child)

    // Spawn powerups
    let powerUpChance = 0.4 + 0.1 * (this.currentWave - 1) // Starting at 10%, increasing by 5% per wave
    if (Math.random() < powerUpChance) {
      // If passed the chance check, decide on the power-up type
      let powerUpType = Math.random() < 0.5 ? 'invincibility' : 'doubleScore'
      let spawnLocation = this.getRandomSpawnLocation()

      // Spawn the power-up
      let newPowerUp = new PowerUp(
        spawnLocation.x,
        spawnLocation.y,
        powerUpType
      )
      powerUps.push(newPowerUp)
    }

    console.log(
      `Wave ${this.currentWave} started with ${numberOfRobots} robots.`
    )
  }

  calculateNumberOfRobots() {
    // Simple logic to increase the number of robots with each wave
    // You can replace this with any logic you prefer
    return 5 + (this.currentWave - 1) * 2
  }

  // Check if the location is clear and not too close to the player
  isLocationClear(x, y, entitySize = 20) {
    const buffer = entitySize / 2 // Half of entity size to create a buffer
    const playerBuffer = 300 // Minimum distance from the player

    // Check for collision with obstacles
    for (let obstacle of obstacles) {
      let spawnHitbox = new Rectangle(
        x - buffer,
        y - buffer,
        entitySize,
        entitySize
      )
      if (obstacle.hitbox.intersects(spawnHitbox)) {
        return false // Overlaps with an obstacle
      }
    }

    // Check distance from the player
    let distanceToPlayer = dist(
      x,
      y,
      this.player.position.x,
      this.player.position.y
    )
    if (distanceToPlayer < playerBuffer) {
      return false // Too close to the player
    }

    return true // Location is clear and not too close to the player
  }

  getRandomSpawnLocation(retryLimit = 10) {
    if (retryLimit === 0) return null // or a default safe location

    let index = Math.floor(Math.random() * this.spawnLocations.length)
    let spawnLocation = this.spawnLocations[index]

    if (this.isLocationClear(spawnLocation.x, spawnLocation.y)) {
      return spawnLocation
    } else {
      return this.getRandomSpawnLocation(retryLimit - 1)
    }
  }

  update() {
    // Update all robots
    for (let i = robots.length - 1; i >= 0; i--) {
      let robot = robots[i]
      robot.update()

      if (robot.isDestroyed) {
        robots.splice(i, 1)
      }
    }
    // Update all humans
    for (let i = 0; i < humans.length; i++) {
      let human = humans[i]
      human.update()

      if (human.isDestroyed) {
        humans.splice(i, 1)
      }
    }

    // Update all obstacles
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i]
      obstacle.update()

      if (obstacle.explosionOver) {
        obstacles.splice(i, 1)
        this.rebuildQuadTree()
      }
    }

    // Update all power-ups
    powerUps.forEach((powerUp) => {
      powerUp.update()
    })

    // Check if all robots are destroyed to start next wave
    if (robots.length === 0) {
      this.startWave()
    }
  }

  rebuildQuadTree() {
    // Initialize a new QuadTree with the same boundary and capacity
    quadTree = new QuadTree(quadTreeBoundary, 4)

    // Re-insert walls
    walls.forEach((wall) => {
      quadTree.insert({ type: 'wall', rect: wall })
    })

    // Re-insert active obstacles
    obstacles.forEach((obstacle) => {
      quadTree.insert({ type: 'obstacle', rect: obstacle.hitbox })
    })
  }

  draw() {
    // Draw all robots
    for (let robot of robots) {
      robot.draw()
    }

    // Draw all humans
    for (let i = 0; i < humans.length; i++) {
      let human = humans[i]
      human.draw()
    }

    // Draw all obstacles
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i]
      obstacle.draw()
    }

    // Draw all power-ups
    powerUps.forEach((powerUp) => {
      powerUp.draw()
    })
  }
}
