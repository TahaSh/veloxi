import { Vec2 } from '../math'
import { createCSSNumber } from '../utils/CSSNumber'
import { RectSize } from '../utils/RectReader'
import { ElementPropValue } from './ElementPropValue'

class OriginValue implements ElementPropValue<Vec2> {
  private _x: number
  private _y: number

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  get value(): Vec2 {
    return new Vec2(this._x, this._y)
  }
}

export function createOriginValue(
  originCssString: string,
  size: RectSize
): OriginValue {
  const [left, top] = originCssString.split(' ')
  const leftCssValue = createCSSNumber(left)
  const topCssValue = createCSSNumber(top)
  return new OriginValue(
    leftCssValue.value / size.width,
    topCssValue.value / size.height
  )
}
