import { Vec2 } from '../math'
import {
  Animator,
  AnimatorUpdateData,
  NumberAnimatorUpdateData,
  Vec2AnimatorUpdateData
} from './types'

const ERROR_OFFSET = 0.01

export interface DynamicAnimatorConfig {
  speed: number
}

export const dynamicConfigDefaults: DynamicAnimatorConfig = {
  speed: 15
}

export abstract class DynamicAnimator<TValue> implements Animator<TValue> {
  protected _config: DynamicAnimatorConfig
  constructor(config: DynamicAnimatorConfig) {
    this._config = config
  }
  abstract update(data: AnimatorUpdateData<TValue>): TValue
}

export class Vec2DynamicAnimator extends DynamicAnimator<Vec2> {
  update({ animatorProp, current, target, dt }: Vec2AnimatorUpdateData) {
    const diff = Vec2.sub(target, current)
    const velocity = Vec2.scale(diff, this._config.speed)
    let result = Vec2.add(current, Vec2.scale(velocity, dt))

    if (this._shouldFinish(target, current, velocity)) {
      result = target
      animatorProp.callCompleteCallback()
    }

    animatorProp.callUpdateCallback()

    return result
  }

  private _shouldFinish(target: Vec2, current: Vec2, velocity: Vec2) {
    const diff = Vec2.sub(target, current).magnitude
    return diff < ERROR_OFFSET && velocity.magnitude < ERROR_OFFSET
  }
}

export class NumberDynamicAnimator extends DynamicAnimator<number> {
  update({ animatorProp, current, target, dt }: NumberAnimatorUpdateData) {
    const diff = target - current
    const velocity = diff * this._config.speed

    let result = current + velocity * dt

    if (this._shouldFinish(target, current, velocity)) {
      result = target
      animatorProp.callCompleteCallback()
    }

    animatorProp.callUpdateCallback()

    return result
  }

  private _shouldFinish(target: number, current: number, velocity: number) {
    const diff = Math.abs(target - current)
    return diff < ERROR_OFFSET && Math.abs(velocity) < ERROR_OFFSET
  }
}
