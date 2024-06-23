class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary // Boundary is a rectangle defined by x, y, width, height
    this.capacity = capacity // Maximum number of objects before subdivision
    this.objects = [] // Contains objects within the boundary
    this.divided = false
  }

  subdivide() {
    let x = this.boundary.x
    let y = this.boundary.y
    let w = Math.floor(this.boundary.width / 2 / gridCellSize) * gridCellSize
    let h = Math.floor(this.boundary.height / 2 / gridCellSize) * gridCellSize

    this.northwest = new QuadTree(new Rectangle(x, y, w, h), this.capacity)
    this.northeast = new QuadTree(
      new Rectangle(x + w, y, this.boundary.width - w, h),
      this.capacity
    )
    this.southwest = new QuadTree(
      new Rectangle(x, y + h, w, this.boundary.height - h),
      this.capacity
    )
    this.southeast = new QuadTree(
      new Rectangle(
        x + w,
        y + h,
        this.boundary.width - w,
        this.boundary.height - h
      ),
      this.capacity
    )

    this.divided = true
  }

  // Insert a rectangle into the QuadTree
  insert(obj) {
    if (!this.boundary.intersects(obj.rect)) {
      return false
    }

    if (this.objects.length < this.capacity) {
      this.objects.push(obj)
      return true
    }

    if (!this.divided) {
      this.subdivide()
    }

    if (this.northeast.insert(obj)) return true
    if (this.northwest.insert(obj)) return true
    if (this.southeast.insert(obj)) return true
    if (this.southwest.insert(obj)) return true
  }

  // Query the QuadTree for rectangles that intersect with a given range
  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found
    }

    for (let obj of this.objects) {
      if (range.intersects(obj.rect)) {
        found.push(obj)
      }
    }

    if (this.divided) {
      this.northwest.query(range, found)
      this.northeast.query(range, found)
      this.southwest.query(range, found)
      this.southeast.query(range, found)
    }

    return found
  }

  draw() {
    stroke(255, 0, 0) // Red color for Quadtree boundaries
    noFill()
    rect(
      this.boundary.x,
      this.boundary.y,
      this.boundary.width,
      this.boundary.height
    )

    if (this.divided) {
      this.northwest.draw()
      this.northeast.draw()
      this.southwest.draw()
      this.southeast.draw()
    }
  }
}

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  // Check if this rectangle contains another rectangle r
  contains(rectangle) {
    return (
      rectangle.x >= this.x &&
      rectangle.y >= this.y &&
      rectangle.x + rectangle.width <= this.x + this.width &&
      rectangle.y + rectangle.height <= this.y + this.height
    )
  }

  // Check if this rectangle intersects another rectangle r
  intersects(rectangle) {
    return !(
      rectangle.x > this.x + this.width ||
      rectangle.x + rectangle.width < this.x ||
      rectangle.y > this.y + this.height ||
      rectangle.y + rectangle.height < this.y
    )
  }
}
