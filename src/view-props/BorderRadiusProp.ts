import {
  BorderRadiusValue,
  VHBorderRadiusValue,
  calculateBorderRadiusInverse,
  createBorderRadiusValue
} from '../element-props/BorderRadiusValue'
import { ElementPropValue } from '../element-props/ElementPropValue'
import {
  CSSNumber,
  CSSNumbersAlmostEqual,
  createCSSNumber
} from '../utils/CSSNumber'
import { AnimatableProp, ViewProp } from './ViewProp'

interface BorderRadiusValueInput {
  topLeft: string
  topRight: string
  bottomRight: string
  bottomLeft: string
}

// Public prop interface
export interface ViewBorderRadius extends AnimatableProp {
  value: BorderRadiusValue
  set(
    value: string | Partial<BorderRadiusValueInput>,
    runAnimation?: boolean
  ): void
}

export class BorderRadiusProp
  extends ViewProp<CSSNumber[]>
  implements ViewBorderRadius
{
  private _invertedBorderRadius?: VHBorderRadiusValue
  private _forceStyleUpdateThisFrame: boolean = false

  setFromElementPropValue(value: ElementPropValue<BorderRadiusValue>): void {
    this._setTarget(
      [
        value.value.topLeft,
        value.value.topRight,
        value.value.bottomRight,
        value.value.bottomLeft
      ],
      true
    )
  }

  get value(): BorderRadiusValue {
    return {
      topLeft: this._currentValue[0],
      topRight: this._currentValue[1],
      bottomRight: this._currentValue[2],
      bottomLeft: this._currentValue[3]
    }
  }

  get invertedBorderRadius(): VHBorderRadiusValue | undefined {
    return this._invertedBorderRadius
  }

  set(
    value: string | Partial<BorderRadiusValueInput>,
    runAnimation: boolean = true
  ) {
    let input: Partial<BorderRadiusValueInput>
    if (typeof value === 'string') {
      const parsedBorderRadius = createBorderRadiusValue(value.trim())
      input = {
        topLeft: parsedBorderRadius.value.topLeft.valueWithUnit,
        topRight: parsedBorderRadius.value.topRight.valueWithUnit,
        bottomRight: parsedBorderRadius.value.bottomRight.valueWithUnit,
        bottomLeft: parsedBorderRadius.value.bottomLeft.valueWithUnit
      }
    } else {
      input = value
    }

    const topLeft = input.topLeft
      ? createCSSNumber(input.topLeft)
      : this._currentValue[0]
    const topRight = input.topRight
      ? createCSSNumber(input.topRight)
      : this._currentValue[1]
    const bottomRight = input.bottomRight
      ? createCSSNumber(input.bottomRight)
      : this._currentValue[2]
    const bottomLeft = input.bottomLeft
      ? createCSSNumber(input.bottomLeft)
      : this._currentValue[3]

    this._setTarget([topLeft, topRight, bottomRight, bottomLeft], runAnimation)
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(this._initialValue, runAnimation)
  }

  update(ts: number, dt: number): void {
    if (this._forceStyleUpdateThisFrame) {
      this._hasChanged = true
      this._forceStyleUpdateThisFrame = false
    } else if (this._view.scale.isAnimating) {
      this._hasChanged = true
    } else if (CSSNumbersAlmostEqual(this._targetValue, this._currentValue)) {
      this._hasChanged = !CSSNumbersAlmostEqual(
        this._targetValue,
        this._initialValue
      )
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

    this._applyScaleInverse()
  }

  applyScaleInverse() {
    this._forceStyleUpdateThisFrame = true
  }

  private _applyScaleInverse() {
    const newWidth = this._rect.size.width * this._view.scale.x
    const newHeight = this._rect.size.height * this._view.scale.y

    this._invertedBorderRadius = calculateBorderRadiusInverse(
      createBorderRadiusValue(
        `${this._currentValue[0].valueWithUnit} ${this._currentValue[1].valueWithUnit} ${this._currentValue[2].valueWithUnit} ${this._currentValue[3].valueWithUnit}`
      ).value,
      {
        width: newWidth,
        height: newHeight
      }
    )
  }

  projectStyles(): string {
    if (this.invertedBorderRadius) {
      return `border-radius: ${this.invertedBorderRadius.h.topLeft.valueWithUnit} ${this.invertedBorderRadius.h.topRight.valueWithUnit} ${this.invertedBorderRadius.h.bottomRight.valueWithUnit} ${this.invertedBorderRadius.h.bottomLeft.valueWithUnit} / ${this.invertedBorderRadius.v.topLeft.valueWithUnit} ${this.invertedBorderRadius.v.topRight.valueWithUnit} ${this.invertedBorderRadius.v.bottomRight.valueWithUnit} ${this.invertedBorderRadius.v.bottomLeft.valueWithUnit};`
    }
    return `border-radius: ${this.value.topLeft.valueWithUnit} ${this.value.topRight.valueWithUnit} ${this.value.bottomRight.valueWithUnit} ${this.value.bottomLeft.valueWithUnit};`
  }

  isTransform(): boolean {
    return false
  }
}
