import { Vec2 } from '../math'
import { ViewProp } from './ViewProp'
import { Size } from './types'

export class SizeProp extends ViewProp<Vec2> {
  get width() {
    return this._currentValue.x
  }

  get height() {
    return this._currentValue.y
  }

  get widthAfterScale() {
    const scaleX = this._view.scale.x
    return this._currentValue.x * scaleX
  }

  get heightAfterScale() {
    const scaleY = this._view.scale.y
    return this._currentValue.y * scaleY
  }

  get initialWidth() {
    return this._initialValue.x
  }

  get initialHeight() {
    return this._initialValue.y
  }

  set(value: Partial<Size>, runAnimation: boolean = true) {
    const currentValue = {
      width: this._currentValue.x,
      height: this._currentValue.y
    }
    const newValue = { ...currentValue, ...value }
    this._setTarget(new Vec2(newValue.width, newValue.height), runAnimation)
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(
      new Vec2(this.initialWidth, this.initialHeight),
      runAnimation
    )
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
    return `width: ${this.width}px; height: ${this.height}px;`
  }

  isTransform(): boolean {
    return false
  }
}
