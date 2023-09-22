import { getUniqueId } from '../utils/uniqueId'
import { EventBus } from './EventBus'
import { Registry } from './Registry'
import { View } from './View'

type ViewName = string

type PluginCtorInfo = { pluginName?: string; scope?: ViewName }

export interface ChangedData {
  dataName: string
  dataValue: string
  viewName: string
}

export type PluginConfig = Record<string, any>
type PluginClassConstructor<TConfig extends PluginConfig> = new (
  id: string,
  context: PluginContext<TConfig>,
  publicPlugin: PublicPlugin<TConfig>,
  pluginName: string
) => Plugin<TConfig>
type PluginFunctionConstructor<TConfig extends PluginConfig> = (
  context: PluginContext<TConfig>,
  config: TConfig
) => void
export type PluginFactory<TConfig extends PluginConfig = {}> = (
  | PluginClassConstructor<TConfig>
  | PluginFunctionConstructor<TConfig>
) &
  PluginCtorInfo

export interface IPluginRegistry {
  readonly id: string
}

export interface IRunnablePlugin {
  render(): void
  renderViews(): void
  update(ts: number, dt: number): void
  init(): void
  subscribeToEvents(eventBus: EventBus): void
}

export interface IPublicPlugin extends IPluginRegistry {
  addView(view: View, props?: { notify: boolean }): void
  on<TEvent>(
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ): void
  setParentPluginContext(pluginContext: IPluginContext): void
}

interface IPluginAccessors extends IPluginRegistry {
  getViews(name?: string): Array<View>
  getView(name: string): View | undefined
  getViewById(id: string): View | undefined
  getConfig(): Readonly<PluginConfig>
  emit<TEvent>(
    EventCtor: new (eventData: TEvent) => TEvent,
    eventData: TEvent
  ): void
  usePlugin<TConfig extends PluginConfig>(
    PluginCtor: PluginFactory<TConfig>,
    config?: TConfig
  ): IPublicPlugin
  getEventBus(): EventBus
}

export interface IPluginContext extends IPluginAccessors {
  setup(callback: () => void): void
  update(callback: (ts: number, dt: number) => void): void
  render(callback: () => void): void
  subscribeToEvents(callback: (eventBus: EventBus) => void): void
  onViewAdded(callback: (view: View) => void): void
  onViewRemoved(callback: (view: View) => void): void
  onDataChanged(callback: (data: ChangedData) => void): void
}

interface IPlugin extends IPluginAccessors, IRunnablePlugin, IPublicPlugin {
  pluginName: string
  setup(): void
  update(ts: number, dt: number): void
  render(): void
  subscribeToEvents(eventBus: EventBus): void
  onViewAdded(view: View): void
  onViewRemoved(view: View): void
  onDataChanged(callback: (data: ChangedData) => void): void
}

class PluginContext<TConfig extends PluginConfig> implements IPluginContext {
  readonly id: string
  parentPlugin?: IPublicPlugin
  private readonly _registry: Registry
  private readonly _eventBus: EventBus
  private readonly _config: TConfig
  private readonly _internalEventBus: EventBus
  private _setupCallback?: () => void
  private _updateCallback?: (ts: number, dt: number) => void
  private _renderCallback?: () => void
  private _subscribeToEventsCallback?: (eventBus: EventBus) => void
  private _onViewAddedCallback?: (view: View) => void
  private _onViewRemovedCallback?: (view: View) => void
  private _onDataChangedCallback?: (data: ChangedData) => void

  constructor(
    id: string,
    registry: Registry,
    eventBus: EventBus,
    config: TConfig
  ) {
    this.id = id
    this._registry = registry
    this._eventBus = eventBus
    this._config = config
    this._internalEventBus = new EventBus()
  }

  get internalEventBus(): EventBus {
    return this._internalEventBus
  }

  setup(callback: () => void): void {
    this._setupCallback = callback
  }
  callSetup() {
    this._setupCallback?.()
  }

  update(callback: (ts: number, dt: number) => void): void {
    this._updateCallback = callback
  }
  callUpdate(ts: number, dt: number) {
    this._updateCallback?.(ts, dt)
  }

  render(callback: () => void): void {
    this._renderCallback = callback
  }
  callRender() {
    this._renderCallback?.()
  }

  subscribeToEvents(callback: (eventBus: EventBus) => void): void {
    this._subscribeToEventsCallback = callback
  }
  callSubscribeToEvents(eventBus: EventBus): void {
    this._subscribeToEventsCallback?.(eventBus)
  }

  onViewAdded(callback: (view: View) => void): void {
    this._onViewAddedCallback = callback
  }
  callOnViewAdded(view: View): void {
    this._onViewAddedCallback?.(view)
  }

  onViewRemoved(callback: (view: View) => void): void {
    this._onViewRemovedCallback = callback
  }
  callOnViewRemoved(view: View): void {
    this._onViewRemovedCallback?.(view)
  }

  onDataChanged(callback: (data: ChangedData) => void): void {
    this._onDataChangedCallback = callback
  }
  callOnDataChanged(data: ChangedData): void {
    this._onDataChangedCallback?.(data)
  }

  usePlugin<TConfig extends PluginConfig>(
    PluginCtor: PluginClassConstructor<TConfig>,
    config: TConfig = {} as TConfig
  ): IPublicPlugin {
    const plugin = this._registry.createPlugin(
      PluginCtor,
      this._eventBus,
      config
    )
    plugin.setParentPluginContext(this)
    // this.parentPlugin = plugin
    return plugin
  }

  getViews(name?: string): Array<View> {
    if (name) {
      return this._registry.getViewsForPluginByName(
        this as IPluginRegistry,
        name
      )
    }
    return this._registry.getViewsForPlugin(this)
  }

