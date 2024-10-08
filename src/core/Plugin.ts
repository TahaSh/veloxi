import { getUniqueId } from '../utils/uniqueId'
import { EventBus } from './EventBus'
import { LayoutId, Registry } from './Registry'
import { CoreView, View } from './View'

export type PluginConfig = Record<string, any>
export type PluginApi = Record<string, any>

export interface ChangedData {
  dataName: string
  dataValue: string
  viewName: string
}

// ************************************************************
// ** Plugin Factory Types
// ************************************************************

interface PluginFactoryStaticFields {
  pluginName: string
  scope?: string
}

interface PluginClassFactory<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> extends PluginFactoryStaticFields {
  new (
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    pluginName: string,
    registry: Registry,
    eventBus: EventBus,
    appEventBus: EventBus,
    config: TConfig,
    pluginKey?: string
  ): IPlugin<TConfig, TPluginApi>
}

interface PluginFunctionFactory<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> extends PluginFactoryStaticFields {
  (context: PluginContext<TConfig, TPluginApi>): void
}

export type PluginFactory<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> =
  | PluginClassFactory<TConfig, TPluginApi>
  | PluginFunctionFactory<TConfig, TPluginApi>

// ************************************************************
// ** Plugin
// ************************************************************

export abstract class IPlugin<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> {
  private _registry: Registry
  private _eventBus: EventBus
  private _appEventBus: EventBus
  private _internalEventBus: EventBus
  protected _initialized = false
  private readonly _config: TConfig
  private readonly _pluginFactory: PluginFactory<TConfig, TPluginApi>
  private readonly _pluginName: string
  private readonly _id: string
  private readonly _pluginKey?: string
  private _layoutIdViewMapWaitingToEnter: Map<LayoutId, CoreView>
  private _apiData: TPluginApi
  private _isReady = false

  constructor(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    pluginName: string,
    registry: Registry,
    eventBus: EventBus,
    appEventBus: EventBus,
    config: TConfig,
    pluginKey?: string
  ) {
    this._id = getUniqueId()
    this._pluginFactory = pluginFactory
    this._pluginName = pluginName
    this._registry = registry
    this._eventBus = eventBus
    this._appEventBus = appEventBus
    this._internalEventBus = new EventBus()
    this._config = config
    this._layoutIdViewMapWaitingToEnter = new Map()
    this._pluginKey = pluginKey
    this._apiData = {} as TPluginApi

    this._appEventBus.subscribeToPluginReadyEvent(
      () => {
        this._isReady = true
      },
      this._pluginName,
      true
    )
  }

  get api(): TPluginApi {
    return this._apiData as TPluginApi
  }

  _setApi(data: TPluginApi) {
    this._apiData = data
  }

  get pluginName() {
    return this._pluginName
  }

  get pluginFactory() {
    return this._pluginFactory
  }

  get pluginKey() {
    return this._pluginKey
  }

  get id() {
    return this._id
  }

  get config(): TConfig {
    return { ...this._config }
  }

  getViews(viewName?: string): Array<View> {
    if (!viewName) return this._registry.getViewsForPlugin(this)

    return this._registry.getViewsByNameForPlugin(this, viewName)
  }

  getView(viewName?: string): View | undefined {
    if (!viewName) return this._registry.getViewsForPlugin(this)[0]

    const views = this._registry.getViewsByNameForPlugin(this, viewName)
    return views[0]
  }

  getViewById(viewId: string): View | undefined {
    return this._registry.getViewById(viewId)
  }

  addView(view: View) {
    this._registry.assignViewToPlugin(view, this)
  }

  setInternalEventBus(eventBus: EventBus): void {
    this._internalEventBus = eventBus
  }

  get internalBusEvent() {
    return this._internalEventBus
  }

