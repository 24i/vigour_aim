const autoFocus = (aim, set) => {
  if (!aim.currentFocus && !aim.autoFocusTimer) {
    aim.autoFocusTimer = setTimeout(() => {
      aim.autoFocusTimer = null
      if (!aim.currentFocus) {
        set.onFocus(set)
        aim.currentFocus = set
      }
    })
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
    let x = current.xMid
    let y = current.yMid
    let xOffset = 0
    let yOffset = 0
    while ((parent = parent.parent)) {
      if ('xOffset' in parent) x += parent.xOffset
      if ('yOffset' in parent) y += parent.yOffset
    }
    let children
    while ((children = child.children)) {
      if ('xOffset' in child) xOffset += child.xOffset
      if ('yOffset' in child) yOffset += child.yOffset
      for (let i = 0, l = children.length, diff; i < l; i++) {
        const next = children[i]
        const a = x - next.xMid - xOffset
        const b = y - next.yMid - yOffset
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
