import { Vec2 } from '../math'
import { almostEqual } from '../utils/Math'
import { AnimatableProp, ViewProp } from './ViewProp'

// Public prop interface
export interface ViewPosition extends AnimatableProp {
  x: number
  y: number
  initialX: number
  initialY: number
  set(value: Partial<Point>, runAnimation?: boolean): void
  reset(runAnimation?: boolean): void
  progressTo(target: Partial<Point>): number
}

type Point = { x: number; y: number }

export class PositionProp extends ViewProp<Vec2> implements ViewPosition {
  private _animateLayoutUpdateNextFrame = false
  private _parentScaleInverse: Vec2 = new Vec2(1, 1)

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

  progressTo(target: Partial<Point>): number {
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
      this._parentScaleInverse = new Vec2(1 / parentScaleX, 1 / parentScaleY)

      if (!this._parentScaleInverse.equals(new Vec2(1, 1))) {
        this._hasChanged = true
      }
    }

    if (
      this._targetValue.x === this._currentValue.x &&
      this._targetValue.y === this._currentValue.y
    )
      return

    const parent = this._view._parent

    const parentScaleX = parent ? parent.scale.x : 1
    const parentScaleY = parent ? parent.scale.y : 1

    const prevParentScaleX = parent ? parent.scale._previousValue.x : 1
    const prevParentScaleY = parent ? parent.scale._previousValue.y : 1

    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: new Vec2(
        this._currentValue.x * parentScaleX,
        this._currentValue.y * parentScaleY
      ),
      target: this._targetValue,
      initial: new Vec2(
        this._previousValue.x * prevParentScaleX,
        this._previousValue.y * prevParentScaleY
      ),
      ts,
      dt
    })

    this._currentValue = new Vec2(
      this._currentValue.x / parentScaleX,
      this._currentValue.y / parentScaleY
    )
  }

  private _runLayoutTransition() {
    const inAnimation = !(
      this._targetValue.x === this._currentValue.x &&
      this._targetValue.y === this._currentValue.y
    )

    const scaleAnimation = !(
      this._view.scale._targetValue.x === this._view.scale._currentValue.x &&
      this._view.scale._targetValue.y === this._view.scale._currentValue.y
    )

    const animating = inAnimation || scaleAnimation

    const dx = this._rect.pageOffset.left - this._previousRect.pageOffset.left
    const dy = this._rect.pageOffset.top - this._previousRect.pageOffset.top
    const dw = this._previousRect.size.width / this._rect.size.width
    const dh = this._previousRect.size.height / this._rect.size.height

    let hasChanged = false
    if (
      dx !== 0 ||
      dy !== 0 ||
      (!Number.isNaN(dw) && dw !== 1) ||
      (!Number.isNaN(dh) && dh !== 1)
    ) {
      hasChanged = true
    } else {
      hasChanged = (() => {
        const parents = this._view._parents
        for (let i = 0; i < parents.length; i++) {
          const parent = parents[i]
          const dw = parent.previousRect.size.width / parent.rect.size.width
          const dh = parent.previousRect.size.height / parent.rect.size.height
          if (dw !== 1 || dh !== 1) {
            return true
          }
        }
        return false
      })()
    }

    if (hasChanged) {
      // If the view is not at rest state (meaning translate != (0, 0)),
      // then, start the animation from the last position value
      if (
        this._currentValue.x !== 0 ||
        this._currentValue.y !== 0 ||
        this._view.scale._currentValue.x !== 1 ||
        this._view.scale._currentValue.y !== 1
      ) {
        if (!animating) {
          const dx =
            this._rect.pageOffset.left - this._previousRect.pageOffset.left
          const dy =
            this._rect.pageOffset.top - this._previousRect.pageOffset.top

          this._setTarget(
            new Vec2(this._currentValue.x - dx, this._currentValue.y - dy),
            false
          )
          return
        }
        const parent = this._view._parent

        const startRect = this._rect.pageOffset
        const currentScroll = this._view.getScroll()
        const currentRect = {
          left: this._previousRect.viewportOffset.left + currentScroll.x,
          top: this._previousRect.viewportOffset.top + currentScroll.y
        }

        const dx = currentRect.left - startRect.left
        const dy = currentRect.top - startRect.top

        let parentDx = 0
        let parentDy = 0
        let offsetY = 0
        let offsetX = 0
        if (parent) {
          const parentStartRect = parent.rect.pageOffset
          const currentScroll = parent.getScroll()
          const parentCurrentRect = {
            left: parent.previousRect.viewportOffset.left + currentScroll.x,
            top: parent.previousRect.viewportOffset.top + currentScroll.y
          }
          parentDx = parentCurrentRect.left - parentStartRect.left
          parentDy = parentCurrentRect.top - parentStartRect.top

          const currentInsideOffsetY = currentRect.top - parentCurrentRect.top
          const currentInsideOffsetX = currentRect.left - parentCurrentRect.left

          const currentY = parent.scale.y * currentInsideOffsetY
          const remainingY = currentInsideOffsetY - currentY
          offsetY = remainingY / parent.scale.y
          const currentX = parent.scale.x * currentInsideOffsetX
          const remainingX = currentInsideOffsetX - currentX
          offsetX = remainingX / parent.scale.x
        }

        this._setTarget(
          new Vec2(dx - parentDx + offsetX, dy - parentDy + offsetY),
          false
        )
        if (animating) {
          this._animateLayoutUpdateNextFrame = true
        }
        return
      }
      this._animateLayoutUpdateNextFrame = true
      const prevRect = this._previousRect
      const rect = this._rect
      const parent = this._view._parent

      let parentDx = 0
      let parentDy = 0
      if (parent) {
        parentDx =
          parent.previousRect.viewportOffset.left -
          parent.rect.viewportOffset.left
      }
      if (parent) {
        parentDy =
          parent.previousRect.viewportOffset.top -
          parent.rect.viewportOffset.top
      }

      // Find scale
      let targetParentDw = 1
      let targetParentDh = 1

      if (parent) {
        targetParentDw = parent.previousRect.size.width / parent.rect.size.width
        targetParentDh =
          parent.previousRect.size.height / parent.rect.size.height
      }

      const prevParentLeft = parent
        ? parent.previousRect.viewportOffset.left
        : 0
      const prevParentTop = parent ? parent.previousRect.viewportOffset.top : 0
      const relativeLeft = prevRect.viewportOffset.left - prevParentLeft
      const relativeTop = prevRect.viewportOffset.top - prevParentTop
      const prevMarginOffsetX = relativeLeft / targetParentDw - relativeLeft
      const prevMarginOffsetY = relativeTop / targetParentDh - relativeTop

      let dx =
        prevRect.viewportOffset.left -
        rect.viewportOffset.left -
        parentDx +
        prevMarginOffsetX
      const dy =
        prevRect.viewportOffset.top -
        rect.viewportOffset.top -
        parentDy +
        prevMarginOffsetY

      this._setTarget(new Vec2(dx, dy), false)
    } else if (this._animateLayoutUpdateNextFrame) {
      this._setTarget(this._initialValue, true)
      this._animateLayoutUpdateNextFrame = false
    }
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
    let xOffset = 0
    let yOffset = 0

    if (
      this._view.isInverseEffectEnabled ||
      this._view.isLayoutTransitionEnabled
    ) {
      xOffset =
        (this._rect.size.width *
          this._parentScaleInverse.x *
          this._view.scale.x -
          this._rect.size.width) *
        this._view.origin.x
      yOffset =
        (this._rect.size.height *
          this._parentScaleInverse.y *
          this._view.scale.y -
          this._rect.size.height) *
        this._view.origin.y
    }

    return new Vec2(
      this._currentValue.x + xOffset,
      this._currentValue.y + yOffset
    )
  }

  projectStyles(): string {
    const renderValue = this.renderValue
    const styles = `translate3d(${renderValue.x}px, ${renderValue.y}px, 0)`
    this._previousRenderValue = renderValue
    return styles
  }

  isTransform(): boolean {
    return true
  }
}