  getView(name: string): View | undefined {
    return this._registry.getViewsForPluginByName(this, name)?.[0]
  }

  getViewById(id: string): View | undefined {
    return this._registry.getViews().find((view) => view.id === id)
  }

  getConfig(): Readonly<TConfig> {
    return this._config
  }

  getEventBus(): EventBus {
    return this._eventBus
  }

  emit<TEvent>(
    EventCtor: new (eventData: TEvent) => TEvent,
    eventData: TEvent
  ): void {
    this._internalEventBus.emitEvent(EventCtor, eventData)
  }
}

class PublicPlugin<TConfig extends PluginConfig> implements IPublicPlugin {
  readonly id: string
  parentContext?: IPluginContext
  private readonly _registry: Registry
  private readonly _internalEventBus: EventBus
  private readonly _context: PluginContext<TConfig>
  constructor(context: PluginContext<TConfig>, registry: Registry) {
    this._registry = registry
    this._internalEventBus = context.internalEventBus
    this.id = context.id
    this._context = context
  }
  setParentPluginContext(pluginContext: IPluginContext): void {
    this.parentContext = pluginContext
  }
  addView(view: View, { notify } = { notify: false }): void {
    this._registry.addViewToPlugin(view, this as IPluginRegistry)
    view.setPluginId(this.id)
    if (notify) {
      this._context.callOnViewAdded(view)
    }
  }
  on<TEvent>(
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ): void {
    this._internalEventBus.subscribeToEvent(EventCtor, listener)
  }
}

export class Plugin<TConfig extends PluginConfig = PluginConfig>
  implements IPlugin
{
  readonly id: string
  readonly pluginName: string
  private _context: PluginContext<TConfig>
  private _public: PublicPlugin<TConfig>
  private _initialized: boolean = false
  constructor(
    id: string,
    context: PluginContext<TConfig>,
    publicPlugin: PublicPlugin<TConfig>,
    pluginName: string
  ) {
    this.id = id
    this._context = context
    this._context.setup(this.setup)
    this._context.render(this.render)
    this._context.update(this.update)
    this._context.subscribeToEvents(this.subscribeToEvents)
    this._public = publicPlugin
    this.pluginName = pluginName
  }
  get parentPluginId(): string | undefined {
    return this._public.parentContext?.id
  }
  get publicPlugin() {
    return this._public
  }
  getEventBus(): EventBus {
    return this._context.getEventBus()
  }
  usePlugin<TConfig extends PluginConfig>(
    PluginCtor: PluginClassConstructor<TConfig>,
    config: TConfig = {} as TConfig
  ): IPublicPlugin {
    return this._context.usePlugin(PluginCtor, config)
  }
  render(): void {
    this._context?.callRender()
  }
  renderViews(): void {
    this._context.getViews().forEach((view) => view.render())
  }
  init(): void {
    if (this._initialized) return
    this.setup()
    this._initialized = true
  }
  setup(): void {
    this._context?.callSetup()
  }
  update(ts: number, dt: number): void {
    this._context?.callUpdate(ts, dt)
  }
  subscribeToEvents(eventBus: EventBus): void {
    this._context?.callSubscribeToEvents(eventBus)
  }
  // @ts-ignore
  onViewAdded(view: View): void {}
  // @ts-ignore
  onViewRemoved(view: View): void {}
  // @ts-ignore
  onDataChanged(data: ChangedData): void {}
  notifyAboutViewRemoved(view: View): void {
    this._context.callOnViewRemoved(view)
  }
  notifyAboutDataChanged(data: ChangedData): void {
    this._context.callOnDataChanged(data)
  }
  getViews(name?: string | undefined): View[] {
    return this._context.getViews(name)
  }
  getView(name: string): View | undefined {
    return this._context.getView(name)
  }
  getViewById(id: string): View | undefined {
    return this._context.getViewById(id)
  }
  getConfig(): Readonly<PluginConfig> {
    return this._context.getConfig()
  }
  addView(view: View, props: { notify: boolean } = { notify: true }): void {
    this._public.addView(view, { notify: props.notify })
  }
  emit<TEvent>(
    EventCtor: new (eventData: TEvent) => TEvent,
    eventData: TEvent
  ): void {
    this._context.emit(EventCtor, eventData)
  }
  on<TEvent>(
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ): void {
    this._public.on(EventCtor, listener)
  }
}

function isPluginClassConstructor<TConfig extends PluginConfig = PluginConfig>(
  constructor: PluginFactory<TConfig>
): constructor is PluginClassConstructor<TConfig> {
  if (typeof constructor === 'function' && constructor.name === '') return false
  return constructor.prototype.constructor.toString().indexOf('class ') === 0
}

export function createPlugin<TConfig extends PluginConfig>(
  pluginFactory: PluginFactory<TConfig>,
  registry: Registry,
  eventBus: EventBus,
  config: TConfig
): Plugin<TConfig> {
  const id = getUniqueId()
  const context = new PluginContext<TConfig>(id, registry, eventBus, config)
  const publicPlugin = new PublicPlugin(context, registry)
  const pluginName = !pluginFactory.pluginName
    ? pluginFactory.name
    : pluginFactory.pluginName
  if (isPluginClassConstructor(pluginFactory)) {
    const plugin = new pluginFactory(id, context, publicPlugin, pluginName)
    context.onViewAdded(plugin.onViewAdded.bind(plugin))
    context.onViewRemoved(plugin.onViewRemoved.bind(plugin))
    context.onDataChanged(plugin.onDataChanged.bind(plugin))
    return plugin
  }

  const plugin = new Plugin<TConfig>(id, context, publicPlugin, pluginName)
  pluginFactory(context, config)
  return plugin
}
