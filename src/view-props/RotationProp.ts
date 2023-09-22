import { ViewProp } from './ViewProp'

export class RotationProp extends ViewProp<number> {
  private _unit = 'deg'

  get degrees() {
    return this._currentValue
  }

  setDegrees(value: number, runAnimation: boolean = true) {
    this._unit = 'deg'
    this._setTarget(value, runAnimation)
  }

  setRadians(value: number, runAnimation: boolean = true) {
    this._unit = 'rad'
    this._setTarget(value, runAnimation)
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(0, runAnimation)
  }

  update(ts: number, dt: number): void {
    if (this._targetValue === this._currentValue) return

    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._initialValue,
      ts,
      dt
    })
  }

  projectStyles(): string {
    return `rotate(${this._currentValue}${this._unit})`
  }

  isTransform(): boolean {
    return true
  }
}
