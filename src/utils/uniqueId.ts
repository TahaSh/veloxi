let id = 0

export function getUniqueId() {
  return id++ + ''
}
