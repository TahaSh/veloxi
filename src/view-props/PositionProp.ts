import { Vec2 } from '../math'
import { ViewProp } from './ViewProp'

type Point = { x: number; y: number }

export class PositionProp extends ViewProp<Vec2> {
  private _animateLayoutUpdateNextFrame = false

  get x() {
    return this._currentValue.x + this._rect.pageOffset.left
  }

  get y() {
    return this._currentValue.y + this._rect.pageOffset.top
  }

  get initialX() {
    return this._rect.pageOffset.left
  }

  get initialY() {
    return this._rect.pageOffset.top
  }

  progressTo(target: Partial<Point>) {
    const targetX = typeof target.x === 'undefined' ? this.initialX : target.x
    const targetY = typeof target.y === 'undefined' ? this.initialY : target.y
    const targetPosition = new Vec2(targetX, targetY)
    const initialPosition = new Vec2(this.initialX, this.initialY)
    const currentPosition = new Vec2(this.x, this.y)
    const displacement = Vec2.sub(currentPosition, initialPosition)
    const fullDistance = Vec2.sub(targetPosition, initialPosition)
    const distance = Vec2.sub(fullDistance, displacement)
    const progress = 1 - distance.magnitude / fullDistance.magnitude
    return progress
  }

  set(value: Partial<Point>, runAnimation: boolean = true) {
    const currentValue = { x: this.x, y: this.y }
    const newValue = { ...currentValue, ...value }
    this._setTarget(
      new Vec2(
        newValue.x - this._rect.pageOffset.left,
        newValue.y - this._rect.pageOffset.top
      ),
      runAnimation
    )
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(new Vec2(0, 0), runAnimation)
  }

  update(ts: number, dt: number): void {
    if (this._view.isLayoutTransitionEnabled) {
      this._runLayoutTransition()
    }

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

  private _runLayoutTransition() {
    const dx = this._rect.pageOffset.left - this._previousRect.pageOffset.left
    const dy = this._rect.pageOffset.top - this._previousRect.pageOffset.top
    if (dx !== 0 || dy !== 0) {
      this._animateLayoutUpdateNextFrame = true
      this._setTarget(
        new Vec2(this._initialValue.x - dx, this._currentValue.y - dy),
        false
      )
    } else if (this._animateLayoutUpdateNextFrame) {
      this._setTarget(this._initialValue, true)
      this._animateLayoutUpdateNextFrame = false
    }
  }

  projectStyles(): string {
    return `translate3d(${this._currentValue.x}px, ${this._currentValue.y}px, 0)`
  }

  isTransform(): boolean {
    return true
  }
}
