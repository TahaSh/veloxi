import { CoreView } from '../core/View'
import { Vec2 } from '../math'
import { ViewRect } from '../utils/RectReader'
import { AnimatableProp, ViewProp } from './ViewProp'
import { Point, Size } from './types'

// Public prop interface
export interface ViewScale extends AnimatableProp {
  x: number
  y: number
  set(value: Partial<Point> | number, runAnimation?: boolean): void
  setWithSize(value: Partial<Size>, runAnimation?: boolean): void
  reset(runAnimation?: boolean): void
}

export class ScaleProp extends ViewProp<Vec2> implements ViewScale {
  private _animateLayoutUpdateNextFrame = false

  get x() {
    return this._currentValue.x
  }

  get y() {
    return this._currentValue.y
  }

  set(value: Partial<Point> | number, runAnimation: boolean = true) {
    const currentValue = { x: this._currentValue.x, y: this._currentValue.y }
    const pointValue =
      typeof value === 'number' ? { x: value, y: value } : value
    const newValue = { ...currentValue, ...pointValue }
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
      (this._view.isInverseEffectEnabled ||
        this._view.isLayoutTransitionEnabled) &&
      !this._view.isTemporaryView
    ) {
      this._runLayoutTransition()
    }

    if (this._view.isInverseEffectEnabled) {
      const parent = this._view._parent
      const parentScaleX = parent ? parent.scale.x : 1
      const parentScaleY = parent ? parent.scale.y : 1
      this._hasChanged = parentScaleX !== 1 || parentScaleY !== 1
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
      initial: new Vec2(this._previousValue.x, this._previousValue.y),
      ts,
      dt
    })
  }

  private _runLayoutTransition() {
    const inAnimation = !(
      this._targetValue.x === this._currentValue.x &&
      this._targetValue.y === this._currentValue.y
    )

    const dw = this._previousRect.size.width / this._rect.size.width
    const dh = this._previousRect.size.height / this._rect.size.height
    let hasChanged = false
    if ((!Number.isNaN(dw) && dw !== 1) || (!Number.isNaN(dh) && dh !== 1)) {
      hasChanged = true
    }

    if (hasChanged) {
      // If the view is not at rest state (meaning scale != (1, 1)),
      // then, start the animation from the last scale value
      if (this._currentValue.x !== 1 || this._currentValue.y !== 1) {
        const dw =
          this._view.previousRect.size.width / this._view.rect.size.width
        const dh =
          this._view.previousRect.size.height / this._view.rect.size.height

        this._setTarget(
          new Vec2(this._currentValue.x * dw, this._currentValue.y * dh),
          false
        )
        if (inAnimation) {
          this._animateLayoutUpdateNextFrame = true
        }
        return
      }

      const scaleX = this._previousRect.size.width / this._rect.size.width
      const scaleY = this._previousRect.size.height / this._rect.size.height

      const dw = scaleX
      const dh = scaleY

      this._view.viewProps.borderRadius.applyScaleInverse()

      this._setTarget(new Vec2(dw, dh), false)
      this._animateLayoutUpdateNextFrame = true
    } else if (this._animateLayoutUpdateNextFrame) {
      this._setTarget(this._initialValue, true)
      this._animateLayoutUpdateNextFrame = false
    }
  }

  projectStyles(): string {
    const parentScaleX = this._view._parent ? this._view._parent.scale.x : 1
    const parentScaleY = this._view._parent ? this._view._parent.scale.y : 1
    const x = this._currentValue.x / parentScaleX
    const y = this._currentValue.y / parentScaleY
    return `scale3d(${x}, ${y}, 1)`
  }

  isTransform(): boolean {
    return true
  }
}

export function calculateScaleDiff(
  prevRect: ViewRect,
  rect: ViewRect,
  parents: CoreView[]
) {
  const reversedParents = [...parents].reverse()

  let accumulatedDw = 1
  let accumulatedDh = 1

  reversedParents.forEach((parent) => {
    const wRatio =
      (parent.previousRect.size.width / parent.rect.size.width) * accumulatedDw
    accumulatedDw = accumulatedDw * (1 / wRatio)

    const hRatio =
      (parent.previousRect.size.height / parent.rect.size.height) *
      accumulatedDh
    accumulatedDh = accumulatedDh * (1 / hRatio)
  })

  const newWidth = rect.size.width === 0 ? 1 : rect.size.width
  const newHeight = rect.size.height === 0 ? 1 : rect.size.height
  return {
    dw: (prevRect.size.width / newWidth) * accumulatedDw,
    dh: (prevRect.size.height / newHeight) * accumulatedDh
  }
}
