import { Vec2 } from '../math'
import {
  DynamicAnimator,
  DynamicAnimatorConfig,
  NumberDynamicAnimator,
  Vec2DynamicAnimator,
  dynamicConfigDefaults
} from './DynamicAnimator'
import { InstantAnimator } from './InstantAnimator'
import {
  NumberSpringAnimator,
  SpringAnimator,
  SpringAnimatorConfig,
  Vec2SpringAnimator,
  springConfigDefaults
} from './SpringAnimator'
import {
  NumberTweenAnimator,
  TweenAnimator,
  TweenAnimatorConfig,
  Vec2TweenAnimator,
  tweenConfigDefaults
} from './TweenAnimator'
import { Animator, AnimatorConfigMap } from './types'

export abstract class AnimatorFactory<TValue> {
  createAnimatorByName<TAnimatorName extends keyof AnimatorConfigMap>(
    animatorName: TAnimatorName,
    config?: Partial<AnimatorConfigMap[TAnimatorName]>
  ): Animator<TValue> {
    switch (animatorName) {
      case 'instant':
        return this.createInstantAnimator()
      case 'dynamic':
        return this.createDynamicAnimator(config)
      case 'tween':
        return this.createTweenAnimator(config)
      case 'spring':
        return this.createSpringAnimator(config)
    }
    return this.createInstantAnimator()
  }
  abstract createInstantAnimator(): InstantAnimator<TValue>
  abstract createTweenAnimator(
    config?: Partial<TweenAnimatorConfig>
  ): TweenAnimator<TValue>
  abstract createDynamicAnimator(
    config?: Partial<DynamicAnimatorConfig>
  ): DynamicAnimator<TValue>
  abstract createSpringAnimator(
    config?: Partial<SpringAnimatorConfig>
  ): SpringAnimator<TValue>
}

export class Vec2AnimatorFactory extends AnimatorFactory<Vec2> {
  createInstantAnimator(): InstantAnimator<Vec2> {
    return new InstantAnimator()
  }
  createTweenAnimator(config?: TweenAnimatorConfig): TweenAnimator<Vec2> {
    return new Vec2TweenAnimator({ ...tweenConfigDefaults, ...config })
  }
  createDynamicAnimator(config?: DynamicAnimatorConfig): DynamicAnimator<Vec2> {
    return new Vec2DynamicAnimator({ ...dynamicConfigDefaults, ...config })
  }
  createSpringAnimator(config?: SpringAnimatorConfig): SpringAnimator<Vec2> {
    return new Vec2SpringAnimator({ ...springConfigDefaults, ...config })
  }
}

export class NumberAnimatorFactory extends AnimatorFactory<number> {
  createInstantAnimator(): InstantAnimator<number> {
    return new InstantAnimator()
  }
  createDynamicAnimator(
    config?: DynamicAnimatorConfig
  ): DynamicAnimator<number> {
    return new NumberDynamicAnimator({ ...dynamicConfigDefaults, ...config })
  }
  createTweenAnimator(config?: TweenAnimatorConfig): TweenAnimator<number> {
    return new NumberTweenAnimator({ ...tweenConfigDefaults, ...config })
  }
  createSpringAnimator(config?: SpringAnimatorConfig): SpringAnimator<number> {
    return new NumberSpringAnimator({ ...springConfigDefaults, ...config })
  }
}
