import { CSSNumber, createCSSNumber } from '../utils/CSSNumber'
import { almostEqual } from '../utils/Math'
import { RectSize } from '../utils/RectReader'
import { ElementPropValue } from './ElementPropValue'

export interface BorderRadiusValue {
  topLeft: CSSNumber
  topRight: CSSNumber
  bottomRight: CSSNumber
  bottomLeft: CSSNumber
  toCssPercentageForNewSize?(newSize: RectSize): string
}

export interface VHBorderRadiusValue {
  v: BorderRadiusValue
  h: BorderRadiusValue
}

class BorderRadius implements ElementPropValue<BorderRadiusValue> {
  private _topLeft: CSSNumber
  private _topRight: CSSNumber
  private _bottomLeft: CSSNumber
  private _bottomRight: CSSNumber

  get value(): BorderRadiusValue {
    return {
      topLeft: this._topLeft,
      topRight: this._topRight,
      bottomRight: this._bottomRight,
      bottomLeft: this._bottomLeft
    }
  }

  equals(b: ElementPropValue<BorderRadiusValue>): boolean {
    return (
      almostEqual(this.value.topLeft.value, b.value.topLeft.value) &&
      almostEqual(this.value.topRight.value, b.value.topRight.value) &&
      almostEqual(this.value.bottomRight.value, b.value.bottomRight.value) &&
      almostEqual(this.value.bottomLeft.value, b.value.bottomLeft.value)
    )
  }

  constructor(
    topLeft: CSSNumber,
    topRight: CSSNumber,
    bottomLeft: CSSNumber,
    bottomRight: CSSNumber
  ) {
    this._topLeft = topLeft
    this._topRight = topRight
    this._bottomLeft = bottomLeft
    this._bottomRight = bottomRight
  }

  toCssPercentageForNewSize(newSize: RectSize): string {
    const topLeft = this._convertToPercentage(this._topLeft, newSize)
    const topRight = this._convertToPercentage(this._topRight, newSize)
    const bottomLeft = this._convertToPercentage(this._bottomLeft, newSize)
    const bottomRight = this._convertToPercentage(this._bottomRight, newSize)
    return `${topLeft.h} ${topRight.h} ${bottomRight.h} ${bottomLeft.h} / ${topLeft.v} ${topRight.v} ${bottomRight.v} ${bottomLeft.v}`
  }

  private _convertToPercentage(
    originalBorder: CSSNumber,
    newSize: RectSize
  ): { h: string; v: string } {
    if (originalBorder.unit === '%') {
      return { h: `${originalBorder.value}%`, v: `${originalBorder.value}%` }
    }
    const h = (originalBorder.value / newSize.width) * 100
    const v = (originalBorder.value / newSize.height) * 100
    return { h: `${h}%`, v: `${v}%` }
  }
}

export function createBorderRadiusValue(
  borderRadiusValue: string
): BorderRadius {
  const values = borderRadiusValue.split(' ').map((value) => {
    return createCSSNumber(value)
  })

  const defaultBorderRadius: CSSNumber = {
    value: 0,
    unit: '',
    valueWithUnit: '0'
  }

  switch (values.length) {
    case 1:
      return new BorderRadius(values[0], values[0], values[0], values[0])
    case 2:
      return new BorderRadius(values[0], values[1], values[0], values[1])
    case 3:
      return new BorderRadius(values[0], values[1], values[2], values[1])
    case 4:
      return new BorderRadius(values[0], values[1], values[3], values[2])
    default:
      return new BorderRadius(
        defaultBorderRadius,
        defaultBorderRadius,
        defaultBorderRadius,
        defaultBorderRadius
      )
  }
}

export function calculateBorderRadiusInverse(
  borderRadius: BorderRadiusValue,
  newSize: RectSize
): VHBorderRadiusValue {
  const topLeft = convertToPercentage(borderRadius.topLeft, newSize)
  const topRight = convertToPercentage(borderRadius.topRight, newSize)
  const bottomLeft = convertToPercentage(borderRadius.bottomLeft, newSize)
  const bottomRight = convertToPercentage(borderRadius.bottomRight, newSize)
  return {
    v: {
      topLeft: topLeft.v,
      topRight: topRight.v,
      bottomRight: bottomRight.v,
      bottomLeft: bottomLeft.v
    },
    h: {
      topLeft: topLeft.h,
      topRight: topRight.h,
      bottomRight: bottomRight.h,
      bottomLeft: bottomLeft.h
    }
  }

  function convertToPercentage(
    originalBorder: CSSNumber,
    newSize: RectSize
  ): { h: CSSNumber; v: CSSNumber } {
    if (originalBorder.unit === '%') {
      return {
        h: createCSSNumber(`${originalBorder.value}%`),
        v: createCSSNumber(`${originalBorder.value}%`)
      }
    }
    const h = (originalBorder.value / newSize.width) * 100
    const v = (originalBorder.value / newSize.height) * 100
    return { h: createCSSNumber(`${h}%`), v: createCSSNumber(`${v}%`) }
  }
}
