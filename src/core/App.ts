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

class App {
  private _previousTime: number = 0
  private readonly _registry: Registry
  private readonly _eventBus: EventBus
  private readonly _appEventBus: EventBus

  static create() {
    return new App()
  }

  constructor() {
    this._eventBus = new EventBus()
    this._appEventBus = new EventBus()
    this._registry = new Registry(this._appEventBus, this._eventBus)
    new DomObserver(this._eventBus)
  }

  addPlugin<
    TConfig extends PluginConfig = PluginConfig,
    TPluginApi extends PluginApi = PluginApi
  >(
    pluginFactory: PluginFactory<TConfig, TPluginApi>,
    config: TConfig = {} as TConfig
  ): void {
    if (!this._registry.hasPlugin(pluginFactory)) {
      this._registry.createPlugin(pluginFactory, this._eventBus, config)
    }
  }

  reset(pluginName?: string, callback?: () => void) {
    this._registry.reset(pluginName, callback)
  }

  destroy(pluginName?: string, callback?: () => void) {
    this._registry.destroy(pluginName, callback)
  }

  getPlugin<TPluginApi extends PluginApi>(
    pluginFactory: PluginFactory<PluginConfig> | string,
    pluginKey?: string
  ): TPluginApi {
    let pluginName =
      typeof pluginFactory === 'string'
        ? pluginFactory
        : pluginFactory.pluginName
    const plugin = this._registry.getPluginByName(pluginName, pluginKey)
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
    const plugins = this._registry.getPluginsByName(pluginName, pluginKey)
    if (plugins.length === 0) {
      throw new Error(
        `You can\'t call getPlugins for ${pluginName} with key: ${pluginKey} because they don\'t exist in your app`
      )
    }
    return plugins.map((plugin) => plugin.api) as TPluginApi[]
  }

  onPluginEvent<TEvent>(
    pluginFactory: PluginFactory,
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    const plugin = this._registry.getPluginByName(pluginFactory.pluginName!)

    if (plugin) {
      plugin.on(EventCtor, listener)
    }
  }

  run() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this._start.bind(this))
    } else {
      this._start()
    }
  }

  ready<TPluginApi extends PluginApi>(
    pluginName: string,
    callback: ReadyCallback<TPluginApi>
  ): void {
    this._appEventBus.subscribeToPluginReadyEvent(callback, pluginName)
  }

  private _start() {
    this._setup()
    requestAnimationFrame(this._tick.bind(this))
  }

  private _setup() {
    this._listenToNativeEvents()
    this._subscribeToEvents()
  }

  private _listenToNativeEvents() {
    document.addEventListener('click', (e) => {
      this._eventBus.emitEvent(PointerClickEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
    document.addEventListener('pointermove', (e) => {
      this._eventBus.emitEvent(PointerMoveEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
    document.addEventListener('pointerdown', (e) => {
      this._eventBus.emitEvent(PointerDownEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
    document.addEventListener('pointerup', (e) => {
      this._eventBus.emitEvent(PointerUpEvent, {
        x: e.clientX,
        y: e.clientY,
        target: e.target
      })
    })
  }

  private _tick(ts: number) {
    let dt = (ts - this._previousTime) / 1000
    if (dt > 0.016) {
      dt = 1 / 60
    }
    this._previousTime = ts

    this._eventBus.reset()
    this._subscribeToEvents()
    this._read()
    this._update(ts, dt)
    this._render()

    requestAnimationFrame(this._tick.bind(this))
  }

  private _subscribeToEvents() {
    this._eventBus.subscribeToEvent(
      NodeAddedEvent,
      this._onNodeAdded.bind(this)
    )

    this._eventBus.subscribeToEvent(
      NodeRemovedEvent,
      this._onNodeRemoved.bind(this)
    )

    this._eventBus.subscribeToEvent(
      DataChangedEvent,
      this._onDataChanged.bind(this)
    )

    this._registry.getPlugins().forEach((plugin) => {
      plugin.subscribeToEvents(this._eventBus)
    })
  }

  private _onNodeAdded({ node }: NodeAddedEvent) {
    this._registry.queueNodeToBeCreated(node)
  }

  private _onNodeRemoved({ node }: NodeRemovedEvent) {
    this._registry.queueNodeToBeRemoved(node)
  }

  private _onDataChanged(event: DataChangedEvent) {
    this._registry.notifyPluginAboutDataChange(event)
  }

  private _read() {
    this._registry.getViews().forEach((view) => {
      view.read()
    })
  }

  private _update(ts: number, dt: number) {
    this._registry.update()
    this._registry
      .getPlugins()
      .slice()
      .reverse()
      .forEach((plugin) => {
        plugin.init()
      })
    this._registry.getRenderablePlugins().forEach((plugin) => {
      plugin.update(ts, dt)
    })
    this._registry.getViews().forEach((view) => {
      view.update(ts, dt)
    })
    this._registry.getViews().forEach((view) => {
      // Update previous rect after all views have been updated.
      // This is needed to ensure that we are using the same
      // previous rect across all view props.
      view._updatePreviousRect()
    })
  }

  private _render() {
    this._registry.getRenderablePlugins().forEach((plugin) => {
      plugin.render()
    })
    this._registry.getViews().forEach((view) => {
      view.render()
    })
  }
}

export function createApp() {
  return App.create()
}
