import './style.css'

import {
  App,
  View,
  DragEvent,
  DragEventPlugin,
  IPluginContext
} from '../../src'

function DragPlugin(context: IPluginContext) {
  const dragEventPlugin = context.usePlugin(DragEventPlugin)

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

const app = App.create()
app.addPlugin(DragPlugin)

app.run()
