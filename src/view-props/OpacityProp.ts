import { ElementPropValue } from '../element-props/ElementPropValue'
import { almostEqual } from '../utils/Math'
import { AnimatableProp, ViewProp } from './ViewProp'

// Public prop interface
export interface ViewOpacity extends AnimatableProp {
  value: number
  set(value: number, runAnimation?: boolean): void
  reset(runAnimation?: boolean): void
}

export class OpacityProp extends ViewProp<number> implements ViewOpacity {
  setFromElementPropValue(value: ElementPropValue<number>): void {
    this._setTarget(value.value, true)
  }

  get value() {
    return this._currentValue
  }

  set(value: number, runAnimation: boolean = true) {
    this._setTarget(value, runAnimation)
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(1, runAnimation)
  }

  update(ts: number, dt: number): void {
    if (almostEqual(this._targetValue, this._currentValue)) {
      this._hasChanged = !almostEqual(this._targetValue, this._initialValue)
      return
    }

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
    if (renderValue === this._previousRenderValue) {
      return false
    }
    return true
  }

  get renderValue() {
    return this.value
  }

  projectStyles(): string {
    const renderValue = this.renderValue
    const styles = `opacity: ${renderValue};`
    this._previousRenderValue = renderValue
    return styles
  }

  isTransform(): boolean {
    return false
  }
}
