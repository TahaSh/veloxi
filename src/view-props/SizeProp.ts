import { Vec2 } from '../math'
import { almostEqual } from '../utils/Math'
import { AnimatableProp, ViewProp } from './ViewProp'
import { Size } from './types'

// Public prop interface
export interface ViewSize extends AnimatableProp {
  width: number
  height: number
  widthAfterScale: number
  heightAfterScale: number
  initialWidth: number
  initialHeight: number
  set(value: Partial<Size>, runAnimation?: boolean): void
  setWidth(value: number, runAnimation?: boolean): void
  setHeight(value: number, runAnimation?: boolean): void
  reset(runAnimation?: boolean): void
}

export class SizeProp extends ViewProp<Vec2> implements ViewSize {
  get width() {
    return this._view.rect.size.width
  }
  get height() {
    return this._view.rect.size.height
  }

  get localWidth() {
    return this._currentValue.x
  }

  get localHeight() {
    return this._currentValue.y
  }

  get widthAfterScale() {
    const scaleX = this._view.scale.x
    return this.localWidth * scaleX
  }

  get heightAfterScale() {
    const scaleY = this._view.scale.y
    return this.localHeight * scaleY
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

  setWidth(value: number, runAnimation: boolean = true) {
    const currentValue = {
      width: this._currentValue.x,
      height: this._currentValue.y
    }
    const newValue = { ...currentValue, width: value }
    this._setTarget(new Vec2(newValue.width, newValue.height), runAnimation)
  }

  setHeight(value: number, runAnimation: boolean = true) {
    const currentValue = {
      width: this._currentValue.x,
      height: this._currentValue.y
    }
    const newValue = { ...currentValue, height: value }
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
    return new Vec2(this._currentValue.x, this._currentValue.y)
  }

  projectStyles(): string {
    const renderValue = this.renderValue
    const styles = `width: ${renderValue.x}px; height: ${renderValue.y}px;`
    this._previousRenderValue = renderValue
    return styles
  }

  isTransform(): boolean {
    return false
  }
}
