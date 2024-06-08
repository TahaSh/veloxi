import './style.css'
import { PluginFactory, createApp } from '../../src'

const ElementsTransitionPlugin: PluginFactory = (context) => {
  context.onViewAdded((view) => {
    if (view.name === 'item') {
      view.opacity.setAnimator('tween')
      view.position.setAnimator('tween')
      if (context.initialized) {
        view.onAdd({
          afterRemoved: true,
          beforeEnter(v) {
            v.opacity.set(0, false)
            v.position.set({ y: v.position.initialY + 100 }, false)
          },
          afterEnter(v) {
            v.opacity.reset()
            v.position.reset()
          }
        })
      }
      view.onRemove((v, done) => {
        v.opacity.set(0)
        v.position.set({ y: v.position.initialY + 100 })
        v.opacity.animator.onComplete(done)
      })
    }
  })
}

ElementsTransitionPlugin.pluginName = 'ElementsTransitionPlugin'

const app = createApp()
app.addPlugin(ElementsTransitionPlugin)
app.run()
