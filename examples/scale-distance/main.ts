import './style.css'

import { View, createApp, Events, Utils } from '../../src'
import { PluginFactory } from '../../src/core/Plugin'

const ScaleDistancePlugin: PluginFactory = (context) => {
  context.subscribeToEvents((eventBus) => {
    eventBus.subscribeToEvent(Events.PointerMoveEvent, onMouseMove)
  })

  let circle: View

  context.setup(() => {
    circle = context.getView('circle')!

    circle.scale.setAnimator('spring')
  })

  function onMouseMove(event: Events.PointerMoveEvent) {
    const progress = Utils.pointToViewProgress(
      {
        x: event.x - circle.size.width / 2,
        y: event.y - circle.size.height / 2
      },
      circle,
      200,
      100
    )
    const scale = Utils.remap(progress, 0, 1, 1, 2)
    circle.scale.set(scale)
  }
}

ScaleDistancePlugin.pluginName = 'ScaleDistancePlugin'

const app = createApp()
app.addPlugin(ScaleDistancePlugin)
app.run()
