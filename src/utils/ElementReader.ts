import {
  BorderRadiusValue,
  createBorderRadiusValue
} from '../element-props/BorderRadiusValue'
import {
  ElementPropValue,
  ViewPropNameToElementPropValue
} from '../element-props/ElementPropValue'
import { createOpacityValue } from '../element-props/OpacityValue'
import { createOriginValue } from '../element-props/OriginValue'
import { Vec2 } from '../math'
import { ViewRect, readRect } from './RectReader'

export class ElementReader {
  private _rect: ViewRect
  private _computedStyle: CSSStyleDeclaration

  constructor(element: HTMLElement) {
    this._rect = readRect(element)
    this._computedStyle = getComputedStyle(element)
  }

  read<K extends keyof ViewPropNameToElementPropValue>(
    propName: K
  ): ViewPropNameToElementPropValue[K] | undefined {
    switch (propName) {
      case 'opacity':
        return this.opacity as ViewPropNameToElementPropValue[K]
      case 'borderRadius':
        return this.borderRadius as ViewPropNameToElementPropValue[K]
    }
    return undefined
  }

  get rect(): ViewRect {
    return this._rect
  }

  get opacity(): ElementPropValue<number> {
    return createOpacityValue(this._computedStyle.opacity)
  }

  get borderRadius(): ElementPropValue<BorderRadiusValue> {
    return createBorderRadiusValue(this._computedStyle.borderRadius)
  }

  get origin(): ElementPropValue<Vec2> {
    return createOriginValue(
      this._computedStyle.transformOrigin,
      this._rect.size
    )
  }
}

export function readElement(element: HTMLElement) {
  return new ElementReader(element)
}
