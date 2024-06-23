let levelColor = 120
let levelBackgroundColor = 20

let corridors = []
let rooms = []
let grid = []
let walls = []

class Node {
  constructor(x, y, width, height, depth = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.left = null
    this.right = null
    this.room = null // Room will be added later
    this.depth = depth
  }

  // Check if the node is a leaf (has no children)
  isLeaf() {
    return !this.left && !this.right
  }

  // A method to divide the node
  divide(minSize) {
    if (this.left || this.right) {
      return false // Already divided
    }

    // Decide direction of split
    let vertical = random() > 0.5

    // If width is much larger than height, we split vertically
    // If height is much larger than width, we split horizontally
    // Otherwise, we split randomly
    if (this.width > this.height && this.width / this.height >= 1.25) {
      vertical = true
    } else if (this.height > this.width && this.height / this.width >= 1.25) {
      vertical = false
    }

    let max = (vertical ? this.width : this.height) - minSize
    if (max <= minSize) {
      return false // Area too small to split
    }

    let split = Math.floor(random(minSize, max) / gridCellSize) * gridCellSize

    if (vertical) {
      // Vertical division
      this.left = new Node(this.x, this.y, split, this.height, this.depth + 1)
      this.right = new Node(
        this.x + split,
        this.y,
        this.width - split,
        this.height,
        this.depth + 1
      )
    } else {
      // Horizontal division
      this.left = new Node(this.x, this.y, this.width, split, this.depth + 1)
      this.right = new Node(
        this.x,
        this.y + split,
        this.width,
        this.height - split,
        this.depth + 1
      )
    }

    return true
  }
  // Method to calculate the aggregate center of all rooms under this node
  getAggregateCenter() {
    // Base case for leaf nodes: Return the center of the room
    if (this.isLeaf() && this.room) {
      return this.room.getCenter()
    }

    let totalX = 0
    let totalY = 0
    let count = 0

    // Recursive case: Accumulate centers from all child nodes
    if (this.left) {
      const leftCenter = this.left.getAggregateCenter()
      if (leftCenter) {
        totalX += leftCenter.x
        totalY += leftCenter.y
        count++
      }
    }
    if (this.right) {
      const rightCenter = this.right.getAggregateCenter()
      if (rightCenter) {
        totalX += rightCenter.x
        totalY += rightCenter.y
        count++
      }
    }

    // If there are no children with rooms (shouldn't happen in a well-formed tree), return null
    if (count === 0) return null

    // Calculate the average center point
    return createVector(totalX / count, totalY / count)
  }
}

function generateLevel(x, y, width, height, minSize, maxSize, maxDepth) {
  let root = new Node(x, y, width, height)
  let nodesToDivide = [root]

  while (nodesToDivide.length > 0) {
    let node = nodesToDivide.pop()
    if (node.depth < maxDepth && node.divide(minSize)) {
      nodesToDivide.push(node.left)
      nodesToDivide.push(node.right)
    }
  }

  // Add rooms to the leaf nodes of the BSP tree
  addRoomsToLeaves(root, minSize, maxSize, gridCellSize)

  // Connect the rooms with corridors
  corridors = connectRooms(root)

  for (let y = 0; y < height; y += gridCellSize) {
    // Initialize a new sub-array if it does not exist
    let yIndex = y / gridCellSize
    if (!grid[yIndex]) {
      grid[yIndex] = []
    }

    for (let x = 0; x < width; x += gridCellSize) {
      // Initialize grid as fully blocked (1 for walls, 0 for empty space)
      let xIndex = x / gridCellSize
      grid[yIndex][xIndex] = 1
    }
  }

  // Mark the rooms and corridors in the grid as empty (navigable) space
  rooms.forEach((room) => {
    for (let y = room.y; y < room.y + room.height; y += gridCellSize) {
      for (let x = room.x; x < room.x + room.width; x += gridCellSize) {
        grid[y / gridCellSize][x / gridCellSize] = 0
      }
    }
  })

  corridors.forEach((corridor) => {
    corridor.path.forEach((cell) => {
      grid[cell.y / gridCellSize][cell.x / gridCellSize] = 0
    })
  })

  // Now, the grid has 1s for walls and 0s for empty space
  // Create wall rectangles from the grid and insert into the Quadtree
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 1) {
        // It's a wall
        let wallRect = new Rectangle(
          x * gridCellSize,
          y * gridCellSize,
          gridCellSize,
          gridCellSize
        )
        quadTree.insert({ type: 'wall', rect: wallRect })
        walls.push(wallRect)
      }
    }
  }

  return root
}

