import { almostEqual } from '../utils/Math'
import { ElementPropValue } from './ElementPropValue'

class OpacityValue implements ElementPropValue<number> {
  private _value: number

  constructor(value: number) {
    this._value = value
  }

  get value(): number {
    return this._value
  }

  equals(b: ElementPropValue<number>): boolean {
    return almostEqual(this.value, b.value)
  }
}

export function createOpacityValue(value: string) {
  return new OpacityValue(parseFloat(value))
}
