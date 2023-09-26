import { Vec2 } from '../math'
import { ViewRect, readRect } from '../utils/RectReader'
import { toKebabCase } from '../utils/String'
import { getUniqueId } from '../utils/uniqueId'
import { ViewPropCollection } from '../view-props'
import { PositionProp } from '../view-props/PositionProp'
import { RotationProp } from '../view-props/RotationProp'
import { ScaleProp } from '../view-props/ScaleProp'
import { SizeProp } from '../view-props/SizeProp'

export class View {
  readonly id: string
  name: string
  element: HTMLElement
  styles: Partial<Record<keyof CSSStyleDeclaration, string>> = {}

  private _viewProps: ViewPropCollection

  private _rect: ViewRect

  constructor(element: HTMLElement, name: string) {
    this.id = getUniqueId()
    this.name = name
    this.element = element
    this._rect = readRect(this.element)
    this._viewProps = new ViewPropCollection(this)

    this.element.dataset.velViewId = this.id
  }

  get position(): PositionProp {
    return this._viewProps.position
  }

  get scale(): ScaleProp {
    return this._viewProps.scale
  }

  get rotation(): RotationProp {
    return this._viewProps.rotation
  }

  get size(): SizeProp {
    return this._viewProps.size
  }

  get data(): Record<string, string> {
    const dataset = this.element.dataset
    const keys = Object.keys(dataset).filter((k) => k.includes('velData'))
    const fieldKeys = keys
      .map((key) => key.replace('velData', ''))
      .map((key) => `${key[0].toLowerCase()}${key.slice(1)}`)
    return fieldKeys.reduce<Record<string, any>>((result, fieldKey) => {
      const value =
        dataset[`velData${fieldKey[0].toUpperCase()}${fieldKey.slice(1)}`]!
      if (!result[fieldKey] && value) {
        result[fieldKey] = value
      }
      return result
    }, {})
  }

  setPluginId(id: string) {
    this.element.dataset.velPluginId = id
  }

  hasElement(element: HTMLElement): boolean {
    return this.element.contains(element)
  }

  getScroll() {
    let current = this.element
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

  intersects(x: number, y: number): boolean {
    const currentScroll = this.getScroll()
    const position = {
      x: this.position.x - currentScroll.x,
      y: this.position.y - currentScroll.y
    }
    return (
      x >= position.x &&
      x <= position.x + this.size.width &&
      y >= position.y &&
      y <= position.y + this.size.height
    )
  }

  // Using AABB collision detection
  overlapsWith(view: View): boolean {
    return (
      this.position.x < view.position.x + view.size.width &&
      this.position.x + this.size.width > view.position.x &&
      this.position.y < view.position.y + view.size.height &&
      this.position.y + this.size.height > view.position.y
    )
  }

  distanceTo(view: View): number {
    const aPosition = new Vec2(this.position.x, this.position.y)
    const bPosition = new Vec2(view.position.x, view.position.y)
    return Vec2.sub(bPosition, aPosition).magnitude
  }

  read() {
    this._rect = readRect(this.element)
  }

  get rect() {
    return this._rect
  }

  update(ts: number, dt: number) {
    this._viewProps.allProps().forEach((prop) => prop.update(ts, dt))
  }

  render() {
    let styles = ''

    const allProps = this._viewProps.allProps()
    const transformProps = allProps.filter((prop) => prop.isTransform())
    const nonTransformProps = allProps.filter((prop) => !prop.isTransform())

    const transformStyle = transformProps.reduce((result, prop, index) => {
      result += prop.projectStyles()
      if (index === transformProps.length - 1) {
        result += ';'
      }
      return result
    }, 'transform: ')

    styles += transformStyle

    nonTransformProps.forEach((prop) => {
      if (prop.hasChanged()) {
        styles += prop.projectStyles()
      }
    })

    styles += this._getUserStyles()

    this.element.style.cssText = styles
  }

  private _getUserStyles(): string {
    return Object.keys(this.styles).reduce((result, styleProp) => {
      if (!styleProp) return result
      return (
        result +
        `${toKebabCase(styleProp)}: ${
          this.styles[styleProp as keyof CSSStyleDeclaration]
        };`
      )
    }, '')
  }

  markAsAdded() {
    delete this.element.dataset.velProcessing
  }
}
