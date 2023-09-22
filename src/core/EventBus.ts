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

  subscribeToEvent<TEvent>(
    EventCtor: new (props: TEvent) => TEvent,
    listener: (props: TEvent) => void
  ): void {
    let eventListeners = this._listeners.get(EventCtor)
    if (!eventListeners) {
      eventListeners = []
      this._listeners.set(EventCtor, eventListeners)
    }
    eventListeners.push(new EventHandler(listener) as IEventHandler)
  }

  emitEvent<TEvent>(
    EventCtor: new (props: TEvent) => TEvent,
    props: TEvent
  ): void {
    const listeners = this._listeners.get(EventCtor)
    if (!listeners) return
    listeners.forEach((aListener) => {
      const listener = aListener as EventHandler<TEvent>
      listener.execute(props)
    })
  }

  reset(): void {
    this._listeners.clear()
  }
}
