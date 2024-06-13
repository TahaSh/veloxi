import { PluginFactory } from '../../src'

export const TabsPlugin: PluginFactory = (context) => {
  context.setup(() => {
    const selector = context.getView('selector')!
    selector.position.setAnimator('tween')
    selector.layoutTransition(true)
  })
}

TabsPlugin.pluginName = 'TabsPlugin'
