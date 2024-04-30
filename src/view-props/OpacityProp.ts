import { ViewProp } from './ViewProp'

export class OpacityProp extends ViewProp<number> {
  get value() {
    return this._currentValue
  }

  set(value: number, runAnimation: boolean = true) {
    this._setTarget(value, runAnimation)
  }

  reset(runAnimation: boolean = true) {
    this._setTarget(1, runAnimation)
  }

  update(ts: number, dt: number): void {
    if (this._targetValue === this._currentValue) return

    this._currentValue = this._animator.update({
      animatorProp: this._animatorProp,
      current: this._currentValue,
      target: this._targetValue,
      initial: this._previousValue,
      ts,
      dt
    })
  }

  projectStyles(): string {
    return `opacity: ${this.value};`
  }

  isTransform(): boolean {
    return false
  }
}
