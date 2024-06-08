import './style.css'

import { PluginFactory, createApp, View } from '../../src'

const SharedLayoutPlugin: PluginFactory = (context) => {
  let underline: View
  context.onViewAdded((view) => {
    if (view.name === 'underline') {
      underline = view
      underline.position.setAnimator('spring')
    }
  })
}

SharedLayoutPlugin.pluginName = 'SharedLayoutPlugin'

const app = createApp()
app.addPlugin(SharedLayoutPlugin)
app.run()
