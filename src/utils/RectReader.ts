export interface ViewRect {
  viewportOffset: {
    left: number
    top: number
    right: number
    bottom: number
  }
  pageOffset: {
    left: number
    top: number
  }
  size: {
    width: number
    height: number
  }
}

export function readRect(element: HTMLElement): ViewRect {
  const viewportRect = getViewportRect(element)
  const pageRect = getPageRect(element)

  return {
    viewportOffset: {
      left: Math.round(viewportRect.left),
      top: Math.round(viewportRect.top),
      right: Math.round(viewportRect.right),
      bottom: Math.round(viewportRect.bottom)
    },

    pageOffset: {
      top: pageRect.top,
      left: pageRect.left
    },

    size: {
      width: element.offsetWidth,
      height: element.offsetHeight
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

function getPageRect(element: HTMLElement) {
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
