import './style.css'

import { App, Plugin, Events } from '../../src'
import type { EventBus } from '../../src'

class FollowMousePlugin extends Plugin {
  setup(): void {
    const box = this.getView('box')!
    box.position.setAnimator('dynamic', { speed: 20 })
  }
  subscribeToEvents(eventBus: EventBus): void {
    const box = this.getView('box')!
    eventBus.subscribeToEvent(Events.PointerMoveEvent, ({ x, y }) => {
      box.position.set({
        x: x - box.size.width / 2 + box.getScroll().x,
        y: y - box.size.height / 2 + box.getScroll().y
      })
    })
  }
}

const app = App.create()
app.addPlugin(FollowMousePlugin)

app.run()
