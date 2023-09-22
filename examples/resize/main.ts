import './style.css'

import {
  App,
  DragEvent,
  DragEventPlugin,
  IPluginContext,
  View,
  Size
} from '../../src'

function ResizePlugin(context: IPluginContext) {
  let resizable: View
  const dragPlugin = context.usePlugin(DragEventPlugin)

  context.setup(() => {
    resizable = context.getView('resizable')!
    resizable.size.animator.set('spring')
    dragPlugin.addView(resizable)
    let initialSize: Size | null = {
      width: resizable.size.width,
      height: resizable.size.height
    }
    dragPlugin.on(DragEvent, (drag) => {
      if (drag.isDragging) {
        if (!initialSize) {
          initialSize = {
            width: resizable.size.initialWidth,
            height: resizable.size.initialHeight
          }
        }
        resizable.size.set({
          width: initialSize.width + drag.width,
          height: initialSize.height + drag.height
        })
      } else {
        initialSize = null
      }
    })
  })
}

ResizePlugin.scope = 'resizable'

const app = App.create()
app.addPlugin(ResizePlugin)

app.run()
