import { AnimatorConfigMap } from '../animators/types'
import { IViewProp } from './ViewProp'

type CompleteCallback = () => void
type UpdateCallback = () => void

export class AnimatorProp {
  private _viewProp: IViewProp
  private _completeCallback?: CompleteCallback
  private _updateCallback?: UpdateCallback

  constructor(viewProp: IViewProp) {
    this._viewProp = viewProp
  }

  set<TAnimatorName extends keyof AnimatorConfigMap>(
    animatorName: TAnimatorName,
    config?: Partial<AnimatorConfigMap[TAnimatorName]>
  ): void {
    this._viewProp.setAnimator(animatorName, config)
  }

  get name(): keyof AnimatorConfigMap {
    return this._viewProp.getAnimator().name
  }

  onComplete(callback: CompleteCallback) {
    this._completeCallback = callback
  }

  callCompleteCallback() {
    this._completeCallback?.()
  }

  onUpdate(callback: UpdateCallback) {
    this._updateCallback = callback
  }

  callUpdateCallback() {
    this._updateCallback?.()
  }
}
