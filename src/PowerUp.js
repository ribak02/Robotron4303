class PowerUp {
  constructor(x, y, type) {
    this.position = createVector(x, y)
    this.size = 20 // Can adjust based on the power-up's visual representation
    this.type = type // "invincibility" or "doubleScore"
    this.effectDuration = 5000 // 5 seconds effect
  }

  activate() {
    switch (this.type) {
      case 'invincibility':
        // Activate invincibility
        player.activatePowerUp('invincibility', this.effectDuration)
        break
      case 'doubleScore':
        // Activate double score
        player.activatePowerUp('doubleScore', this.effectDuration)
        break
    }
  }

  update() {}

  draw() {
    push()
    fill(
      this.type === 'invincibility' ? color(7, 237, 237) : color(7, 237, 111)
    )
    noStroke()
    ellipse(this.position.x, this.position.y, this.size)
    pop()
  }
}
