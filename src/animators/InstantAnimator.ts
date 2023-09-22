import { Animator, AnimatorUpdateData } from './types'

export class InstantAnimator<TValue> implements Animator<TValue> {
  protected _config: {} = {}
  update(data: AnimatorUpdateData<TValue>): TValue {
    return data.target
  }
}
