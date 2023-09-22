import { Vec2 } from '../math'
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

export interface Animator<TValue> {
  update(data: AnimatorUpdateData<TValue>): TValue
  reset?(): void
}

export interface AnimatorConfigMap {
  instant: {}
  tween: TweenAnimatorConfig
  dynamic: DynamicAnimatorConfig
  spring: SpringAnimatorConfig
}
