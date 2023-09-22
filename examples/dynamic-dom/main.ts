import './style.css'

import {
  App,
  DragEvent,
  DragEventPlugin,
  Plugin,
  View,
  ChangedData,
  Utils
} from '../../src'

// ************************************************************
// ** Events
// ************************************************************

class ListSelectorUpdateEvent {
  itemId: string
  constructor(event: { itemId: string }) {
    this.itemId = event.itemId
  }
}

class ListSelectorHoveredEvent {
  itemId: string
  constructor(event: { itemId: string }) {
    this.itemId = event.itemId
  }
}

// ************************************************************
// ** The plugin
// ************************************************************

class ListSelectorPlugin extends Plugin {
  dragEventPlugin = this.usePlugin(DragEventPlugin)

  selector!: View

  setup(): void {
    this.selector = this.getView('selector')!

    this.dragEventPlugin.addView(this.selector)
    this.dragEventPlugin.on(DragEvent, this.onDrag.bind(this))

    this.selector.position.animator.set('spring')

    this.updateSelectorPosition(false)
  }

  updateSelectorPosition(animate: boolean = true) {
    this.selector.position.set(
      {
        x: this.selectedItem.position.x,
        y: this.selectedItem.position.y
      },
      animate
    )

    this.updateItemSelectedState()
    this.hoverItem()
  }

  get items(): Array<View> {
    return this.getViews('item')
  }

  onDataChanged(data: ChangedData): void {
    if (data.dataName === 'selectedItemId') {
      this.updateSelectorPosition()
    }
  }

  onViewRemoved(view: View): void {
    const removedId = view.data.itemId
    const currentId = this.selector.data.selectedItemId
    if (currentId === removedId) {
      const itemId = this.items[0].data.itemId
      this.emit(ListSelectorUpdateEvent, { itemId })
    }
    this.updateSelectorPosition()
  }

  updateItemSelectedState() {
    this.items.forEach((item) => {
      item.element.dataset.isSelected = 'false'
    })
    this.selectedItem.element.dataset.isSelected = 'true'
  }

  hoverItem(item?: View) {
    this.items.forEach((item) => {
      item.element.dataset.isHovered = 'false'
    })
    if (item) {
      item.element.dataset.isHovered = 'true'
    }
  }

  onDrag(dragState: DragEvent) {
    if (dragState.isDragging) {
      document.body.classList.add('is-dragging')
      this.selector.position.set({
        y: Utils.clamp(
          dragState.y,
          this.items[0].position.y,
          this.items[this.items.length - 1].position.y
        )
      })
      const closestItem = this.getClosestItemToSelector()
      this.hoverItem(closestItem)

      if (closestItem !== this.selectedItem) {
        this.emit(ListSelectorHoveredEvent, { itemId: closestItem.data.itemId })
      }
    } else {
      document.body.classList.remove('is-dragging')
      const closestItem = this.getClosestItemToSelector()
      if (closestItem !== this.selectedItem) {
        this.emit(ListSelectorUpdateEvent, { itemId: closestItem.data.itemId })
      } else {
        this.selector.position.set({
          y: this.selectedItem.position.y
        })
      }
    }
  }

  getClosestItemToSelector(): View {
    let closestItem = this.selectedItem || this.items[0]
    let closestItemDistance = this.selector.distanceTo(closestItem)
    this.items.forEach((item) => {
      const distance = this.selector.distanceTo(item)
      if (distance < closestItemDistance) {
        closestItem = item
        closestItemDistance = distance
      }
    })
    return closestItem
  }

  get selectedItem(): View {
    const currentId = this.selector.data.selectedItemId
    const selectedItem = this.items.find(
      (item) => item.data.itemId === currentId
    )
    if (!selectedItem) {
      return this.items[0]
    }
    return selectedItem
  }
}

// ************************************************************
// ** Create the app, install the plugin, and run the app
// ************************************************************

const app = App.create()

app.addPlugin(ListSelectorPlugin)

app.run()

// ************************************************************
// ** Code is implemented with vanilla javascript.
// ** You can use a framework instead.
// ** Veloxi doesn't care how the DOM is manipulated.
// ************************************************************

app.onPluginEvent(ListSelectorPlugin, ListSelectorUpdateEvent, ({ itemId }) => {
  selectItem(itemId)
})

app.onPluginEvent(
  ListSelectorPlugin,
  ListSelectorHoveredEvent,
  ({ itemId }) => {
    const item = getItemById(itemId)
    if (item) {
      hoverItem(item)
    }
  }
)

const list = document.querySelector<HTMLElement>('.list')!
const items = document.querySelectorAll<HTMLElement>('.item')!
const selector = document.querySelector<HTMLElement>('.selector')!

list.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.matches('.item') || target.closest('.item')) {
    const itemId = target.dataset.velDataItemId
    if (itemId) {
      selectItem(itemId)
    }
  }
})

function getItemById(itemId: string) {
  return Array.from(items).find((item) => item.dataset.velDataItemId === itemId)
}

function selectItem(itemId: string) {
  if (selector) {
    selector.dataset.velDataSelectedItemId = itemId
  }
}

function hoverItem(item: HTMLElement) {
  items.forEach((otherItem) => delete otherItem.dataset.velDataSelected)
  item.dataset.velDataSelected = 'true'
}

function deleteHandler(e: Event) {
  e.stopPropagation()
  e.preventDefault()
  const target = e.target as HTMLElement
  const item = target.closest('li')
  item?.remove()
}

document.querySelectorAll('.delete').forEach((button) => {
  button.addEventListener('click', deleteHandler)
})

document.querySelector('.add-button')?.addEventListener('click', () => {
  const id = new Date().getTime().toString().slice(-10)
  const itemHtml = `<li>
    <div
      class="item"
      data-vel-plugin="ListSelectorPlugin"
      data-vel-view="item"
      data-vel-data-item-id="${id}"
    >
    Item ${document.querySelectorAll('.item').length + 1}
    </div>
    <button class="delete">delete</button>
  </li>`
  const item = new DOMParser().parseFromString(itemHtml, 'text/html').body
    .firstElementChild
  if (item) {
    item.querySelector('.delete')?.addEventListener('click', deleteHandler)
    list.appendChild(item)
  }
})
