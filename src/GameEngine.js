let player
let level
let gridCellSize = 100
let quadTree
let quadTreeBoundary
let waveManager
let gameState = 'startScreen'
let score = 0
let gameOverTime = 0 // This will store the time when the game over state was set

function setup() {
  createCanvas(1200, 900)
}

function setupGameElements() {
  // Initialize the quadtree for collision detection
  quadTreeBoundary = new Rectangle(0, 0, width, height)
  quadTree = new QuadTree(quadTreeBoundary, 4) // Adjust capacity as needed

  // Initialize the level
  let minRoomSize = gridCellSize * 3
  let maxRoomSize = gridCellSize * 10
  let maxDepth = 3 // Maximum depth of the BSP tree
  level = generateLevel(0, 0, width, height, minRoomSize, maxRoomSize, maxDepth)
  console.log(grid)

  // Initialize the WaveManager and setup with player and spawn locations
  waveManager = new WaveManager()

  // Initialize the player in center of random room
  let spawnroom = rooms[0]
  player = new Player(
    spawnroom.x + spawnroom.width / 2,
    spawnroom.y + spawnroom.height / 2
  )

  let spawnLocations = []
  rooms.slice(1).forEach((room) => {
    // Calculate the safe area inside the room, taking into account a 50 pixels margin
    const safeXStart = room.x + 50
    const safeYStart = room.y + 50
    const safeXEnd = room.x + room.width - 50
    const safeYEnd = room.y + room.height - 50

    // Generate 5 random spawn locations within the safe area of each room
    for (let i = 0; i < 5; i++) {
      const randomX = random(safeXStart, safeXEnd)
      const randomY = random(safeYStart, safeYEnd)

      spawnLocations.push({ x: randomX, y: randomY })
    }
  })
  waveManager.setup(player, spawnLocations)

  // Start the first wave
  waveManager.startWave()
}

function draw() {
  if (gameState !== 'gameOver') {
    background(220) // Clear the screen with a grey background only if not in game over state
  }
  switch (gameState) {
    case 'startScreen':
      displayStartScreen()
      break
    case 'playing':
      updateAndDrawGame()
      break
    case 'gameOver':
      if (gameOverTime === 0) {
        // Set the time if it's not already set
        gameOverTime = millis()
      }
      displayGameOverOverlay() // Continue to display the game over screen
      if (millis() - gameOverTime > 2500) {
        // Check if 2 seconds have passed
        gameState = 'gameOverScreen' // Change the state to 'gameOverScreen'
        gameOverTime = 0 // Reset the gameOverTime for future use
      }
      break
    case 'gameOverScreen':
      displayGameOverScreen()
      break
  }
}

function updateAndDrawGame() {
  // Render the level
  drawLevel(level)
  // // For checking level walls
  // drawDebug()
  // // Visualize the bounding boxes of the quadtree
  // quadTree.draw()

  // Update and display projectiles
  projectiles.forEach((projectile, i) => {
    projectile.update()
    projectile.draw()
  })
  // Remove inactive projectiles
  projectiles = projectiles.filter((projectile) => projectile.active)

  // Update and draw wave manager (robots)
  waveManager.update()
  waveManager.draw()

  // Update and display the player
  player.update()
  player.draw()

  // Display score
  fill(255)
  noStroke()
  textSize(20)
  textAlign(LEFT, TOP)
  text(`Score: ${score}`, 10, 10)

  // Display wave number
  text(`Wave: ${waveManager.currentWave}`, 130, 10)

  // Update and display active power-up message
  if (player.isInvincible || player.isDoubleScoreActive) {
    displayActivePowerUp(player.isInvincible ? 'Invincibility' : 'Double Score')
  }

  // Display score and wave number
  fill(255)
  noStroke()
  textSize(20)
  textAlign(LEFT, TOP)
  text(`Score: ${score}`, 10, 10)
  text(`Wave: ${waveManager.currentWave}`, 130, 10)

  // Update and display active power-up message
  if (player.isInvincible || player.isDoubleScoreActive) {
    displayActivePowerUp(player.isInvincible ? 'Invincibility' : 'Double Score')
  }
}

function displayStartScreen() {
  fill(0)
  textSize(48)
  textAlign(CENTER, CENTER)
  text('ROBOTRON 4303', width / 2, height / 2 - 50)
  textSize(32)
  textAlign(CENTER, CENTER)
  text('Press ENTER to Start', width / 2, height / 2)
}

function displayGameOverOverlay() {
  push()
  textSize(48)
  fill(255, 0, 0, 200) // Semi-transparent red color for the overlay text
  textAlign(CENTER, CENTER)
  text('GAME OVER', width / 2, height / 2 - 50)
  textSize(32)
  text(`Final Score: ${score}`, width / 2, height / 2 + 40)
  pop()
}

function displayGameOverScreen() {
  fill(0)
  textSize(32)
  textAlign(CENTER, CENTER)
  text('Game Over', width / 2, height / 2)
  text('Press ENTER to Restart', width / 2, height / 2 + 40)
}

function displayActivePowerUp(powerUpType) {
  // Logic to flash the text
  if (frameCount % 60 < 40) {
    // Flashing effect, visible for half a second, then invisible for half a second
    push() // Save current drawing settings
    fill(255, 0, 0)
    textSize(20)
    textAlign(RIGHT, TOP)
    text(`Active Power-Up: ${powerUpType}`, width - 20, 20)
    pop() // Restore original drawing settings
  }
}

function keyPressed() {
  if (gameState === 'startScreen' && keyCode === ENTER) {
    startGame()
  } else if (gameState === 'gameOverScreen' && keyCode === ENTER) {
    restartGame()
  } else if (gameState === 'playing' && keyCode === 32) {
    player.shoot()
  }
}

function startGame() {
  gameState = 'playing'
  // Initialize game elements for a new game
  setupGameElements()
}

function restartGame() {
  gameState = 'playing'
  // Reset score, player, and other game elements to initial state
  score = 0
  robots = []
  humans = []
  obstacles = []
  powerUps = []
  corridors = []
  rooms = []
  grid = []
  walls = []
  projectiles = []

  setupGameElements()
}
