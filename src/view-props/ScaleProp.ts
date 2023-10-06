import { Vec2 } from '../math'
import { ViewProp } from './ViewProp'
import { Point, Size } from './types'

export class ScaleProp extends ViewProp<Vec2> {
  get x() {
    return this._currentValue.x
  }

  get y() {
    return this._currentValue.y
  }

  set(value: Partial<Point>, runAnimation: boolean = true) {
    const currentValue = { x: this._currentValue.x, y: this._currentValue.y }
    const newValue = { ...currentValue, ...value }
    this._setTarget(new Vec2(newValue.x, newValue.y), runAnimation)
  }

  setWithSize(value: Partial<Size>, runAnimation: boolean = true) {
    let scaleX = this._currentValue.x
    let scaleY = this._currentValue.y
    if (value.width) {
      scaleX = value.width / this._rect.size.width
    }
    if (value.height) {
      scaleY = value.height / this._rect.size.height
    }
    if (!value.width && value.height) {
      scaleX = scaleY
    }
    if (!value.height && value.width) {
      scaleY = scaleX
    }
    const newValue = { x: scaleX, y: scaleY }
    this._setTarget(new Vec2(newValue.x, newValue.y), runAnimation)
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(new Vec2(1, 1), runAnimation)
  }

  update(ts: number, dt: number): void {
    if (
      this._targetValue.x === this._currentValue.x &&
      this._targetValue.y === this._currentValue.y
    )
      return

    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts,
      dt
    })
  }

  projectStyles(): string {
    return `scale3d(${this._currentValue.x}, ${this._currentValue.y}, 1)`
  }

  isTransform(): boolean {
    return true
  }
}
