import { Vec2 } from '../math'
import { CSSNumber, createCSSNumber } from '../utils/CSSNumber'
import {
  Animator,
  AnimatorUpdateData,
  CSSNumbersAnimatorUpdateData,
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
  public readonly name = 'dynamic'
  protected _config: DynamicAnimatorConfig
  constructor(config: DynamicAnimatorConfig) {
    this._config = config
  }
  get config() {
    return this._config
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
      requestAnimationFrame(() => {
        animatorProp.callCompleteCallback()
      })
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
      requestAnimationFrame(() => {
        animatorProp.callCompleteCallback()
      })
    }

    animatorProp.callUpdateCallback()

    return result
  }

  private _shouldFinish(target: number, current: number, velocity: number) {
    const diff = Math.abs(target - current)
    return diff < ERROR_OFFSET && Math.abs(velocity) < ERROR_OFFSET
  }
}

export class CSSNumbersDynamicAnimator extends DynamicAnimator<CSSNumber[]> {
  update({ animatorProp, current, target, dt }: CSSNumbersAnimatorUpdateData) {
    return target.map((oneTarget, index) => {
      const oneCurrent = current[index]

      const unit = oneTarget.value === 0 ? oneCurrent.unit : oneTarget.unit

      const diff = oneTarget.value - oneCurrent.value
      const velocity = diff * this._config.speed

      const resultValue = oneCurrent.value + velocity * dt
      let result = createCSSNumber(`${resultValue}${unit}`)

      if (this._shouldFinish(oneTarget.value, oneCurrent.value, velocity)) {
        result = oneTarget
        requestAnimationFrame(() => {
          animatorProp.callCompleteCallback()
        })
      }

      animatorProp.callUpdateCallback()

      return result
    })
  }

  private _shouldFinish(target: number, current: number, velocity: number) {
    const diff = Math.abs(target - current)
    return diff < ERROR_OFFSET && Math.abs(velocity) < ERROR_OFFSET
  }
}
