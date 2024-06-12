import { Vec2 } from '../math'
import { ElementReader, readElement } from '../utils/ElementReader'
import { createProxy } from '../utils/ObjectProxy'
import { ViewRect } from '../utils/RectReader'
import { toKebabCase } from '../utils/String'
import { getUniqueId } from '../utils/uniqueId'
import { ViewPropCollection } from '../view-props'
import { ViewBorderRadius } from '../view-props/BorderRadiusProp'
import { ViewOpacity } from '../view-props/OpacityProp'
import { ViewOrigin } from '../view-props/OriginProp'
import { ViewPosition } from '../view-props/PositionProp'
import { ViewRotation } from '../view-props/RotationProp'
import { ScaleProp, ViewScale } from '../view-props/ScaleProp'
import { ViewSize } from '../view-props/SizeProp'
import { IViewProp } from '../view-props/ViewProp'
import { ViewPropName } from '../view-props/ViewPropCollection'
import { Point } from '../view-props/types'
import { LayoutId, Registry, ViewId } from './Registry'

export interface View {
  id: ViewId
  name: string
  data: ViewDataProp
  element: HTMLElement
  styles: Partial<Record<keyof CSSStyleDeclaration, string>>

  distanceTo(view: View): number
  onAdd(callback: OnAddCallback): void
  onRemove(callback: OnRemoveCallback): void
  layoutTransition(enabled: boolean): void
  inverseEffect(enabled: boolean): void
  getScroll(): Point
  overlapsWith(view: View): boolean
  intersects(x: number, y: number): boolean
  hasElement(element: HTMLElement): boolean

  position: ViewPosition
  opacity: ViewOpacity
  borderRadius: ViewBorderRadius
  size: ViewSize
  scale: ViewScale
  rotation: ViewRotation
  origin: ViewOrigin
}

type ViewDataProp = Record<string, string>

interface OnAddCallback {
  afterRemoved?: boolean
  onInitialLoad?: boolean
  beforeEnter: (view: CoreView) => void
  afterEnter: (view: CoreView) => void
}

interface OnRemoveCallback {
  (view: CoreView, done: () => void): void
}

export class CoreView {
  readonly id: string
  name: string
  element: HTMLElement
  styles: Partial<Record<keyof CSSStyleDeclaration, string>> = {}

  private _viewProps: ViewPropCollection

  private _previousRect: ViewRect

  private _onAddCallbacks: OnAddCallback | undefined
  private _onRemoveCallback: OnRemoveCallback | undefined

  private _skipFirstRenderFrame: boolean

  private _layoutTransition: boolean

  private _registry: Registry

  private _layoutId: LayoutId | undefined
  private _elementReader: ElementReader

  private _temporaryView: boolean
  private _inverseEffect: boolean
  private _renderNextTick: boolean

  constructor(element: HTMLElement, name: string, registry: Registry) {
    this.id = getUniqueId()
    this.name = name
    this.element = element
    this._elementReader = readElement(element)
    this._previousRect = this._elementReader.rect
    this._viewProps = new ViewPropCollection(this)
    this._skipFirstRenderFrame = true
    this._layoutId = element.dataset.velLayoutId
    this._layoutTransition = false
    this._registry = registry
    this.element.dataset.velViewId = this.id
    this._temporaryView = false
    this._inverseEffect = false
    this.styles = createProxy(this.styles, () => {
      this._renderNextTick = true
    })
    this._renderNextTick = false
  }

  destroy() {
    this.element.removeAttribute('data-vel-view-id')
    this.element.removeAttribute('data-vel-plugin-id')
  }

  get elementReader() {
    return this._elementReader
  }

  setElement(element: HTMLElement) {
    this.element = element
    this._elementReader = readElement(this.element)
    this.element.dataset.velViewId = this.id
  }

  get layoutId() {
    return this._layoutId
  }

  get position(): ViewPosition {
    return this._viewProps.position
  }

  get scale(): ScaleProp {
    return this._viewProps.scale
  }

  get _children(): CoreView[] {
    const childViewIds = Array.from(this.element.children)
      .map((child) => (child as HTMLElement).dataset.velViewId!)
      .filter((id) => id && typeof id === 'string')
    return childViewIds
      .map((viewId) => this._registry.getViewById(viewId)!)
      .filter((view) => !!view)
  }

  get _parent(): CoreView | undefined {
    const parent = this.element.parentElement as HTMLElement
    if (!parent) return undefined
    const closestParent = parent.closest('[data-vel-view-id]') as HTMLElement
    if (!closestParent?.dataset?.velViewId) return undefined
    return this._registry.getViewById(closestParent.dataset.velViewId)
  }

  get _parents(): CoreView[] {
    const parents: CoreView[] = []
    let parent = this.element.parentElement as HTMLElement
    if (!parent) return parents
    parent = parent.closest('[data-vel-view-id]') as HTMLElement
    while (parent) {
      const viewId = parent.dataset.velViewId
      if (viewId) {
        const parentView = this._registry.getViewById(viewId)
        if (parentView) {
          parents.push(parentView)
        }
      }
      parent = parent.parentElement?.closest(
        '[data-vel-view-id]'
      ) as HTMLElement
    }
    return parents
  }

  get rotation(): ViewRotation {
    return this._viewProps.rotation
  }

  get size(): ViewSize {
    return this._viewProps.size
  }

  get opacity(): ViewOpacity {
    return this._viewProps.opacity
  }

  get borderRadius(): ViewBorderRadius {
    return this._viewProps.borderRadius
  }

  get origin(): ViewOrigin {
    return this._viewProps.origin
  }