  emit<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    eventData: TEvent
  ): void {
    this._internalEventBus.emitEvent(eventCtor, eventData, this.pluginKey)
  }

  on<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    this._internalEventBus.subscribeToEvent(eventCtor, listener, this.pluginKey)
  }

  removeListener<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    this._internalEventBus.removeEventListener(eventCtor, listener)
  }

  useEventPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config: TConfig = {} as TConfig
  ): EventPlugin<TConfig, TPluginApi> {
    const plugin = this._registry.createPlugin<TConfig, TPluginApi>(
      pluginFactory,
      this._eventBus,
      config
    )
    this._registry.associateEventPluginWithPlugin(this.id, plugin.id)
    return plugin
  }

  notifyAboutDataChanged(data: ChangedData) {
    this.onDataChanged(data)
  }

  // @ts-ignore
  onDataChanged(data: ChangedData) {}

  removeView(view: CoreView) {
    if (view.onRemoveCallback) {
      this._invokeRemoveCallback(view)
    } else {
      this._deleteView(view)
    }
    this.onViewRemoved(view)
  }

  private _invokeRemoveCallback(view: CoreView) {
    // For remove animation
    const tempView = this._createTemporaryView(view)
    requestAnimationFrame(() => {
      tempView.onRemoveCallback?.(tempView, () => {
        // This is the done() callback.
        // When the user calls it, it means the animation finished
        // and we can remove the view and the element.
        if (view.onAddCallbacks?.afterRemoved && view.layoutId) {
          const viewWaitingToEnter = this._layoutIdViewMapWaitingToEnter.get(
            view.layoutId
          )
          viewWaitingToEnter?.onAddCallbacks?.afterEnter(viewWaitingToEnter)
          this._layoutIdViewMapWaitingToEnter.delete(view.layoutId)
        }
        this._deleteView(tempView, true)
        view.removeListeners()
      })
      setTimeout(() => {
        // If after 10s done() was not called, delete the item manually
        if (tempView.element.parentElement) {
          this._deleteView(tempView, true)
          view.removeListeners()
        }
      }, 10000)
    })
  }

  private _deleteView(view: CoreView, force = false) {
    if (force || !view.layoutId) {
      this._registry.removeViewById(view.id, this.id)
      view.element.remove()
      view.destroy()
    }
  }

  // This is a temporary view for deleted view. We need to create it
  // to show it again so the user can animate it before it disappears.
  private _createTemporaryView(view: CoreView) {
    const prevRect = view.previousRect.viewportOffset
    const prevSize = view.previousRect.size

    const rotationOffsetX =
      view.rotation.degrees < 0
        ? 0
        : Math.sin(view.rotation.radians) * prevSize.height * view.scale.y

    const rotationOffsetY =
      view.rotation.degrees > 0
        ? 0
        : Math.sin(view.rotation.radians) * prevSize.width * view.scale.y

    // Re-insert the removed element but to the body tag this time.
    // We converted it to `position: absolute` so it's removed from the layout flow.
    // That's why we also needed to set left and top.
    const element = view.element.cloneNode(true) as HTMLElement
    view.element.remove()
    element.style.cssText = ''
    element.style.position = 'absolute'
    element.style.left = `${prevRect.left + rotationOffsetX}px`
    element.style.top = `${prevRect.top - rotationOffsetY}px`
    element.style.width = `${prevSize.width}px`
    element.style.height = `${prevSize.height}px`
    element.style.transform = `
      scale3d(${view.scale.x}, ${view.scale.y}, 1) rotate(${view.rotation.degrees}deg)
    `
    element.style.pointerEvents = 'none'
    element.dataset.velRemoved = ''
    document.body.appendChild(element)

    const tempView = this._registry.createView(element, view.name)
    tempView.setAsTemporaryView()
    tempView.styles.position = 'absolute'
    tempView.styles.left = `${prevRect.left + rotationOffsetX}px`
    tempView.styles.top = `${prevRect.top - rotationOffsetY}px`
    tempView.rotation.setDegrees(view.rotation.degrees, false)
    tempView.scale.set({ x: view.scale.x, y: view.scale.y }, false)
    tempView.size.set(
      { width: view._localWidth, height: view._localHeight },
      false
    )
    view._copyAnimatorsToAnotherView(tempView)

    if (view.onRemoveCallback) {
      tempView.onRemove(view.onRemoveCallback)
    }
    return tempView
  }

  // @ts-ignore
  onViewRemoved(view: CoreView) {}

  notifyAboutViewAdded(view: CoreView) {
    this.onViewAdded(view)
    this._invokeAddCallbacks(view)
  }

  private _invokeAddCallbacks(view: CoreView) {
    if (!view.onAddCallbacks?.onInitialLoad && !this._initialized) {
      return
    }
    view.onAddCallbacks?.beforeEnter(view)
    if (!view.onAddCallbacks?.afterRemoved || !this._initialized) {
      requestAnimationFrame(() => {
        view.onAddCallbacks?.afterEnter(view)
      })
    } else if (view.layoutId) {
      this._layoutIdViewMapWaitingToEnter.set(view.layoutId, view)
    }
  }

  // @ts-ignore
  onViewAdded(view: CoreView) {}

  init() {
    if (!this._initialized && this._isReady) {
      this.setup()
      this._initialized = true
    }
  }

  setup(): void {}

  // @ts-ignore
  subscribeToEvents(eventBus: EventBus) {}

  abstract isRenderable(): boolean
}

