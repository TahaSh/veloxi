export interface ElementLayoutObserver {
  onChange(callback: (includeScroll: boolean) => void): void
  setElement(element: HTMLElement): void
}

class ElementObserverLayoutImpl implements ElementLayoutObserver {
  private _element: HTMLElement
  private _callback?: (includeScroll: boolean) => void

  constructor(element: HTMLElement) {
    this._element = element
    this._observe()
  }

  setElement(element: HTMLElement): void {
    this._element = element
    this._observe()
  }

  private _observe() {
    const observer = new MutationObserver(() => {
      this._callback?.(false)
    })

    const config = {
      attributes: true,
      childList: true,
      attributeOldValue: true
    }

    observer.observe(this._element, config)

    const resizeObserver = new ResizeObserver(() => {
      this._callback?.(true)
    })

    resizeObserver.observe(this._element)

    function debounce(cb: () => void, delay: number) {
      let timeout: number
      let initialCall = true
      return function () {
        if (initialCall) {
          cb()
          initialCall = false
        }
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          cb()
          initialCall = true
        }, delay)
      }
    }

    this._element.parentElement?.addEventListener(
      'scroll',
      debounce(() => {
        this._callback?.(true)
      }, 30)
    )
    window.addEventListener(
      'scroll',
      debounce(() => {
        this._callback?.(true)
      }, 30)
    )
    window.addEventListener(
      'resize',
      debounce(() => {
        this._callback?.(true)
      }, 30)
    )
  }

  onChange(callback: (includeScroll: boolean) => void): void {
    this._callback = callback
  }
}

export function createElementLayoutObserver(
  element: HTMLElement
): ElementLayoutObserver {
  return new ElementObserverLayoutImpl(element)
}
