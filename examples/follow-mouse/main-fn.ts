import './style.css'

import { Events, createApp } from '../../src'
import type { EventBus, PluginFactory } from '../../src'

const FollowMousePlugin: PluginFactory = (context) => {
  context.setup(() => {
    const box = context.getView('box')!
    box.position.setAnimator('dynamic', { speed: 20 })
  })

  context.subscribeToEvents((eventBus: EventBus) => {
    const box = context.getView('box')!
    eventBus.subscribeToEvent(Events.PointerMoveEvent, ({ x, y }) => {
      box.position.set({
        x: x - box.size.width / 2 + box.getScroll().x,
        y: y - box.size.height / 2 + box.getScroll().y
      })
    })
  })
}

FollowMousePlugin.pluginName = 'FollowMousePlugin'

const app = createApp()
app.addPlugin(FollowMousePlugin)

app.run()
