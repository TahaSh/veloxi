import { almostEqual } from './Math'

export interface CSSNumber {
  value: number
  unit: string
  valueWithUnit: string
}

export function createCSSNumber(cssValue: string): CSSNumber {
  let match = cssValue.match(/^([\d.]+)([a-zA-Z%]*)$/)
  if (!match) {
    match = '0px'.match(/^([\d.]+)([a-zA-Z%]*)$/)!
  }
  const value = parseFloat(match[1])
  const unit = match[2]
  return { value, unit, valueWithUnit: cssValue }
}

function isEqual(arr1: CSSNumber[], arr2: CSSNumber[], almost = false) {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false

  for (let i = 0; i < arr1.length; i++) {
    if (almost && !almostEqual(arr1[i].value, arr2[i].value)) {
      return false
    } else if (arr1[i].value !== arr2[i].value) {
      return false
    }
  }

  return true
}

export function CSSNumbersEqual(a: CSSNumber[], b: CSSNumber[]) {
  return isEqual(a, b)
}

export function CSSNumbersAlmostEqual(a: CSSNumber[], b: CSSNumber[]) {
  return isEqual(a, b, true)
}
