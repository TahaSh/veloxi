import { View } from '../core/View'
import { Point } from '../view-props/types'

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max)
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function distanceBetweenTwoPoints(pointA: Point, pointB: Point): number {
  const dx = pointB.x - pointA.x
  const dy = pointB.y - pointA.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function valueAtPercentage(
  from: number,
  to: number,
  percentage: number
): number {
  return from + (to - from) * percentage
}

export function almostEqual(a: number, b: number): boolean {
  const EPSILON = 0.01
  const diff = a - b
  return Math.abs(diff) <= EPSILON
}

export function remap(
  value: number,
  a: number,
  b: number,
  c: number,
  d: number
) {
  return ((value - a) / (b - a)) * (d - c) + c
}

export function pointToViewProgress(
  point: Partial<Point>,
  view: View,
  maxDistance: number
) {
  const viewScroll = view.getScroll()
  const viewPositionX = view.position.x - viewScroll.x
  const viewPositionY = view.position.y - viewScroll.y
  const x = point.x || viewPositionX
  const y = point.y || viewPositionY
  const dx = Math.abs(viewPositionX - x)
  const dy = Math.abs(viewPositionY - y)
  const distance = Math.sqrt(dx * dx + dy * dy)
  const progress = clamp(0, distance / maxDistance, 1)
  return 1 - progress
}
