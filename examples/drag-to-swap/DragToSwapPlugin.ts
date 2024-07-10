import { DragEvent, DragEventPlugin, PluginFactory, View } from '../../src'

export class SwapEvent {
  slotItemMap
  constructor(props: { slotItemMap: Map<string, string> }) {
    this.slotItemMap = props.slotItemMap
  }
}

export const DragToSwapPlugin: PluginFactory = (context) => {
  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)
  dragEventPlugin.on(DragEvent, onDrag)

  let slots: View[]
  let items: View[]
  let draggingItem: View
  let slotItemMap: Map<string, string> = new Map()

  context.setup(() => {
    slots = context.getViews('slot')
    items = context.getViews('item')

    items.forEach((item) => {
      item.position.setAnimator('dynamic')
      item.scale.setAnimator('dynamic')
      item.layoutTransition(true)
      dragEventPlugin.addView(item)

      const slot = item.getParent('slot')!.element
      slotItemMap.set(slot.dataset.slot!, item.element.dataset.item!)
    })
  })

  function onDrag(event: DragEvent) {
    draggingItem = event.view
    if (event.isDragging) {
      draggingItem.position.set({ x: event.x, y: event.y }, false)
      slots.forEach((slot) => {
        if (!slot.intersects(event.pointerX, event.pointerY)) {
          return
        }
        const targetSlotName = slot.element.dataset.slot
        const targetItemName = slot.getChild('item')!.element.dataset.item
        const draggingSlotName =
          draggingItem.getParent('slot')!.element.dataset.slot
        const draggingItemName = draggingItem.element.dataset.item
        if (
          !targetSlotName ||
          !targetItemName ||
          !draggingSlotName ||
          !draggingItemName
        ) {
          return
        }
        slotItemMap.set(targetSlotName, draggingItemName)
        slotItemMap.set(draggingSlotName, targetItemName)
        context.emit(SwapEvent, { slotItemMap: new Map(slotItemMap) })
      })

      items.forEach((item) => {
        item.styles.zIndex = item === draggingItem ? '2' : '1'
      })
    } else {
      draggingItem.position.reset()
    }
  }
}

DragToSwapPlugin.pluginName = 'DragToSwap'
