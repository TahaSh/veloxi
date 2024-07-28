import './style.css'

import { PluginFactory, createApp } from '../../src'

const ExpandTransitionPlugin: PluginFactory = (context) => {
  context.onViewAdded((view) => {
    view.layoutTransition(true)
    view.position.setAnimator('dynamic', { speed: 5 })
    view.scale.setAnimator('dynamic', { speed: 5 })
  })
}

ExpandTransitionPlugin.pluginName = 'ExpandTransitionPlugin'

const app = createApp()
app.addPlugin(ExpandTransitionPlugin)
app.run()

document.body.addEventListener('click', () => {
  document.querySelector('.card')?.classList.toggle('expanded')
})
