export class Vec2 {
  public x: number
  public y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  get magnitudeSquared() {
    return this.x * this.x + this.y * this.y
  }

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  get unitVector() {
    const result = new Vec2(0, 0)
    const length = this.magnitude
    if (length !== 0) {
      result.x = this.x / length
      result.y = this.y / length
    }
    return result
  }

  add(v: Vec2): void {
    this.x += v.x
    this.y += v.y
  }

  sub(v: Vec2): void {
    this.x -= v.x
    this.y -= v.y
  }

  scale(n: number): void {
    this.x *= n
    this.y *= n
  }

  dot(v2: Vec2): number {
    return this.x * v2.x + this.y * v2.y
  }

  equals(v2: Vec2): boolean {
    return this.x === v2.x && this.y === v2.y
  }

  clone() {
    return new Vec2(this.x, this.y)
  }

  static scale(v: Vec2, n: number): Vec2 {
    return new Vec2(v.x * n, v.y * n)
  }

  static sub(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y)
  }

  static add(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y)
  }
}
