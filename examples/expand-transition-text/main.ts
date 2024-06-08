import './style.css'

import { PluginFactory, createApp } from '../../src'

const ExpandTransitionPlugin: PluginFactory = (context) => {
  context.onViewAdded((view) => {
    if (view.name === 'container') {
      view.layoutTransition(true)
      view.scale.setAnimator('tween')
      view.position.setAnimator('tween')
    } else if (view.name === 'text') {
      view.layoutTransition(true)
      view.position.setAnimator('tween')
      view.scale.setAnimator('tween')
    } else if (view.name === 'footer') {
      view.layoutTransition(true)
      view.position.setAnimator('tween')
    }
  })
}

ExpandTransitionPlugin.pluginName = 'ExpandTransitionPlugin'

const app = createApp()
app.addPlugin(ExpandTransitionPlugin)
app.run()
