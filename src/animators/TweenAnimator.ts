import { Vec2 } from '../math'
import { CSSNumber, createCSSNumber } from '../utils/CSSNumber'
import { almostEqual } from '../utils/Math'
import { linear } from './easing'
import {
  Animator,
  AnimatorUpdateData,
  CSSNumbersAnimatorUpdateData,
  NumberAnimatorUpdateData,
  Vec2AnimatorUpdateData
} from './types'

export interface TweenAnimatorConfig {
  duration: number
  ease: (t: number) => number
}

export const tweenConfigDefaults: TweenAnimatorConfig = {
  duration: 350,
  ease: linear
}

export abstract class TweenAnimator<TValue> implements Animator<TValue> {
  public readonly name = 'tween'
  protected _config: TweenAnimatorConfig
  protected _startTime?: number
  constructor(config: TweenAnimatorConfig) {
    this._config = config
  }
  get config() {
    return this._config
  }
  abstract update(data: AnimatorUpdateData<TValue>): TValue
  reset(): void {
    this._startTime = undefined
  }
}

export class Vec2TweenAnimator extends TweenAnimator<Vec2> {
  update({ animatorProp, initial, target, ts }: Vec2AnimatorUpdateData) {
    if (!this._startTime) {
      this._startTime = ts
    }
    const progress = Math.min(1, (ts - this._startTime) / this._config.duration)
    if (almostEqual(progress, 1)) {
      requestAnimationFrame(() => {
        animatorProp.callCompleteCallback()
      })
      return target
    }
    return Vec2.add(
      initial,
      Vec2.scale(Vec2.sub(target, initial), this._config.ease(progress))
    )
  }
}

export class CSSNumbersTweenAnimator extends TweenAnimator<CSSNumber[]> {
  update({ animatorProp, initial, target, ts }: CSSNumbersAnimatorUpdateData) {
    if (!this._startTime) {
      this._startTime = ts
    }
    const progress = Math.min(1, (ts - this._startTime) / this._config.duration)
    if (almostEqual(progress, 1)) {
      requestAnimationFrame(() => {
        animatorProp.callCompleteCallback()
      })
      return target
    }

    return initial.map((initialValue, index) => {
      const targetValue = target[index]
      const unit =
        targetValue.value === 0 ? initialValue.unit : targetValue.unit
      const value =
        initialValue.value +
        this._config.ease(progress) * (target[index].value - initialValue.value)
      return createCSSNumber(`${value}${unit}`)
    })
  }
}

export class NumberTweenAnimator extends TweenAnimator<number> {
  update({ animatorProp, initial, target, ts }: NumberAnimatorUpdateData) {
    if (!this._startTime) {
      this._startTime = ts
    }
    const progress = Math.min(1, (ts - this._startTime) / this._config.duration)
    if (almostEqual(progress, 1)) {
      requestAnimationFrame(() => {
        animatorProp.callCompleteCallback()
      })
      return target
    }
    return initial + (target - initial) * this._config.ease(progress)
  }
}