function addRoomsToLeaves(node, minRoomSize, maxRoomSize) {
  if (!node) return

  if (!node.left && !node.right) {
    // Ensure that the room's dimensions and positions are aligned with the grid
    let roomWidth =
      Math.floor(
        random(minRoomSize, Math.min(maxRoomSize, node.width)) / gridCellSize
      ) * gridCellSize
    let roomHeight =
      Math.floor(
        random(minRoomSize, Math.min(maxRoomSize, node.height)) / gridCellSize
      ) * gridCellSize
    let roomX =
      Math.floor(
        random(node.x, node.x + node.width - roomWidth) / gridCellSize
      ) * gridCellSize
    let roomY =
      Math.floor(
        random(node.y, node.y + node.height - roomHeight) / gridCellSize
      ) * gridCellSize

    // Align the room within the node's boundaries if it goes out of bounds
    roomX = Math.max(node.x, roomX)
    roomY = Math.max(node.y, roomY)
    let maxX = node.x + node.width - roomWidth
    let maxY = node.y + node.height - roomHeight
    roomX = Math.min(maxX, roomX)
    roomY = Math.min(maxY, roomY)

    node.room = new Room(roomX, roomY, roomWidth, roomHeight)

    // Add the room as a Rectangle to the rooms array for Quadtree insertion
    rooms.push(new Rectangle(roomX, roomY, roomWidth, roomHeight))
  } else {
    addRoomsToLeaves(node.left, minRoomSize, maxRoomSize)
    addRoomsToLeaves(node.right, minRoomSize, maxRoomSize)
  }
}

function connectRooms(node) {
  if (!node || node.isLeaf()) return []

  const corridors = []
  if (node.left && node.right) {
    const leftCenter = node.left.getAggregateCenter() // Ensure this method calculates grid-aligned center
    const rightCenter = node.right.getAggregateCenter() // Ensure this method calculates grid-aligned center

    if (leftCenter && rightCenter) {
      // Calculate start and end points aligned to the grid
      const startX = Math.floor(leftCenter.x / gridCellSize) * gridCellSize
      const startY = Math.floor(leftCenter.y / gridCellSize) * gridCellSize
      const endX = Math.floor(rightCenter.x / gridCellSize) * gridCellSize
      const endY = Math.floor(rightCenter.y / gridCellSize) * gridCellSize

      // Create and store the corridor
      corridors.push(new Corridor(startX, startY, endX, endY, gridCellSize))
    }

    // Recursively connect children and accumulate corridors
    corridors.push(...connectRooms(node.left))
    corridors.push(...connectRooms(node.right))
  }

  return corridors
}

function convertCorridorToRectangles(corridor) {
  let rectangles = []
  corridor.path.forEach((cell) => {
    rectangles.push(
      new Rectangle(
        cell.x,
        cell.y,
        corridor.gridCellSize,
        corridor.gridCellSize
      )
    )
  })
  return rectangles
}

function drawGridBackground() {
  stroke(levelColor) // Light grey for the grid lines
  for (let x = 0; x < width; x += gridCellSize) {
    for (let y = 0; y < height; y += gridCellSize) {
      fill(levelBackgroundColor) // White for the background cells
      rect(x, y, gridCellSize, gridCellSize)
    }
  }
}

function drawLevel(root) {
  // Draw the grid background first to have outlines around each cell
  drawGridBackground()

  // Draw all rooms
  drawRooms(root)

  // Now, draw corridors as part of the level drawing
  corridors.forEach((corridor) => corridor.draw())
}

function drawRooms(node) {
  if (!node) {
    return
  }
  if (node.room) {
    node.room.draw()
  } else {
    drawRooms(node.left)
    drawRooms(node.right)
  }
}

function drawDebug() {
  // Draw non-navigable areas in red
  fill(255, 0, 0, 50) // Semi-transparent red
  quadTree.query(quadTreeBoundary).forEach((blockedArea) => {
    rect(blockedArea.x, blockedArea.y, blockedArea.width, blockedArea.height)
  })
}

function printBspTree(node, depth = 0, prefix = 'Root:') {
  if (!node) {
    return
  }

  // Indentation based on the depth in the tree
  let indent = '  '.repeat(depth)

  // Print the current node
  console.log(
    `${indent}${prefix} [${node.x}, ${node.y}, ${node.width}, ${node.height}] Depth: ${depth}`
  )

  // Recursively print the left child
  if (node.left) {
    printBspTree(node.left, depth + 1, 'L:')
  }

  // Recursively print the right child
  if (node.right) {
    printBspTree(node.right, depth + 1, 'R:')
  }
}
