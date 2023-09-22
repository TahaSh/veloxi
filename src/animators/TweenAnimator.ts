import { Vec2 } from '../math'
import { linear } from './easing'
import {
  Animator,
  AnimatorUpdateData,
  NumberAnimatorUpdateData,
  Vec2AnimatorUpdateData
} from './types'

export interface TweenAnimatorConfig {
  duration: number
  ease: (t: number) => number
}

export const tweenConfigDefaults: TweenAnimatorConfig = {
  duration: 500,
  ease: linear
}

export abstract class TweenAnimator<TValue> implements Animator<TValue> {
  protected _config: TweenAnimatorConfig
  protected _startTime?: number
  constructor(config: TweenAnimatorConfig) {
    this._config = config
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
    if (progress >= 1) {
      animatorProp.callCompleteCallback()
    }
    return Vec2.add(
      initial,
      Vec2.scale(Vec2.sub(target, initial), this._config.ease(progress))
    )
  }
}

export class NumberTweenAnimator extends TweenAnimator<number> {
  update({ animatorProp, initial, target, ts }: NumberAnimatorUpdateData) {
    if (!this._startTime) {
      this._startTime = ts
    }
    const progress = Math.min(1, (ts - this._startTime) / this._config.duration)
    if (progress >= 1) {
      animatorProp.callCompleteCallback()
    }
    return initial + (target - initial) * this._config.ease(progress)
  }
}
