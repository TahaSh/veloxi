import './style.css'

import { PluginFactory, createApp } from '../../src'

const ExpandTransitionPlugin: PluginFactory = (context) => {
  context.onViewAdded((view) => {
    view.layoutTransition(true)
    view.position.setAnimator('spring')
    view.scale.setAnimator('spring')
  })
}

ExpandTransitionPlugin.pluginName = 'ExpandTransitionPlugin'

const app = createApp()
app.addPlugin(ExpandTransitionPlugin)
app.run()

document.body.addEventListener('click', () => {
  document.querySelector('.card')?.classList.toggle('expanded')
})
