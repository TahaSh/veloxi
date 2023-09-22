export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

export function valueAtPercentage(
  from: number,
  to: number,
  percentage: number
): number {
  return from + (to - from) * percentage
}
