import { PluginFactory } from '../../src'

export const TabsPlugin: PluginFactory = (context) => {
  context.setup(() => {
    const root = context.getView('root')!
    const selector = context.getView('selector')!
    selector.position.setAnimator(root.data.animation as 'tween' | 'spring')
    selector.layoutTransition(true)
  })
}

TabsPlugin.pluginName = 'TabsPlugin'
TabsPlugin.scope = 'root'
