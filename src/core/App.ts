import { DataChangedEvent } from '..'
import {
  PointerClickEvent,
  PointerMoveEvent,
  PointerDownEvent,
  PointerUpEvent
} from '../builtin-events/PointerEvents'
import { DomObserver, NodeAddedEvent, NodeRemovedEvent } from './DomObserver'
import { EventBus } from './EventBus'
import { PluginApi, PluginConfig, PluginFactory } from './Plugin'
import { Registry } from './Registry'

export type ReadyCallback<TPluginApi extends PluginApi> = (
  pluginApi: TPluginApi
) => void

export class PluginReadyEvent {
  pluginApi: PluginApi
  constructor(props: { pluginApi: PluginApi }) {
    this.pluginApi = props.pluginApi
  }
}

export class PluginReadySetupEvent {
  pluginApi: PluginApi
  constructor(props: { pluginApi: PluginApi }) {
    this.pluginApi = props.pluginApi
  }
}

export interface VeloxiApp {
  addPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config?: TConfig
  ): void

  updatePlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config?: TConfig
  ): void

  reset(pluginName?: string, callback?: () => void): void

  destroy(pluginName?: string, callback?: () => void): void

  getPlugin<TPluginApi extends PluginApi>(
    pluginFactory: PluginFactory<PluginConfig> | string,
    pluginKey?: string
  ): TPluginApi

  getPlugins<TPluginApi extends PluginApi>(
    pluginFactory: PluginFactory<PluginConfig> | string,
    pluginKey?: string
  ): TPluginApi[]

  onPluginEvent<TPlugin extends PluginFactory<any, any>, TEvent>(
    pluginFactory: TPlugin,
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void,
    pluginKey?: string
  ): void

  removePluginEventListener<TEvent>(
    pluginFactory: PluginFactory,
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ): void

  run(): void
}

class App implements VeloxiApp {
  private previousTime: number = 0
  private readonly registry: Registry
  private readonly eventBus: EventBus
  private readonly appEventBus: EventBus

  static create() {
    return new App()
  }

  constructor() {
    this.eventBus = new EventBus()
    this.appEventBus = new EventBus()
    this.registry = new Registry(this.appEventBus, this.eventBus)
    new DomObserver(this.eventBus)
  }

  addPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config: TConfig = {} as TConfig
  ): void {
    if (!this.registry.hasPlugin(pluginFactory)) {
      this.registry.createPlugin(pluginFactory, this.eventBus, config)
    }
  }

  updatePlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config: TConfig = {} as TConfig
  ): void {
    if (this.registry.hasPlugin(pluginFactory)) {
      this.registry.updatePlugin(pluginFactory, this.eventBus, config)
    }
  }

  reset(pluginName?: string, callback?: () => void) {
    this.registry.reset(pluginName, callback)
  }

  destroy(pluginName?: string, callback?: () => void) {
    this.registry.destroy(pluginName, callback)
  }

  getPlugin<TPluginApi extends PluginApi>(
    pluginFactory: PluginFactory<PluginConfig> | string,
    pluginKey?: string
  ): TPluginApi {
    let pluginName =
      typeof pluginFactory === 'string'
        ? pluginFactory
        : pluginFactory.pluginName
    const plugin = this.registry.getPluginByName(pluginName, pluginKey)
    if (!plugin) {
      throw new Error(
        `You can\'t call getPlugin for ${pluginName} with key: ${pluginKey} because it does not exist in your app`
      )
    }
    return plugin.api as TPluginApi
  }

  getPlugins<TPluginApi extends PluginApi>(
    pluginFactory: PluginFactory<PluginConfig> | string,
    pluginKey?: string
  ): TPluginApi[] {
    let pluginName =
      typeof pluginFactory === 'string'
        ? pluginFactory
        : pluginFactory.pluginName
    const plugins = this.registry.getPluginsByName(pluginName, pluginKey)
    if (plugins.length === 0) {
      throw new Error(
        `You can\'t call getPlugins for ${pluginName} with key: ${pluginKey} because they don\'t exist in your app`
      )
    }
    return plugins.map((plugin) => plugin.api) as TPluginApi[]
  }

  onPluginEvent<TPlugin extends PluginFactory<any, any>, TEvent>(
    pluginFactory: TPlugin,
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void,
    pluginKey?: string
  ) {
    const plugin = this.registry.getPluginByName(
      pluginFactory.pluginName!,
      pluginKey
    )

    if (plugin) {
      plugin.on(EventCtor, listener)
    }
  }

  removePluginEventListener<TEvent>(
    pluginFactory: PluginFactory,
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    const plugin = this.registry.getPluginByName(pluginFactory.pluginName!)

    if (plugin) {
      plugin.removeListener(EventCtor, listener)
    }
  }

  run() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.start.bind(this))
    } else {
      this.start()
    }
  }

  private start() {
    this.setup()
    requestAnimationFrame(this.tick.bind(this))
  }

  private setup() {
    this.listenToNativeEvents()
    this.subscribeToEvents()
  }

  private listenToNativeEvents() {
    document.addEventListener('click', (e) => {
      this.eventBus.emitEvent(PointerClickEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
    document.addEventListener('pointermove', (e) => {
      this.eventBus.emitEvent(PointerMoveEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
    document.addEventListener('pointerdown', (e) => {
      this.eventBus.emitEvent(PointerDownEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
    document.addEventListener('pointerup', (e) => {
      this.eventBus.emitEvent(PointerUpEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
  }

  private tick(ts: number) {
    let dt = (ts - this.previousTime) / 1000
    if (dt > 0.016) {
      dt = 1 / 60
    }
    this.previousTime = ts

    this.eventBus.reset()
    this.subscribeToEvents()
    this.read()
    this.update(ts, dt)
    this.render()

    requestAnimationFrame(this.tick.bind(this))
  }

  private subscribeToEvents() {
    this.eventBus.subscribeToEvent(NodeAddedEvent, this.onNodeAdded.bind(this))

    this.eventBus.subscribeToEvent(
      NodeRemovedEvent,
      this.onNodeRemoved.bind(this)
    )

    this.eventBus.subscribeToEvent(
      DataChangedEvent,
      this.onDataChanged.bind(this)
    )

    this.registry.getPlugins().forEach((plugin) => {
      plugin.subscribeToEvents(this.eventBus)
    })
  }

  private onNodeAdded({ node }: NodeAddedEvent) {
    this.registry.queueNodeToBeCreated(node)
  }

  private onNodeRemoved({ node }: NodeRemovedEvent) {
    this.registry.queueNodeToBeRemoved(node)
  }

  private onDataChanged(event: DataChangedEvent) {
    this.registry.notifyPluginAboutDataChange(event)
  }

  private read() {
    this.registry.getViews().forEach((view) => {
      view.read()
    })
  }

  private update(ts: number, dt: number) {
    this.registry.update()
    this.registry
      .getPlugins()
      .slice()
      .reverse()
      .forEach((plugin) => {
        plugin.init()
      })
    this.registry.getRenderablePlugins().forEach((plugin) => {
      plugin.update(ts, dt)
    })
    this.registry.getViews().forEach((view) => {
      view.update(ts, dt)
    })
    this.registry.getViews().forEach((view) => {
      // Update previous rect after all views have been updated.
      // This is needed to ensure that we are using the same
      // previous rect across all view props.
      view._updatePreviousRect()
    })
  }

  private render() {
    this.registry.getRenderablePlugins().forEach((plugin) => {
      plugin.render()
    })
    this.registry.getViews().forEach((view) => {
      view.render()
    })
  }
}

export function createApp(): VeloxiApp {
  return App.create()
}