export class Plugin<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> extends IPlugin<TConfig, TPluginApi> {
  isRenderable(): boolean {
    return true
  }
  isInitialized(): boolean {
    return this._initialized
  }
  get initialized() {
    return this._initialized
  }
  // @ts-ignore
  update(ts: number, dt: number) {}

  render() {}

  addView(view: CoreView): void {
    view.setPluginId(this.id)
    super.addView(view)
  }
}

export class EventPlugin<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> extends IPlugin<TConfig, TPluginApi> {
  isRenderable(): boolean {
    return false
  }
}

// ************************************************************
// ** Plugin Context
// ************************************************************

export class PluginContext<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
> {
  private _plugin: Plugin<TConfig, TPluginApi>

  constructor(plugin: Plugin<TConfig, TPluginApi>) {
    this._plugin = plugin
  }

  get initialized() {
    return this._plugin.isInitialized()
  }

  get config(): TConfig {
    return this._plugin.config
  }

  setup(callback: () => void) {
    this._plugin.setup = callback
  }

  api(data: TPluginApi) {
    this._plugin._setApi(data)
  }

  update(callback: (ts: number, dt: number) => void) {
    this._plugin.update = callback
  }

  render(callback: () => void) {
    this._plugin.render = callback
  }

  getViews(viewName: string): Array<View> {
    return this._plugin.getViews(viewName)
  }

  getView(viewName: string): View | undefined {
    return this._plugin.getView(viewName)
  }

  getViewById(viewId: string): View | undefined {
    return this._plugin.getViewById(viewId)
  }

  useEventPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config: TConfig = {} as TConfig
  ) {
    return this._plugin.useEventPlugin(pluginFactory, config)
  }

  emit<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    eventData: TEvent
  ): void {
    this._plugin.emit(eventCtor, eventData)
  }

  on<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    this._plugin.on(eventCtor, listener)
  }

  onDataChanged(callback: (data: ChangedData) => void) {
    this._plugin.onDataChanged = callback
  }

  onViewRemoved(callback: (view: View) => void) {
    this._plugin.onViewRemoved = callback
  }

  onViewAdded(callback: (view: View) => void) {
    this._plugin.onViewAdded = callback
  }

  subscribeToEvents(callback: (eventBus: EventBus) => void) {
    this._plugin.subscribeToEvents = callback
  }
}

// ************************************************************
// ** Plugin Factory
// ************************************************************

export function createPlugin<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
>(
  pluginFactory: PluginFactory<TConfig, TPluginApi>,
  registry: Registry,
  eventBus: EventBus,
  appEventBus: EventBus,
  config: TConfig,
  pluginKey?: string
): IPlugin<TConfig, TPluginApi> {
  if (isClassConstructor(pluginFactory)) {
    return new pluginFactory(
      pluginFactory,
      pluginFactory.pluginName,
      registry,
      eventBus,
      appEventBus,
      config,
      pluginKey
    )
  }

  const plugin = new Plugin(
    pluginFactory,
    pluginFactory.pluginName,
    registry,
    eventBus,
    appEventBus,
    config,
    pluginKey
  )
  const context = new PluginContext(plugin)
  pluginFactory(context)
  return plugin
}

function isClassConstructor<
  TConfig extends PluginConfig = PluginConfig,
  TPluginApi extends PluginApi = PluginApi
>(
  pluginFactory: PluginFactory<TConfig, TPluginApi>
): pluginFactory is PluginClassFactory<TConfig, TPluginApi> {
  return pluginFactory.prototype?.constructor.toString().indexOf('class ') === 0
}
