import { Vec2 } from '../math'
import { CSSNumber } from '../utils/CSSNumber'
import { AnimatorProp } from '../view-props/AnimatorProp'
import { DynamicAnimatorConfig } from './DynamicAnimator'
import { SpringAnimatorConfig } from './SpringAnimator'
import { TweenAnimatorConfig } from './TweenAnimator'

export interface AnimatorUpdateData<TValue> {
  animatorProp: AnimatorProp
  initial: TValue
  current: TValue
  target: TValue
  ts: number
  dt: number
}

export type Vec2AnimatorUpdateData = AnimatorUpdateData<Vec2>
export type NumberAnimatorUpdateData = AnimatorUpdateData<number>
export type CSSNumbersAnimatorUpdateData = AnimatorUpdateData<CSSNumber[]>

type AnimatorName = keyof AnimatorConfigMap

export interface Animator<TValue> {
  readonly name: AnimatorName
  config: AnimatorConfigMap[keyof AnimatorConfigMap]
  update(data: AnimatorUpdateData<TValue>): TValue
  reset?(): void
}

export interface AnimatorConfigMap {
  instant: {}
  tween: TweenAnimatorConfig
  dynamic: DynamicAnimatorConfig
  spring: SpringAnimatorConfig
}
