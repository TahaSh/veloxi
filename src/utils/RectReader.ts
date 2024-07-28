import { PageOffsetRectReader } from './PageOffsetRectReader'

export interface RectSize {
  width: number
  height: number
}

export interface PageRect {
  left: number
  top: number
}

export interface ViewRect {
  viewportOffset: {
    left: number
    top: number
    right: number
    bottom: number
  }
  pageOffset: PageRect
  size: RectSize
}

export function readRect(
  element: HTMLElement,
  pageRectReader: PageOffsetRectReader
): ViewRect {
  const viewportRect = getViewportRect(element)
  const layoutWidth = element.offsetWidth
  const layoutHeight = element.offsetHeight

  return {
    viewportOffset: {
      left: Math.round(viewportRect.left),
      top: Math.round(viewportRect.top),
      right: Math.round(viewportRect.right),
      bottom: Math.round(viewportRect.bottom)
    },

    pageOffset: pageRectReader.read({
      width: layoutWidth,
      height: layoutHeight
    }),

    size: {
      width: layoutWidth,
      height: layoutHeight
    }
  }
}

function getViewportRect(element: HTMLElement) {
  const clientRect = element.getBoundingClientRect()
  return {
    left: clientRect.left,
    top: clientRect.top,
    right: clientRect.right,
    bottom: clientRect.bottom,
    width: clientRect.width,
    height: clientRect.height
  }
}

export function getPageRect(element: HTMLElement): PageRect {
  let current = element
  let top = 0
  let left = 0

  while (current) {
    top += current.offsetTop
    left += current.offsetLeft

    current = current.offsetParent as HTMLElement
  }

  return { top, left }
}
