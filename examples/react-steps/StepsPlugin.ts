import { PluginFactory, View } from '../../src'

export class StepsEvent {
  testValue: string
  constructor(props: { testValue: string }) {
    this.testValue = props.testValue
  }
}

export const StepsPlugin: PluginFactory = (context) => {
  context.setup(() => {
    const container = context.getView('container')!
    container.scale.setAnimator('spring')
    container.position.setAnimator('spring')
    container.layoutTransition(true)
    context.emit(StepsEvent, { testValue: 'Example Value' })
  })

  function setupBody(body: View) {
    body.opacity.setAnimator('tween', { duration: 400 })
    body.position.setAnimator('tween', { duration: 400 })

    body.onAdd({
      afterRemoved: true,
      beforeEnter(v) {
        v.opacity.set(0, false)
        v.position.set({ x: v.position.initialX - 100 }, false)
      },
      afterEnter(v) {
        v.opacity.reset()
        v.position.reset()
      }
    })
    body.onRemove((v, done) => {
      v.opacity.set(0)
      v.position.set({ x: v.position.initialX + 100 })
      v.opacity.animator.onComplete(done)
    })
  }

  context.onViewAdded((view) => {
    if (view.name === 'body-section') {
      setupBody(view)
    }
  })
}

StepsPlugin.pluginName = 'StepsPlugin'
