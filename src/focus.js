const autoFocus = (aim, set) => {
  if (!aim.currentFocus && !aim.autoFocusTimer) {
    aim.autoFocusTimer = setTimeout(() => {
      if (!aim.currentFocus) {
        set.onFocus(set)
        aim.currentFocus = set
      }
    })
    aim.autoFocusTimer = null
  }
}

const focusElement = (aim, target) => {
  if (target.onFocus(target) !== false) {
    aim.currentFocus.onBlur(aim.currentFocus)
    aim.currentFocus = target
    return target
  }
}

const findClosestDescendant = (aim, child) => {
  if ('children' in child) {
    let current = aim.currentFocus
    let parent = current
    let x = current.x.mid
    let y = current.y.mid
    let offsetX = 0
    let offsetY = 0
    while ((parent = parent.parent)) {
      if ('offset' in parent.x) x += parent.x.offset
      if ('offset' in parent.y) y += parent.y.offset
    }
    let children
    while ((children = child.children)) {
      if ('offset' in child.x) offsetX += child.x.offset
      if ('offset' in child.y) offsetY += child.y.offset
      for (let i = 0, l = children.length, diff; i < l; i++) {
        const next = children[i]
        const a = x - next.x.mid - offsetX
        const b = y - next.y.mid - offsetY
        const c = Math.sqrt(a * a + b * b)
        if (diff === void 0 || c < diff) {
          child = next
          diff = c
        }
      }
    }
  }
  return child
}

const changeFocus = (aim, direction, delta) => {
  var target = aim.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      let sibling = target
      // if direction is correct walk (delta) sibling
      while ((sibling = parent.children[sibling.index + delta])) {
        const child = findClosestDescendant(aim, sibling)
        // if new focus return
        if (focusElement(aim, child)) return child
      }
    }
    target = parent
    parent = parent.parent
  }
}

export { autoFocus, changeFocus, focusElement }
