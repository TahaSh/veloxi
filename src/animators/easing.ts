export type easeFn = (t: number) => number

export function linear(t: number) {
  return t
}

export function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
