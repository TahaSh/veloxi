import './style.css'

import { PluginFactory, View, createApp } from '../../src'
import { DragEvent, DragEventPlugin } from '../../src'

function arrayEqual(a: Array<any>, b: Array<any>): boolean {
  return a.every((val, i) => val === b[i])
}

export class ReorderEvent {
  itemIdsJson: string
  constructor(event: { itemIdsJson: string }) {
    this.itemIdsJson = event.itemIdsJson
  }
}

export const DragToReorderPlugin: PluginFactory = (context) => {
  let list: View

  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)
  dragEventPlugin.on(DragEvent, (event) => {
    if (event.view.name === 'item') {
      onItemDrag(event)
    }
  })

  context.setup(() => {
    list = context.getView('list')!
  })

  function currentOrder() {
    return JSON.parse(list.data.orderedIds)
  }

  function updateOrderedIds(newOrder: string[]) {
    context.emit(ReorderEvent, { itemIdsJson: JSON.stringify(newOrder) })
  }

  function initItem(view: View) {
    view.position.setAnimator('spring')
    view.layoutTransition(true)
    dragEventPlugin.addView(view)
  }

  function onItemDrag(event: DragEvent) {
    const dragging = event.view
    const otherItems = context
      .getViews('item')
      .filter((v: View) => v.id !== dragging.id)
    if (event.isDragging) {
      const localCurrentOrder = [...currentOrder()]
      dragging.position.set({ x: event.x, y: event.y }, false)
      dragging.styles.zIndex = '2'
      const draggingIndex = localCurrentOrder.indexOf(dragging.data.itemId)
      localCurrentOrder.splice(draggingIndex, 1)
      let newIndex = draggingIndex
      otherItems.forEach((item: View) => {
        const itemIndex = localCurrentOrder.indexOf(item.data.itemId)
        const draggingIsNowBelow =
          dragging.position.y + dragging.size.height >
          item.position.y + item.size.height / 2
        const draggingIsNowAbove = !draggingIsNowBelow
        if (draggingIsNowAbove && draggingIndex > itemIndex) {
          newIndex = itemIndex
          return
        } else if (draggingIsNowBelow && draggingIndex <= itemIndex) {
          newIndex = itemIndex + 1
          return
        }
      })
      localCurrentOrder.splice(newIndex, 0, dragging.data.itemId)

      if (!arrayEqual(currentOrder(), localCurrentOrder)) {
        updateOrderedIds(localCurrentOrder)
      }
    } else {
      dragging.position.reset()
      dragging.styles.zIndex = '1'
    }
  }

  context.onViewAdded((view) => {
    view.origin.set({ x: 0, y: 0 })
    if (view.name === 'item') {
      initItem(view)
    }
  })
}

DragToReorderPlugin.pluginName = 'DragToReorderPlugin'

export const app = createApp()
app.addPlugin(DragToReorderPlugin)
app.run()
