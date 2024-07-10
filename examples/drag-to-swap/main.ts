import './style.css'
import { createApp } from '../../src'
import { DragToSwapPlugin, SwapEvent } from './DragToSwapPlugin'

const app = createApp()
app.addPlugin(DragToSwapPlugin)
app.run()

let map = new Map()
map.set('a', 'a')
map.set('b', 'b')
map.set('c', 'c')
map.set('d', 'd')

app.onPluginEvent(DragToSwapPlugin, SwapEvent, ({ slotItemMap }) => {
  map = new Map(slotItemMap)
  applyOrder()
})

const itemsMap = new Map()
itemsMap.set('a', getItem('a'))
itemsMap.set('b', getItem('b'))
itemsMap.set('c', getItem('c'))
itemsMap.set('d', getItem('d'))

const slotsMap = new Map()
slotsMap.set('a', getSlot('a'))
slotsMap.set('b', getSlot('b'))
slotsMap.set('c', getSlot('c'))
slotsMap.set('d', getSlot('d'))

function getItem(name: string) {
  return document.querySelector(`[data-item=${map.get(name)}]`)
}

function getSlot(name: string) {
  return document.querySelector(`[data-slot=${map.get(name)}]`)
}

function applyOrder() {
  Array.from(map.keys()).forEach((slotName) => {
    const slot = slotsMap.get(slotName)
    const itemName = map.get(slotName)
    const item = itemsMap.get(itemName)
    slot.innerHTML = ''
    slot.appendChild(item)
  })
}

applyOrder()
