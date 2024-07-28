import './style.css'

import { PluginFactory, createApp } from '../../src'

const ExpandTransitionPlugin: PluginFactory = (context) => {
  context.setup(() => {
    const container = context.getView('container')!
    container.scale.setAnimator('tween')
    container.position.setAnimator('tween')
    container.layoutTransition(true)
  })
}

ExpandTransitionPlugin.pluginName = 'ExpandTransitionPlugin'

const app = createApp()
app.addPlugin(ExpandTransitionPlugin)
app.run()
