import './style.css'

import {
  DragEvent,
  DragEventPlugin,
  View,
  Size,
  PluginFactory,
  createApp
} from '../../src'

interface ResizeConfig {
  maxWidth?: number
}

const ResizePlugin: PluginFactory<ResizeConfig> = (context) => {
  let resizable: View
  const dragPlugin = context.useEventPlugin(DragEventPlugin)

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
        const newWidth = initialSize.width + drag.width
        const maxWidth = context.config.maxWidth
        resizable.size.set({
          width:
            maxWidth !== undefined && newWidth > maxWidth ? maxWidth : newWidth,
          height: initialSize.height + drag.height
        })
      } else {
        initialSize = null
      }
    })
  })
}

ResizePlugin.pluginName = 'ResizePlugin'
ResizePlugin.scope = 'resizable'

const app = createApp()
app.addPlugin(ResizePlugin, { maxWidth: 500 })

app.run()
