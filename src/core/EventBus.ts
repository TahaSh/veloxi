import { PluginReadyEvent, PluginReadySetupEvent, ReadyCallback } from './App'
import { PluginApi } from './Plugin'

abstract class IEventHandler<TEvent = Record<string, unknown>> {
  execute(props: TEvent) {
    this.call(props)
  }

  protected abstract call(props: TEvent): void
}

class EventHandler<TEvent> extends IEventHandler<TEvent> {
  private _handler: (props: TEvent) => void

  constructor(handler: (props: TEvent) => void) {
    super()
    this._handler = handler
  }

  protected call(props: TEvent): void {
    this._handler(props)
  }
}

export class EventBus {
  private _listeners: Map<new (props: any) => unknown, Array<IEventHandler>> =
    new Map()
  private _keyedListeners: Map<
    new (props: any) => unknown,
    Map<string, Array<IEventHandler>>
  > = new Map()

  subscribeToEvent<TEvent>(
    EventCtor: new (props: TEvent) => TEvent,
    listener: (props: TEvent) => void,
    key?: string
  ): void {
    if (key) {
      this._subscribeToKeyedEvent(EventCtor, listener, key)
      return
    }
    let eventListeners = this._listeners.get(EventCtor)
    if (!eventListeners) {
      eventListeners = []
      this._listeners.set(EventCtor, eventListeners)
    }
    eventListeners.push(new EventHandler(listener) as IEventHandler)
  }

  private _subscribeToKeyedEvent<TEvent>(
    EventCtor: new (props: TEvent) => TEvent,
    listener: (props: TEvent) => void,
    key: string
  ) {
    let keyListenersMap = this._keyedListeners.get(EventCtor)
    if (!keyListenersMap) {
      keyListenersMap = new Map()
      this._keyedListeners.set(EventCtor, keyListenersMap)
    }
    let listenersForKey = keyListenersMap.get(key)
    if (!listenersForKey) {
      listenersForKey = []
      keyListenersMap.set(key, listenersForKey)
    }
    listenersForKey.push(new EventHandler(listener) as IEventHandler)
  }

  emitEvent<TEvent>(
    EventCtor: new (props: TEvent) => TEvent,
    props: TEvent,
    key?: string
  ): void {
    if (key) {
      this._emitKeyedEvent(EventCtor, props, key)
      return
    }
    const listeners = this._listeners.get(EventCtor)
    if (!listeners) return
    listeners.forEach((aListener) => {
      const listener = aListener as EventHandler<TEvent>
      listener.execute(props)
    })
  }

  private _emitKeyedEvent<TEvent>(
    EventCtor: new (props: TEvent) => TEvent,
    props: TEvent,
    key: string
  ) {
    const keyListenersMap = this._keyedListeners.get(EventCtor)
    if (!keyListenersMap) return
    const listeners = keyListenersMap.get(key)
    if (!listeners) return
    listeners.forEach((aListener) => {
      const listener = aListener as EventHandler<TEvent>
      listener.execute(props)
    })
  }

  private _convertListener<TEvent, TPluginApi extends PluginApi>(
    listener: ReadyCallback<TPluginApi>
  ): (prop: TEvent) => void {
    return (props: TEvent) => listener(props as unknown as TPluginApi)
  }

  subscribeToPluginReadyEvent<TPluginApi extends PluginApi>(
    listener: ReadyCallback<TPluginApi>,
    pluginName: string,
    forSetup: boolean = false
  ) {
    if (forSetup) {
      this.subscribeToEvent(
        PluginReadySetupEvent,
        this._convertListener(listener),
        pluginName
      )
      return
    }
    this.subscribeToEvent(
      PluginReadyEvent,
      this._convertListener(listener),
      pluginName
    )
  }

  emitPluginReadyEvent<TPluginApi extends PluginApi>(
    pluginName: string,
    pluginApi: TPluginApi,
    forSetup: boolean = false
  ) {
    if (forSetup) {
      this.emitEvent(
        PluginReadySetupEvent,
        pluginApi as unknown as { pluginApi: PluginApi },
        pluginName
      )
      return
    }
    this.emitEvent(
      PluginReadyEvent,
      pluginApi as unknown as { pluginApi: PluginApi },
      pluginName
    )
  }

  reset(): void {
    this._listeners.clear()
  }
}
