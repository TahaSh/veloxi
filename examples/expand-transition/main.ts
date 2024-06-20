import './style.css'

import { PluginFactory, createApp, View } from '../../src'
import {
  ClickEvent,
  ClickEventPlugin
} from '../../src/builtin-plugins/ClickEventPlugin'

const ExpandTransitionPlugin: PluginFactory = (context) => {
  const clickEventPlugin = context.useEventPlugin(ClickEventPlugin)
  clickEventPlugin.on(ClickEvent, ({ view }) => {
    if (view.name === 'card') {
      context.getViews('card').forEach((card) => {
        if (card === view) {
          card.styles.zIndex = '10'
        } else {
          card.styles.zIndex = ''
        }
      })
    }
  })

  context.onViewAdded((view) => {
    view.layoutTransition(true)
    view.borderRadius.enableUpdateWithScale()
    if (view.name === 'card') {
      configureCard(view)
    }
    view.position.setAnimator('tween', { duration: 250 })
    view.scale.setAnimator('tween', { duration: 250 })
  })

  function configureCard(card: View) {
    card.layoutTransition(false)
    clickEventPlugin.addView(card)
  }
}

ExpandTransitionPlugin.pluginName = 'ExpandTransitionPlugin'

const app = createApp()
app.addPlugin(ExpandTransitionPlugin)
app.run()

const cards = document.querySelectorAll('.card')
Array.from(cards).forEach((card) => {
  card.addEventListener('click', expandCard)
})

function expandCard(event: Event) {
  const target = event.target as HTMLElement
  const card = target.closest('.card') as HTMLElement
  card.classList.add('expanded')
  if (target.classList.contains('card-overlay')) {
    card.classList.remove('expanded')
  }
}
