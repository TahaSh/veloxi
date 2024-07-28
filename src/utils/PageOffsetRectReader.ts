import { CoreView } from '../core/View'
import { Size } from '../view-props/types'
import { almostEqual } from './Math'
import { getPageRect, PageRect } from './RectReader'

export interface PageOffsetRectReader {
  read(size: Size): PageRect
  invalidate(): void
}

class PageOffsetRectReaderImpl implements PageOffsetRectReader {
  _currentPageRect?: PageRect
  _view: CoreView
  _element: HTMLElement
  _offsetLeft: number
  _offsetTop: number
  _width: number
  _height: number
  _parentWidth: number
  _parentHeight: number
  _parentEl?: HTMLElement | null
  _isSvg: boolean
  _invalid: boolean

  constructor(view: CoreView) {
    this._invalid = true
    this._view = view
    this._element = view.element
    this._isSvg = !!this._element.closest('svg')
    this._offsetLeft = 0
    this._offsetTop = 0
    this._width = 0
    this._height = 0
    this._parentWidth = 0
    this._parentHeight = 0
    this._offsetLeft = 0
    this._parentEl = this._element.parentElement
    window.addEventListener('resize', () => {
      this.invalidate()
    })
  }

  invalidate() {
    this._invalid = true
  }

  read(size: Size): PageRect {
    if (this._isSvg) {
      if (!this._currentPageRect) {
        this._currentPageRect = getPageRect(this._element)
      }
      return this._currentPageRect
    }
    const currentParentEl = this._element.parentElement
    const currentLeft = this._element.offsetLeft
    const currentTop = this._element.offsetTop
    const currentWidth = size.width
    const currentHeight = size.height
    const currentParentWidth = currentParentEl?.offsetWidth || 0
    const currentParentHeight = currentParentEl?.offsetHeight || 0

    if (
      this._offsetLeft !== currentLeft ||
      this._offsetTop !== currentTop ||
      !almostEqual(this._width, currentWidth) ||
      !almostEqual(this._height, currentHeight)
    ) {
      this._view._children.forEach((view) =>
        view.elementReader.invalidatePageRect()
      )
    }

    if (
      !this._invalid &&
      this._currentPageRect &&
      this._offsetLeft === currentLeft &&
      this._offsetTop === currentTop &&
      almostEqual(this._width, currentWidth) &&
      almostEqual(this._height, currentHeight) &&
      almostEqual(this._parentWidth, currentParentWidth) &&
      almostEqual(this._parentHeight, currentParentHeight) &&
      this._parentEl === currentParentEl
    ) {
      return this._currentPageRect
    }
    this._offsetLeft = currentLeft
    this._offsetTop = currentTop
    this._width = currentWidth
    this._height = currentHeight
    this._parentWidth = currentParentWidth
    this._parentHeight = currentParentHeight
    this._parentEl = currentParentEl
    this._currentPageRect = getPageRect(this._element)
    this._invalid = false
    return this._currentPageRect
  }
}

export function createPageOffsetRectReader(view: CoreView) {
  return new PageOffsetRectReaderImpl(view)
}
