import { DataChangedEvent } from '..'
import {
  PointerClickEvent,
  PointerMoveEvent,
  PointerDownEvent,
  PointerUpEvent
} from '../builtin-events/PointerEvents'
import { DomObserver, NodeAddedEvent, NodeRemovedEvent } from './DomObserver'
import { EventBus } from './EventBus'
import { type IRunnablePlugin, PluginConfig, PluginFactory } from './Plugin'
import { Registry } from './Registry'

export class App {
  private _previousTime: number = 0
  private readonly _registry: Registry
  private readonly _eventBus: EventBus

  static create() {
    return new App()
  }

  constructor() {
    this._registry = new Registry()
    this._eventBus = new EventBus()
    new DomObserver(this._eventBus)
  }

  addPlugin<TConfig extends PluginConfig>(
    PluginCtor: PluginFactory<TConfig>,
    config: TConfig = {} as TConfig
  ): void {
    this._registry.createPlugin<TConfig>(PluginCtor, this._eventBus, config)
  }

  onPluginEvent<TEvent>(
    PluginCtor: PluginFactory,
    EventCtor: new (eventData: TEvent) => TEvent,
    listener: (eventData: TEvent) => void
  ) {
    const plugin = this._registry.getPluginByName(PluginCtor.name)

    if (plugin) {
      plugin.on(EventCtor, listener)
    }
  }

  run() {
    document.addEventListener('DOMContentLoaded', () => {
      this._setup()
      requestAnimationFrame(this._tick.bind(this))
    })
  }

  private _setup() {
    this._listenToNativeEvents()
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

    this._registry.getPlugins().forEach((plugin: IRunnablePlugin) => {
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
      .forEach((plugin: IRunnablePlugin) => {
        plugin.init()
      })
    this._registry.getPlugins().forEach((plugin: IRunnablePlugin) => {
      plugin.update(ts, dt)
    })
    this._registry.getViews().forEach((view) => {
      view.update(ts, dt)
    })
  }

  private _render() {
    this._registry.getPlugins().forEach((plugin: IRunnablePlugin) => {
      plugin.render()
      plugin.renderViews()
    })
  }
}
