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
  private _initialized = false
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
  }

  // @ts-ignore
  onViewRemoved(view: View) {}

  notifyAboutViewAdded(view: View) {
    this.onViewAdded(view)
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
