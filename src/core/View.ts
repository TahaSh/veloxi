import { Vec2 } from '../math'
import {
  createElementLayoutObserver,
  ElementLayoutObserver
} from '../utils/ElementLayoutObserver'
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
  getChild(viewName: string): View
  getChildren(viewName: string): View[]
  getParent(viewName: string): View | undefined

  isLayoutTransitionEnabled: boolean
  position: ViewPosition
  opacity: ViewOpacity
  borderRadius: ViewBorderRadius
  size: ViewSize
  scale: ViewScale
  rotation: ViewRotation
  origin: ViewOrigin
}

type ViewDataProp = Record<string, string>

type LayoutOption = 'position' | 'size' | 'all'

interface OnAddCallback {
  afterRemoved?: boolean
  onInitialLoad?: boolean
  beforeEnter: (view: CoreView) => void
  afterEnter: (view: CoreView) => void
}

interface OnRemoveCallback {
  (view: CoreView, done: () => void): void
}

export class CoreView implements View {
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

  private _viewParents: CoreView[]

  private _temporaryView: boolean
  private _inverseEffect?: boolean
  private _renderNextTick: boolean

  private _layoutOption: LayoutOption

  private _elementObserver: ElementLayoutObserver
  private _hasReadElement: boolean
  private _shouldReadRect: boolean
  private _readWithScroll: boolean

  private _externalUserStyles: string

  constructor(
    element: HTMLElement,
    name: string,
    registry: Registry,
    layoutId?: string
  ) {
    this._registry = registry
    this.id = getUniqueId()
    this.name = name
    this.element = element
    this.element.dataset.velViewId = this.id
    this._elementReader = readElement(this)
    this._viewParents = this._getParents()
    this._previousRect = this._elementReader.rect
    this._viewProps = new ViewPropCollection(this)
    this._skipFirstRenderFrame = true
    this._layoutId = layoutId
    this._layoutTransition = false
    this._temporaryView = false
    this.styles = createProxy(this.styles, () => {
      this._renderNextTick = true
    })
    this._externalUserStyles = this._getExternalUserStyles()
    this._renderNextTick = false

    this._layoutOption = this._getLayoutOption()

    this._hasReadElement = false

    this._shouldReadRect = false
    this._readWithScroll = false
    this._elementObserver = createElementLayoutObserver(element)
    this._elementObserver.onChange((includeScroll) => {
      if (this._hasReadElement) {
        this._shouldReadRect = false
        return
      }
      this._externalUserStyles = this._getExternalUserStyles()
      this._shouldReadRect = true
      this._readWithScroll = includeScroll
    })
  }

  removeListeners() {
    this._elementObserver.destroy()
    this._elementReader.destroy()
  }

  destroy() {
    this.removeListeners()
    this._viewProps.allProps().forEach((prop) => prop.destroy())
    this.element.removeAttribute('data-vel-view-id')
    this.element.removeAttribute('data-vel-plugin-id')
    this._renderNextTick = true
  }

  get elementReader() {
    return this._elementReader
  }

  get layoutOption(): LayoutOption {
    return this._layoutOption
  }

  _getLayoutOption(): LayoutOption {
    const isPosition = !!this.element.closest('[data-vel-layout-position]')
    if (isPosition) {
      return 'position'
    }
    const isSize = this.element.closest('[data-vel-layout-size]')
    if (isSize) {
      return 'size'
    }
    return 'all'
  }

  setElement(element: HTMLElement) {
    this.element = element
    this._elementReader = readElement(this)
    this.element.dataset.velViewId = this.id
    this._elementObserver.setElement(element)
    this._viewParents = this._getParents()
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
    const children = this.element.querySelectorAll('*')
    const childViewIds = Array.from(children)
      .map((child) => (child as HTMLElement).dataset.velViewId!)
      .filter((id) => id && typeof id === 'string')
    return childViewIds
      .map((viewId) => this._registry.getViewById(viewId)!)
      .filter((view) => !!view)
  }

  get _parent(): CoreView | undefined {
    return this._parents[0]
  }

  get _parents(): CoreView[] {
    return this._viewParents
  }

