import { DragEvent, DragEventPlugin, PluginFactory } from '../../src'

export const DraggablePlugin: PluginFactory = (context) => {
  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)
  dragEventPlugin.on(DragEvent, (event: DragEvent) => {
    event.view.position.set({ x: event.x, y: event.y })
  })
  context.setup(() => {
    const item = context.getView('item')!
    dragEventPlugin.addView(item)
  })
}

DraggablePlugin.pluginName = 'DraggablePlugin'
