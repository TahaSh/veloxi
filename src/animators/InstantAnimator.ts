import { Animator, AnimatorUpdateData } from './types'

export class InstantAnimator<TValue> implements Animator<TValue> {
  public readonly name = 'instant'
  protected _config: {} = {}
  get config() {
    return this._config
  }
  update(data: AnimatorUpdateData<TValue>): TValue {
    data.animatorProp.callCompleteCallback()
    return data.target
  }
}