  get data(): ViewDataProp {
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

  get onAddCallbacks() {
    return this._onAddCallbacks
  }

  get onRemoveCallback() {
    return this._onRemoveCallback
  }

  get isLayoutTransitionEnabled() {
    return this._layoutTransition
  }

  get hasLayoutTransitionEnabledForParents() {
    return this._parents.some((parent) => parent.isLayoutTransitionEnabled)
  }

  get isInverseEffectEnabled(): boolean {
    return this._parents.some((parent) => parent._inverseEffect)
  }

  layoutTransition(enabled: boolean): void {
    this._layoutTransition = enabled
    this.inverseEffect(enabled)
  }

  inverseEffect(enabled: boolean) {
    this._inverseEffect = enabled
    if (enabled) {
      this._children.forEach((child) => {
        if (child.position.animator.name === 'instant') {
          const positionAnimator = this.viewProps.position.getAnimator()
          child.position.setAnimator(
            positionAnimator.name,
            positionAnimator.config
          )
        }
        if (child.scale.animator.name === 'instant') {
          const scaleAnimator = this.viewProps.scale.getAnimator()
          child.scale.setAnimator(scaleAnimator.name, scaleAnimator.config)
        }
      })
    }
  }

  setAnimatorsFromParent() {
    let parent: CoreView | undefined = this._parent
    while (parent) {
      if (parent._inverseEffect) {
        break
      }
      parent = parent._parent
    }
    if (!parent) {
      return
    }

    if (this.position.animator.name === 'instant') {
      const positionAnimator = parent.viewProps.position.getAnimator()
      this.position.setAnimator(positionAnimator.name, positionAnimator.config)
    }
    if (this.scale.animator.name === 'instant') {
      const scaleAnimator = parent.viewProps.scale.getAnimator()
      this.scale.setAnimator(scaleAnimator.name, scaleAnimator.config)
    }
  }

  get _isRemoved() {
    return !this._registry.getViewById(this.id)
  }

  setPluginId(id: string) {
    this.element.dataset.velPluginId = id
  }

  hasElement(element: HTMLElement): boolean {
    return this.element.contains(element)
  }

  getScroll(): Point {
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
      x <= position.x + this.size.widthAfterScale &&
      y >= position.y &&
      y <= position.y + this.size.heightAfterScale
    )
  }

  // Using AABB collision detection
  overlapsWith(view: View): boolean {
    const viewScaledWidth = view.size.width * view.scale.x
    const viewScaledHeight = view.size.height * view.scale.y
    const scaledWidth = this.size.width * this.scale.x
    const scaledHeight = this.size.height * this.scale.y

    return (
      this.position.x < view.position.x + viewScaledWidth &&
      this.position.x + scaledWidth > view.position.x &&
      this.position.y < view.position.y + viewScaledHeight &&
      this.position.y + scaledHeight > view.position.y
    )
  }

  distanceTo(view: View): number {
    const aPosition = new Vec2(this.position.x, this.position.y)
    const bPosition = new Vec2(view.position.x, view.position.y)
    return Vec2.sub(bPosition, aPosition).magnitude
  }

  read() {
    this._elementReader = readElement(this.element)
  }

  get rect() {
    return this._elementReader.rect
  }

  get previousRect() {
    return this._previousRect
  }

  update(ts: number, dt: number) {
    this._viewProps.allProps().forEach((prop) => prop.update(ts, dt))
  }

  _updatePreviousRect() {
    this._previousRect = this._elementReader.rect
  }

  setAsTemporaryView() {
    this._temporaryView = true
  }

  get isTemporaryView() {
    return this._temporaryView
  }

  get shouldRender() {
    return (
      this._renderNextTick ||
      this._viewProps.allProps().some((prop) => prop.shouldRender)
    )
  }

  render() {
    if (!this.shouldRender) {
      return
    }
    // If we are rendering a removed view, which is a temporary view
    // we are showing for animation, then skip the first render frame.
    // We need to do this to prevent some glitching because the temp view
    // contains some initial styles to remove it from the layout flow,
    // like position: absolute.
    if (this._isRemoved && this._skipFirstRenderFrame) {
      this._skipFirstRenderFrame = false
      return
    }

    let styles = ''

    const allProps = this._viewProps.allProps()
    const transformProps = allProps.filter((prop) => prop.isTransform())
    const nonTransformProps = allProps.filter((prop) => !prop.isTransform())

    if (transformProps.some((prop) => prop.hasChanged())) {
      const transformStyle = transformProps.reduce((result, prop, index) => {
        result += prop.projectStyles()
        if (index === transformProps.length - 1) {
          result += ';'
        }
        return result
      }, 'transform: ')

      styles += transformStyle
    }

    nonTransformProps.forEach((prop) => {
      if (prop.hasChanged()) {
        styles += prop.projectStyles()
      }
    })

    styles += this._getUserStyles()

    this.element.style.cssText = styles

    this._renderNextTick = false
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

  onAdd(callback: OnAddCallback): void {
    this._onAddCallbacks = callback
  }

  onRemove(callback: OnRemoveCallback): void {
    this._onRemoveCallback = callback
  }

  get viewProps() {
    return this._viewProps
  }

  getPropByName(propName: ViewPropName): IViewProp | undefined {
    return this._viewProps.getPropByName(propName)
  }

  public _copyAnimatorsToAnotherView(view: CoreView) {
    view.viewProps.allPropNames().forEach((propName) => {
      const animator = this.viewProps.getPropByName(propName)?.getAnimator()
      if (animator) {
        view.viewProps
          .getPropByName(propName)
          ?.setAnimator(animator.name, animator.config)
      }
    })
  }
}
