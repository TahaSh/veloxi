import { AnimatorFactory } from '../animators'
import { Animator, AnimatorConfigMap } from '../animators/types'
import { CoreView } from '../core/View'
import { cloneValue } from '../utils/CloneValue'
import { ViewRect } from '../utils/RectReader'
import { AnimatorProp } from './AnimatorProp'

export interface IViewProp {
  setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(
    animatorName: TAnimatorName,
    config?: Partial<AnimatorConfigMap[TAnimatorName]>
  ): void
  getAnimator(): Animator<unknown>
  update(ts: number, dt: number): void
  projectStyles(): string
  isTransform(): boolean
  hasChanged(): boolean
  isAnimating: boolean
}

export interface AnimatableProp {
  setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(
    animatorName: TAnimatorName,
    config?: Partial<AnimatorConfigMap[TAnimatorName]>
  ): void
  animator: AnimatorProp
}

export abstract class ViewProp<TValue> implements IViewProp {
  protected _animatorProp: AnimatorProp
  protected _animator: Animator<TValue>
  protected _initialValue: TValue
  public _previousValue: TValue
  public _targetValue: TValue
  public _currentValue: TValue
  protected _hasChanged: boolean
  protected _view: CoreView
  protected _animatorFactory: AnimatorFactory<TValue>

  constructor(
    animatorFactory: AnimatorFactory<TValue>,
    initialValue: TValue,
    parentView: CoreView
  ) {
    this._animatorProp = new AnimatorProp(this)
    this._animatorFactory = animatorFactory
    this._initialValue = cloneValue(initialValue)
    this._previousValue = cloneValue(initialValue)
    this._targetValue = cloneValue(initialValue)
    this._currentValue = cloneValue(initialValue)
    this._hasChanged = false
    this._view = parentView
    this._animator = this._animatorFactory.createInstantAnimator()
  }

  get isAnimating(): boolean {
    return this.animator.isAnimating
  }

  getAnimator(): Animator<TValue> {
    return this._animator
  }

  get animator(): AnimatorProp {
    return this._animatorProp
  }

  protected get _rect(): ViewRect {
    return this._view.rect
  }

  protected get _previousRect(): ViewRect {
    return this._view.previousRect
  }

  setAnimator<TAnimatorName extends keyof AnimatorConfigMap>(
    animatorName: TAnimatorName,
    config?: Partial<AnimatorConfigMap[TAnimatorName]>
  ): void {
    this._animator = this._animatorFactory.createAnimatorByName(
      animatorName,
      config
    )
  }

  protected _setTarget(value: TValue, runAnimation: boolean = true): void {
    this._previousValue = cloneValue(this._currentValue)
    this._targetValue = value
    if (!runAnimation) {
      this._currentValue = value
    } else {
      this._animator.reset?.()
      this.animator.markAsAnimating()
    }
    this._hasChanged = true
  }

  hasChanged() {
    return this._hasChanged
  }

  // @ts-ignore
  update(ts: number, dt: number): void {}

  abstract projectStyles(): string

  abstract isTransform(): boolean
}
