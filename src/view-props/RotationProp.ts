import { almostEqual } from '../utils/Math'
import { AnimatableProp, ViewProp } from './ViewProp'

// Public prop interface
export interface ViewRotation extends AnimatableProp {
  degrees: number
  radians: number
  setDegrees(value: number, runAnimation?: boolean): void
  setRadians(value: number, runAnimation?: boolean): void
  reset(runAnimation?: boolean): void
}

export class RotationProp extends ViewProp<number> implements ViewRotation {
  private _unit = 'deg'

  get degrees() {
    let value = this._currentValue
    if (this._unit === 'rad') {
      value = value * (180 / Math.PI)
    }
    return value
  }

  get radians() {
    let value = this._currentValue
    if (this._unit === 'deg') {
      value = value * (Math.PI / 180)
    }
    return value
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
      initial: this._previousValue,
      ts,
      dt
    })
  }

  get shouldRender(): boolean {
    if (!this._hasChanged) {
      return false
    }
    if (typeof this._previousRenderValue === 'undefined') {
      return true
    }
    const renderValue = this.renderValue
    if (almostEqual(renderValue, this._previousRenderValue)) {
      return false
    }
    return true
  }

  get renderValue() {
    return this._currentValue
  }

  projectStyles(): string {
    const renderValue = this.renderValue
    const styles = `rotate(${renderValue}${this._unit})`
    this._previousRenderValue = renderValue
    return styles
  }

  isTransform(): boolean {
    return true
  }
}
