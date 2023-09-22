export function minBy<T>(items: Array<T>, predicate: (item: T) => number): T {
  const values = items.map(predicate)
  const minValue = Math.min(...values)
  const index = values.indexOf(minValue)
  return items[index]
}
