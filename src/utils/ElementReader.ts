import { CoreView } from '../core/View'
import {
  BorderRadiusValue,
  createBorderRadiusValue
} from '../element-props/BorderRadiusValue'
import { ElementPropValue } from '../element-props/ElementPropValue'
import { createOpacityValue } from '../element-props/OpacityValue'
import { createOriginValue } from '../element-props/OriginValue'
import { Vec2 } from '../math'
import { Point } from '../view-props/types'
import {
  createPageOffsetRectReader,
  PageOffsetRectReader
} from './PageOffsetRectReader'
import { ViewRect, readRect } from './RectReader'

export class ElementReader {
  private _element: HTMLElement
  private _rect: ViewRect
  private _computedStyle: CSSStyleDeclaration
  private _pageRectReader: PageOffsetRectReader
  private _scroll: Point

  constructor(view: CoreView) {
    this._element = view.element
    this._pageRectReader = createPageOffsetRectReader(view)
    this._rect = readRect(this._element, this._pageRectReader)
    this._computedStyle = getComputedStyle(this._element)
    this._scroll = this._calculateScroll()
  }

  destroy() {
    this._pageRectReader.destroy()
  }

  invalidatePageRect() {
    this._pageRectReader.invalidate()
  }

  update(includeScroll = false) {
    this._rect = readRect(this._element, this._pageRectReader)
    this._computedStyle = getComputedStyle(this._element)
    if (includeScroll) {
      this._scroll = this._calculateScroll()
    }
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

  _calculateScroll(): Point {
    let current = this._element
    let y = 0
    let x = 0

    while (current) {
      y += current.scrollTop
      x += current.scrollLeft

      current = current.offsetParent as HTMLElement
    }

    x += window.scrollX
    y += window.scrollY

    return { y, x }
  }
  get scroll(): Point {
    return this._scroll
  }
}

export function readElement(view: CoreView) {
  return new ElementReader(view)
}
