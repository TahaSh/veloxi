import { type EventBus, EventPlugin, Events } from '..'
import { View } from '../core/View'

export type Direction = 'up' | 'down' | 'left' | 'right'

export class ClickEvent {
  view: View
  constructor(public props: { view: View }) {
    this.view = props.view
  }
}

export class ClickEventPlugin extends EventPlugin {
  static pluginName = 'ClickEventPlugin'
  subscribeToEvents(eventBus: EventBus): void {
    eventBus.subscribeToEvent(Events.PointerClickEvent, ({ x, y, target }) => {
      this.getViews().forEach((view) => {
        const clickedTarget = target! as HTMLElement
        const clickedOnTarget =
          view.element === clickedTarget || view.element.contains(clickedTarget)
        if (view.intersects(x, y) && clickedOnTarget) {
          this.emit(ClickEvent, {
            view
          })
        }
      })
    })
  }
}
