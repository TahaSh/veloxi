import './style.css'

import { Plugin, View, createApp } from '../../src'
import { DragEvent, DragEventPlugin } from '../../src'

class DragToReorderPlugin extends Plugin {
  static pluginName = 'DragToReorderPlugin'

  dragEventPlugin = this.useEventPlugin(DragEventPlugin)

  items!: Array<View>

  draggingItem: View | null = null

  itemIdSlotMap: Map<string, number> = new Map()

  slotPositionMap: Map<number, number> = new Map()

  setup() {
    this.items = this.getViews('item')!

    this.items.forEach((item, index) => {
      this.assignItemToSlot(item, index)
      this.dragEventPlugin.addView(item)
      item.position.animator.set('dynamic')
      this.slotPositionMap.set(index, item.position.y)
    })

    this.dragEventPlugin.on(DragEvent, this.onDrag.bind(this))
  }

  onDrag(event: DragEvent) {
    if (event.isDragging) {
      this.draggingItem = event.view
      this.draggingItem.position.set({ x: event.x, y: event.y })
      this.draggingItem.styles.zIndex = '2'

      this.updateItemPositions()
    } else {
      if (!this.draggingItem) return
      this.draggingItem.styles.zIndex = ''
      this.draggingItem.position.set({
        x: this.draggingItem.position.initialX,
        y: this.getSlotPositionForItem(this.draggingItem)
      })
      this.draggingItem = null
    }
  }

  updateItemPositions() {
    this.items
      .filter((item) => item.id !== this.draggingItem?.id)
      .forEach((item) => {
        if (!this.draggingItem) return

        const draggingItemSlot = this.itemIdSlotMap.get(this.draggingItem.id)
        const itemSlot = this.itemIdSlotMap.get(item.id)

        if (draggingItemSlot === undefined || itemSlot === undefined) return

        const draggingItemPosition = this.draggingItem.position.y
        const itemPosition = this.getSlotPositionForItem(item)

        if (
          draggingItemSlot < itemSlot &&
          draggingItemPosition + this.draggingItem.size.height >
            itemPosition + item.size.height / 2
        ) {
          this.assignItemToSlot(item, draggingItemSlot)
          this.assignItemToSlot(this.draggingItem, itemSlot)
          item.position.set({
            y: this.slotPositionMap.get(draggingItemSlot)
          })
        } else if (
          draggingItemSlot > itemSlot &&
          draggingItemPosition < itemPosition + item.size.height / 2
        ) {
          this.assignItemToSlot(item, draggingItemSlot)
          this.assignItemToSlot(this.draggingItem, itemSlot)
          item.position.set({
            y: this.slotPositionMap.get(draggingItemSlot)
          })
        }
      })
  }

  assignItemToSlot(item: View, slot: number) {
    this.itemIdSlotMap.set(item.id, slot)
  }

  getSlotPositionForItem(item: View): number {
    const slot = this.itemIdSlotMap.get(item.id)!
    return this.slotPositionMap.get(slot)!
  }
}

const app = createApp()
app.addPlugin(DragToReorderPlugin)

app.run()
