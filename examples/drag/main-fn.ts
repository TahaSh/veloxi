import './style.css'

import { View, DragEvent, DragEventPlugin, createApp } from '../../src'
import { PluginFactory } from '../../src/core/Plugin'

const DragPlugin: PluginFactory = (context) => {
  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)

  let draggable: View

  context.setup(() => {
    draggable = context.getView('draggable')!

    dragEventPlugin.addView(draggable)

    draggable.position.animator.set(isAnchored() ? 'spring' : 'dynamic')

    dragEventPlugin.on(DragEvent, onDrag)
  })

  function onDrag(dragState: DragEvent) {
    if (dragState.isDragging) {
      draggable.position.set({
        x: dragState.x,
        y: dragState.y
      })
    } else if (isAnchored()) {
      draggable.position.reset()
    }
  }

  function isAnchored() {
    return draggable.data.anchored === 'true'
  }
}

DragPlugin.scope = 'draggable'
DragPlugin.pluginName = 'DragPlugin'

const app = createApp()
app.addPlugin(DragPlugin as PluginFactory)

app.run()
