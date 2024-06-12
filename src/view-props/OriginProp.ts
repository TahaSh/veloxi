import { Vec2 } from '../math'
import { almostEqual } from '../utils/Math'
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

  get shouldRender(): boolean {
    if (!this._hasChanged) {
      return false
    }
    if (!this._previousRenderValue) {
      return true
    }
    const renderValue = this.renderValue
    if (
      almostEqual(renderValue.x, this._previousRenderValue.x) &&
      almostEqual(renderValue.y, this._previousRenderValue.y)
    ) {
      return false
    }
    return true
  }

  get renderValue() {
    return new Vec2(this.x * 100, this.y * 100)
  }

  projectStyles(): string {
    const renderValue = this.renderValue
    const styles = `transform-origin: ${renderValue.x}% ${renderValue.y}%;`
    this._previousRenderValue = renderValue
    return styles
  }

  isTransform(): boolean {
    return false
  }
}
