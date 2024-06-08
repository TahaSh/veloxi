import { AnimatorConfigMap } from '../animators/types'
import { IViewProp } from './ViewProp'

type CompleteCallback = () => void
type UpdateCallback = () => void

export class AnimatorProp {
  private _viewProp: IViewProp
  private _completeCallback?: CompleteCallback
  private _updateCallback?: UpdateCallback
  private _isAnimating: boolean

  constructor(viewProp: IViewProp) {
    this._viewProp = viewProp
    this._isAnimating = false
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

  get isAnimating() {
    return this._isAnimating
  }

  markAsAnimating() {
    this._isAnimating = true
  }

  callCompleteCallback() {
    this._completeCallback?.()
    this._isAnimating = false
  }

  onUpdate(callback: UpdateCallback) {
    this._updateCallback = callback
  }

  callUpdateCallback() {
    this._updateCallback?.()
  }
}
