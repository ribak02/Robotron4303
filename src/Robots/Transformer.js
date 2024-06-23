class Transformer extends Robot {
  constructor(x, y, humans) {
    super(x, y)
    this.score = 30
    this.humans = humans
    this.target = this.findClosestHuman()
    this.color = [252, 211, 3]
    this.maxSpeed = 0.5
  }

  update() {
    this.target = this.findClosestHuman()
    super.update()
  }

  findClosestHuman() {
    let closestHuman = null
    let minDistance = Infinity
    this.humans.forEach((human) => {
      let distance = p5.Vector.dist(this.position, human.position)
      if (distance < minDistance) {
        minDistance = distance
        closestHuman = human
      }
    })
    return closestHuman
  }

  // Override the seek method to target the current target human
  seek() {
    if (this.target) {
      // Implement seeking logic here
      let desiredVelocity = p5.Vector.sub(
        this.target.position,
        this.position
      ).setMag(this.maxSpeed)
      this.velocity = p5.Vector.lerp(this.velocity, desiredVelocity, 0.2) // Smooth steering towards the target
    }
  }

  // Override the canSeeTarget method to check visibility towards the current target human
  canSeeTarget() {
    if (!this.target) return false
    let distance = p5.Vector.dist(this.position, this.target.position)
    return distance <= this.sightRange // For simplicity, we're just using distance for visibility check
  }
}
