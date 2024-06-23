class Drone extends Robot {
  constructor(x, y, player) {
    super(x, y, player)
    this.score = 50
    this.grid = grid
    this.humans = humans
    this.color = [252, 3, 194]
    this.maxSpeed = 3
    this.size = 15
    this.player = player
    this.sightRange = 400
    this.currentPath = [] // To store the path
    this.currentWaypointIndex = 0 // To keep track of the current waypoint in the path
    this.reachedEnd = false // To check if the end of the path is reached
    this.playerProximityThreshold = 100 // Distance threshold to trigger path update
    this.pathUpdateInterval = 30 // How often to update the path (in frames)
    this.lastTargetPosition = this.convertToGridPos(player.position) // Store the last target grid position

    // Update the hitbox to reflect the new size
    this.hitbox.width = this.size
    this.hitbox.height = this.size
  }

  // Call this method to update the drone's path towards the player
  updatePath() {
    const targetGridPos = this.convertToGridPos(this.player.position) // Convert player's position to grid position
    const droneGridPos = this.convertToGridPos(this.position) // Convert drone's position to grid position
    this.currentPath = this.findPath(droneGridPos, targetGridPos) // Find path to player
    this.currentWaypointIndex = 0 // Reset the waypoint index
  }

  // Convert a position to its corresponding grid position
  convertToGridPos(position) {
    return {
      x: Math.floor(position.x / gridCellSize),
      y: Math.floor(position.y / gridCellSize),
    }
  }

  // Convert a grid position back to world/level coordinates
  convertToLevelPos(gridPos) {
    return createVector(
      gridPos.x * gridCellSize + gridCellSize / 2,
      gridPos.y * gridCellSize + gridCellSize / 2
    )
  }

  followPath() {
    if (this.currentPath.length === 0 || this.reachedEnd) return

    let currentWaypoint = this.currentPath[this.currentWaypointIndex]
    let waypointPos = this.convertToLevelPos(currentWaypoint)
    let distanceToWaypoint = p5.Vector.dist(this.position, waypointPos)

    // Check if on final waypoint
    if (this.currentWaypointIndex >= this.currentPath.length - 1) {
      let currentWaypoint = this.currentPath[this.currentWaypointIndex]
      let waypointPos = this.convertToLevelPos(currentWaypoint)
      let distanceToPlayer = p5.Vector.dist(this.position, this.player.position)

      // If within final approach distance, adjust maxSpeed and steer directly towards the player
      if (distanceToPlayer <= this.playerProximityThreshold) {
        let desiredVelocity = p5.Vector.sub(
          this.player.position,
          this.position
        ).setMag(this.maxSpeed)
        this.position.add(desiredVelocity)
        return
      }
    }

    // Pathfinding
    if (distanceToWaypoint < this.maxSpeed) {
      // If close to the current waypoint, move to the next
      this.currentWaypointIndex++
      if (this.currentWaypointIndex >= this.currentPath.length) {
        this.reachedEnd = true // Reached the target
        return
      }
      currentWaypoint = this.currentPath[this.currentWaypointIndex]
      waypointPos = this.convertToLevelPos(currentWaypoint)
    }

    let desiredVelocity = p5.Vector.sub(waypointPos, this.position).setMag(
      this.maxSpeed
    )
    this.position.add(desiredVelocity)
  }

  // Override the update method
  update() {
    // Update the hitbox position before collision checks
    this.hitbox.x = this.position.x - this.size / 2
    this.hitbox.y = this.position.y - this.size / 2

    super.checkProjectileCollisions()

    if (frameCount % 60 === 0) {
      // Update path every second as an example
      this.updatePath()
      this.reachedEnd = false // Reset the reachedEnd flag whenever a new path is calculated
    }
    this.followPath()
  }

  heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  findPath(start, end) {
    let openSet = []
    let closedSet = []
    let startNode = new Node(start.x, start.y)
    let endNode = new Node(end.x, end.y)
    openSet.push(startNode)

    while (openSet.length > 0) {
      let lowestIndex = 0
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i
        }
      }

      let current = openSet[lowestIndex]
      if (current.x === endNode.x && current.y === endNode.y) {
        // Path has been found
        let temp = current
        let path = []
        while (temp.parent) {
          path.push(temp)
          temp = temp.parent
        }
        return path.reverse() // Reverse the path to get the correct order
      }

      openSet.splice(lowestIndex, 1)
      closedSet.push(current)

      let neighbors = this.getNeighbors(current)
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i]
        if (
          closedSet.findIndex(
            (n) => n.x === neighbor.x && n.y === neighbor.y
          ) !== -1 ||
          this.grid[neighbor.y][neighbor.x] === 1
        ) {
          continue // Not a valid neighbor
        }

        let gScore = current.g + 1 // 1 is the distance from a node to its neighbor
        let gScoreIsBest = false

        if (
          openSet.findIndex((n) => n.x === neighbor.x && n.y === neighbor.y) ===
          -1
        ) {
          gScoreIsBest = true
          neighbor.h = this.heuristic(neighbor, endNode)
          openSet.push(neighbor)
        } else if (gScore < neighbor.g) {
          gScoreIsBest = true
        }

        if (gScoreIsBest) {
          neighbor.parent = current
          neighbor.g = gScore
          neighbor.f = neighbor.g + neighbor.h
        }
      }
    }

    return [] // No path found
  }

  getNeighbors(node) {
    let neighbors = []
    let dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]
    for (let dir of dirs) {
      let x = node.x + dir[0]
      let y = node.y + dir[1]
      if (
        x >= 0 &&
        x < this.grid[0].length &&
        y >= 0 &&
        y < this.grid.length &&
        this.grid[y][x] !== 1
      ) {
        neighbors.push(new Node(x, y))
      }
    }
    return neighbors
  }
}
