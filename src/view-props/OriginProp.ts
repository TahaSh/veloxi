import { Vec2 } from '../math'
import { ViewProp } from './ViewProp'
import { Point } from './types'

// Public prop interface
export interface ViewOrigin {
  x: number
  y: number
  set(value: Partial<Point>): void
  reset(): void
}

export class OriginProp extends ViewProp<Vec2> implements ViewOrigin {
  get x() {
    return this._currentValue.x
  }

  get y() {
    return this._currentValue.y
  }

  set(value: Partial<Point>) {
    const currentValue = { x: this.x, y: this.y }
    const newValue = { ...currentValue, ...value }
    if (newValue.x < 0 || newValue.x > 1) {
      console.log(
        `%c WARNING: ${this._view.name}.origin.x property can only be a value from 0 to 1`,
        'background: #885500'
      )
      return
    }
    if (newValue.y < 0 || newValue.y > 1) {
      console.log(
        `%c WARNING: ${this._view.name}.origin.y property can only be a value from 0 to 1`,
        'background: #885500'
      )
      return
    }
    this._setTarget(new Vec2(newValue.x, newValue.y), false)
  }

  reset() {
    this._setTarget(this._initialValue, false)
  }

  projectStyles(): string {
    return `transform-origin: ${this.x * 100}% ${this.y * 100}%;`
  }

  isTransform(): boolean {
    return false
  }
}
