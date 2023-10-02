import './style.css'

import {
  DragEvent,
  DragEventPlugin,
  View,
  ChangedData,
  Utils,
  createApp,
  PluginFactory
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

const ListSelectorPlugin: PluginFactory = (context) => {
  const dragEventPlugin = context.useEventPlugin(DragEventPlugin)

  let selector: View

  context.setup(() => {
    selector = context.getView('selector')!

    dragEventPlugin.addView(selector)
    dragEventPlugin.on(DragEvent, onDrag.bind(this))

    selector.position.animator.set('spring')

    updateSelectorPosition(false)
  })

  function updateSelectorPosition(animate: boolean = true) {
    selector.position.set(
      {
        x: selectedItem().position.x,
        y: selectedItem().position.y
      },
      animate
    )

    updateItemSelectedState()
    hoverItem()
  }

  function items(): Array<View> {
    return context.getViews('item')
  }

  context.onDataChanged((data: ChangedData) => {
    if (data.dataName === 'selectedItemId') {
      updateSelectorPosition()
    }
  })

  context.onViewRemoved((view: View) => {
    const removedId = view.data.itemId
    const currentId = selector.data.selectedItemId
    if (currentId === removedId) {
      const itemId = items()[0].data.itemId
      context.emit(ListSelectorUpdateEvent, { itemId })
    }
    updateSelectorPosition()
  })

  function updateItemSelectedState() {
    items().forEach((item) => {
      item.element.dataset.isSelected = 'false'
    })
    selectedItem().element.dataset.isSelected = 'true'
  }

  function hoverItem(item?: View) {
    items().forEach((item) => {
      item.element.dataset.isHovered = 'false'
    })
    if (item) {
      item.element.dataset.isHovered = 'true'
    }
  }

  function onDrag(dragState: DragEvent) {
    if (dragState.isDragging) {
      document.body.classList.add('is-dragging')
      selector.position.set({
        y: Utils.clamp(
          dragState.y,
          items()[0].position.y,
          items()[items().length - 1].position.y
        )
      })
      const closestItem = getClosestItemToSelector()
      hoverItem(closestItem)

      if (closestItem !== selectedItem()) {
        context.emit(ListSelectorHoveredEvent, {
          itemId: closestItem.data.itemId
        })
      }
    } else {
      document.body.classList.remove('is-dragging')
      const closestItem = getClosestItemToSelector()
      if (closestItem !== selectedItem()) {
        context.emit(ListSelectorUpdateEvent, {
          itemId: closestItem.data.itemId
        })
      } else {
        selector.position.set({
          y: selectedItem().position.y
        })
      }
    }
  }

  function getClosestItemToSelector(): View {
    let closestItem = selectedItem() || items()[0]
    let closestItemDistance = selector.distanceTo(closestItem)
    items().forEach((item) => {
      const distance = selector.distanceTo(item)
      if (distance < closestItemDistance) {
        closestItem = item
        closestItemDistance = distance
      }
    })
    return closestItem
  }

  function selectedItem(): View {
    const currentId = selector.data.selectedItemId
    const selectedItem = items().find((item) => item.data.itemId === currentId)
    if (!selectedItem) {
      return items()[0]
    }
    return selectedItem
  }
}

ListSelectorPlugin.pluginName = 'ListSelectorPlugin'

// ************************************************************
// ** Create the app, install the plugin, and run the app
// ************************************************************

const app = createApp()

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
