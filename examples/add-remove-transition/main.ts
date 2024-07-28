import './style.css'

import { PluginFactory, createApp, View } from '../../src'

const AddRemovePlugin: PluginFactory = (context) => {
  context.setup(() => {
    const root = context.getView('root')!
    root.position.setAnimator('spring')
    root.scale.setAnimator('spring')
    root.layoutTransition(true)
  })
  context.onViewAdded((view) => {
    if (view.name === 'card') {
      configureCard(view)
    }
  })

  function configureCard(card: View) {
    card.position.setAnimator('spring')
    card.opacity.setAnimator('tween')

    if (context.initialized) {
      card.onAdd({
        beforeEnter: (v: View) => {
          v.opacity.set(0, false)
          v.position.set({ y: v.position.initialY - 100 }, false)
        },
        afterEnter: (v: View) => {
          v.opacity.reset(true)
          v.position.reset(true)
        }
      })
    }
    card.onRemove((v: View, done) => {
      v.position.set({ y: v.position.y + 100 }, true)
      v.opacity.set(0, true)
      v.position.animator.onComplete(() => {
        done()
      })
    })
  }
}

AddRemovePlugin.pluginName = 'AddRemovePlugin'

const app = createApp()
app.addPlugin(AddRemovePlugin)
app.run()

const cards = document.querySelectorAll('.card')
Array.from(cards).forEach((card) => {
  card.addEventListener('click', removeCard)
})

function removeCard(event: Event) {
  const card = (event.target as HTMLElement).closest('.card') as HTMLElement
  card?.remove()
}

const addButton = document.querySelector('.action-button.add')

const cardsContainer = document.querySelector('.cards')

addButton?.addEventListener('click', () => {
  const html = String.raw`
  <div class="card" data-vel-view="card" data-vel-plugin="AddRemovePlugin">
    ${Math.round(Math.random() * 100)}
  </div>
  `
  const div = document.createElement('div')
  div.innerHTML = html.trim()
  const card = div.firstChild!
  card.addEventListener('click', removeCard)
  cardsContainer?.appendChild(card)
})