  private _getParents(): CoreView[] {
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

  get _localWidth(): number {
    return this._viewProps.size.localWidth
  }

  get _localHeight(): number {
    return this._viewProps.size.localHeight
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
    let result = false
    for (let index = 0; index < this._parents.length; index++) {
      const parent = this._parents[index]
      if (typeof parent._inverseEffect !== 'undefined') {
        result = parent._inverseEffect
        break
      }
    }
    return result
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
    return this._elementReader.scroll
  }

  intersects(x: number, y: number): boolean {
    const rect = this.element.getBoundingClientRect()
    const position = {
      x: rect.left,
      y: rect.top
    }
    return (
      x >= position.x &&
      x <= position.x + rect.width &&
      y >= position.y &&
      y <= position.y + rect.height
    )
  }

  // Using AABB collision detection
  overlapsWith(view: View): boolean {
    const viewScaledWidth = (view as CoreView)._localWidth * view.scale.x
    const viewScaledHeight = (view as CoreView)._localHeight * view.scale.y
    const scaledWidth = this._localWidth * this.scale.x
    const scaledHeight = this._localHeight * this.scale.y

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
    if (this._shouldReadRect) {
      this._elementReader.update(this._readWithScroll)
      this._children.forEach((child) => {
        child.setHasReadElement(true)
        child.elementReader.update(this._readWithScroll)
      })
      this._shouldReadRect = false
      this._readWithScroll = false
    }
    this.setHasReadElement(false)
  }

  setHasReadElement(value: boolean) {
    this._hasReadElement = value
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

  _cleanCssText(cssText: string): string {
    const cleanedProperties = new Map()
    const regex = /([-\w]+)\s*:\s*([^;]+)\s*;?/g
    let match

    while ((match = regex.exec(cssText)) !== null) {
      const [_, name, value] = match
      if (!value.trim()) continue // Skip if value is empty

      const unprefixedName = name.replace(/^-\w+-/, '')
      if (!cleanedProperties.has(unprefixedName) || !name.startsWith('-')) {
        cleanedProperties.set(
          unprefixedName,
          `${unprefixedName}: ${value.trim()}`
        )
      }
    }

    return Array.from(cleanedProperties.values()).join('; ')
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
        if (index < transformProps.length - 1) {
          result += ' '
        }
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

    if (
      this._cleanCssText(this.element.style.cssText) !==
      this._cleanCssText(styles)
    ) {
      this.element.style.cssText = styles
    }

    this._renderNextTick = false
  }

  private _getExternalUserStyles(): string {
    const cssText = this.element.style.cssText
    const styles = this.styles
    if (cssText.length === 0) {
      return ''
    }

    const stylesToExclude = [
      'transform',
      'transform-origin',
      'opacity',
      'width',
      'height',
      'border-radius'
    ]

    const stylesKebab: any = {}
    for (const key in styles) {
      if (styles.hasOwnProperty(key)) {
        stylesKebab[toKebabCase(key)] = styles[key]
      }
    }

    const declarations = cssText
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)

    const filteredDeclarations = declarations.filter((declaration) => {
      const colonIndex = declaration.indexOf(':')
      if (colonIndex === -1) return false
      const key = declaration.slice(0, colonIndex).trim()
      return !stylesKebab.hasOwnProperty(key) && !stylesToExclude.includes(key)
    })

    const styleString = filteredDeclarations.join('; ')

    return styleString
  }

  private _getUserStyles(): string {
    return Object.keys(this.styles).reduce((result, styleProp) => {
      if (!styleProp) return result
      const propName = toKebabCase(styleProp)
        .replace('webkit', '-webkit')
        .replace('moz', '-moz')
      return (
        result +
        `${propName}: ${this.styles[styleProp as keyof CSSStyleDeclaration]}; `
      )
    }, this._externalUserStyles)
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

  public getChildren(viewName: string): View[] {
    const children = this.element.querySelectorAll('*')
    const viewIds = Array.from(children)
      .filter((child) => {
        const childEl = child as HTMLElement
        return (
          typeof childEl.dataset.velViewId !== 'undefined' &&
          childEl.dataset.velView === viewName
        )
      })
      .map((child) => (child as HTMLElement).dataset.velViewId!)
    return this._registry.getViewsById(viewIds)
  }

  public getChild(viewName: string): View {
    return this.getChildren(viewName)[0]
  }

  public getParent(viewName: string): View | undefined {
    const parentElement = this.element.closest(
      `[data-vel-view="${viewName}"]`
    ) as HTMLElement
    if (!parentElement) return
    const viewId = parentElement.dataset.velViewId
    if (!viewId) return
    return this._registry.getViewById(viewId)
  }
}
