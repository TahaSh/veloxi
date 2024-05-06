import { Vec2 } from '../math'
import {
  Animator,
  AnimatorUpdateData,
  NumberAnimatorUpdateData,
  Vec2AnimatorUpdateData
} from './types'

export interface SpringAnimatorConfig {
  stiffness: number
  damping: number
  speed: number
}

export const springConfigDefaults: SpringAnimatorConfig = {
  stiffness: 0.5,
  damping: 0.75,
  speed: 10
}

const ERROR_OFFSET = 0.01

export abstract class SpringAnimator<TValue> implements Animator<TValue> {
  public readonly name = 'spring'
  protected _config: SpringAnimatorConfig
  constructor(config: SpringAnimatorConfig) {
    this._config = config
  }
  get config() {
    return this._config
  }
  abstract update(data: AnimatorUpdateData<TValue>): TValue
}

export class Vec2SpringAnimator extends SpringAnimator<Vec2> {
  _velocity: Vec2 = new Vec2(0, 0)
  update({ animatorProp, current, target, dt }: Vec2AnimatorUpdateData) {
    const force = Vec2.scale(
      Vec2.scale(Vec2.sub(current, target), -1),
      this._config.stiffness
    )

    this._velocity = Vec2.add(this._velocity, force)
    this._velocity = Vec2.scale(this._velocity, this._config.damping)

    let result = Vec2.add(
      current,
      Vec2.scale(this._velocity, dt * this._config.speed)
    )

    if (this._shouldFinish(target, current)) {
      result = target
      animatorProp.callCompleteCallback()
    }

    return result
  }

  private _shouldFinish(target: Vec2, current: Vec2) {
    const diff = Vec2.sub(target, current).magnitude
    return diff < ERROR_OFFSET && this._velocity.magnitude < ERROR_OFFSET
  }
}

export class NumberSpringAnimator extends SpringAnimator<number> {
  _velocity: number = 0
  update({ animatorProp, current, target, dt }: NumberAnimatorUpdateData) {
    const force = -(current - target) * this._config.stiffness

    this._velocity += force
    this._velocity *= this._config.damping

    let result = current + this._velocity * dt * this._config.speed

    if (this._shouldFinish(target, current)) {
      result = target
      animatorProp.callCompleteCallback()
    }

    return result
  }

  private _shouldFinish(target: number, current: number) {
    const diff = Math.abs(target - current)
    return diff < ERROR_OFFSET && Math.abs(this._velocity) < ERROR_OFFSET
  }
}
