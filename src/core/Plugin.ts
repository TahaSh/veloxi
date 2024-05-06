import { EventBus, View } from '..'
import { getUniqueId } from '../utils/uniqueId'
import { Registry } from './Registry'

export type PluginConfig = Record<string, any>

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

interface PluginClassFactory<TConfig extends PluginConfig = PluginConfig>
  extends PluginFactoryStaticFields {
  new (
    pluginName: string,
    registry: Registry,
    eventBus: EventBus,
    config: TConfig
  ): IPlugin<TConfig>
}

interface PluginFunctionFactory<TConfig extends PluginConfig = PluginConfig>
  extends PluginFactoryStaticFields {
  (context: PluginContext<TConfig>): void
}

export type PluginFactory<TConfig extends PluginConfig = PluginConfig> =
  | PluginClassFactory<TConfig>
  | PluginFunctionFactory<TConfig>

// ************************************************************
// ** Plugin
// ************************************************************

export abstract class IPlugin<TConfig extends PluginConfig = PluginConfig> {
  private _registry: Registry
  private _eventBus: EventBus
  private _internalEventBus: EventBus
  protected _initialized = false
  private readonly _config: TConfig
  private readonly _pluginName: string
  private readonly _id: string

  constructor(
    pluginName: string,
    registry: Registry,
    eventBus: EventBus,
    config: TConfig
  ) {
    this._id = getUniqueId()
    this._pluginName = pluginName
    this._registry = registry
    this._eventBus = eventBus
    this._internalEventBus = new EventBus()
    this._config = config
  }

  get pluginName() {
    return this._pluginName
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
    this._registry.addViewToPlugin(view, this)
  }

  emit<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    eventData: TEvent
  ): void {
    this._internalEventBus.emitEvent(eventCtor, eventData)
  }

  on<TEvent>(
    eventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    this._internalEventBus.subscribeToEvent(eventCtor, listener)
  }

  useEventPlugin<TConfig extends PluginConfig>(
    pluginFactory: PluginFactory<TConfig>,
    config: TConfig = {} as TConfig
  ): EventPlugin {
    const plugin = this._registry.createPlugin<TConfig>(
      pluginFactory,
      this._eventBus,
      config
    )
    return plugin
  }

  notifyAboutDataChanged(data: ChangedData) {
    this.onDataChanged(data)
  }

  // @ts-ignore
  onDataChanged(data: ChangedData) {}

  notifyAboutViewRemoved(view: View) {
    this.onViewRemoved(view)

    if (view.onRemoveCallback) {
      this._invokeRemoveCallback(view)
    }
  }

  private _invokeRemoveCallback(view: View) {
    // For remove animation
    const tempView = this._createTemporaryView(view)
    requestAnimationFrame(() => {
      tempView.onRemoveCallback?.(tempView, () => {
        // This is the done() callback.
        // When the user calls it, it means the animation finished
        // and we can remove the view and the element.
        this._deleteView(tempView)
      })
      setTimeout(() => {
        // If after 10s done() was not called, delete the item manually
        if (tempView.element.parentElement) {
          this._deleteView(tempView)
        }
      }, 10000)
    })
  }

  private _deleteView(view: View) {
    this._registry.removeViewById(view.id)
    view.element.remove()
  }

  // This is a temporary view for deleted view. We need to create it
  // to show it again so the user can animate it before it disappears.
  private _createTemporaryView(view: View) {
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
    const element = view.element
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
    tempView.styles.position = 'absolute'
    tempView.styles.left = `${prevRect.left + rotationOffsetX}px`
    tempView.styles.top = `${prevRect.top - rotationOffsetY}px`
    tempView.rotation.setDegrees(view.rotation.degrees, false)
    tempView.scale.set({ x: view.scale.x, y: view.scale.y }, false)
    tempView.size.set(
      { width: view.size.width, height: view.size.height },
      false
    )
    view._copyAnimatorsToAnotherView(tempView)

    if (view.onRemoveCallback) {
      tempView.onRemove(view.onRemoveCallback)
    }
    return tempView
  }

  // @ts-ignore
  onViewRemoved(view: View) {}

  notifyAboutViewAdded(view: View) {
    this.onViewAdded(view)
    this._invokeAddCallbacks(view)
  }

  private _invokeAddCallbacks(view: View) {
    view.onAddCallbacks?.beforeEnter(view)
    requestAnimationFrame(() => {
      view.onAddCallbacks?.afterEnter(view)
    })
  }

  // @ts-ignore
  onViewAdded(view: View) {}

  init() {
    if (!this._initialized) {
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
  TConfig extends PluginConfig = PluginConfig
> extends IPlugin<TConfig> {
  isRenderable(): boolean {
    return true
  }
  isInitialized(): boolean {
    return this._initialized
  }
  // @ts-ignore
  update(ts: number, dt: number) {}

  render() {}

  addView(view: View): void {
    view.setPluginId(this.id)
    super.addView(view)
  }
}

export class EventPlugin<
  TConfig extends PluginConfig = PluginConfig
> extends IPlugin<TConfig> {
  isRenderable(): boolean {
    return false
  }
}

// ************************************************************
// ** Plugin Context
// ************************************************************

export class PluginContext<TConfig extends PluginConfig = PluginConfig> {
  private _plugin: Plugin<TConfig>

  constructor(plugin: Plugin<TConfig>) {
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

  useEventPlugin<TConfig extends PluginConfig>(
    pluginFactory: PluginFactory<TConfig>,
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

export function createPlugin<TConfig extends PluginConfig>(
  pluginFactory: PluginFactory<TConfig>,
  registry: Registry,
  eventBus: EventBus,
  config: TConfig
): IPlugin<TConfig> {
  if (isClassConstructor(pluginFactory)) {
    return new pluginFactory(
      pluginFactory.pluginName,
      registry,
      eventBus,
      config
    )
  }

  const plugin = new Plugin(
    pluginFactory.pluginName,
    registry,
    eventBus,
    config
  )
  const context = new PluginContext(plugin)
  pluginFactory(context)
  return plugin
}

function isClassConstructor<TConfig extends PluginConfig>(
  pluginFactory: PluginFactory<TConfig>
): pluginFactory is PluginClassFactory<TConfig> {
  return pluginFactory.prototype?.constructor.toString().indexOf('class ') === 0
}
