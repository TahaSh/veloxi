import { PluginFactory } from '../../src'

export const ElementsTransitionPlugin: PluginFactory = (context) => {
  context.onViewAdded((view) => {
    if (view.name === 'item') {
      view.opacity.setAnimator('tween', { duration: 500 })
      view.position.setAnimator('tween', { duration: 500 })
      view.onAdd({
        onInitialLoad: false,
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
      view.onRemove((v, done) => {
        v.opacity.set(0)
        v.position.set({ y: v.position.initialY + 100 })
        v.opacity.animator.onComplete(done)
      })
    }
  })
}

ElementsTransitionPlugin.pluginName = 'ElementsTransitionPlugin'
