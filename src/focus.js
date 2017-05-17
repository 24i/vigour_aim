const autoFocus = (fm, set) => {
  if (!fm.currentFocus && !fm.autoFocusTimer) {
    fm.autoFocusTimer = setTimeout(() => {
      if (!fm.currentFocus) {
        set.onFocus(set)
        fm.currentFocus = set
      }
    })
    fm.autoFocusTimer = null
  }
}

const focusElement = (fm, element) => {
  if (element.onFocus(element) !== false) {
    fm.currentFocus.onBlur(fm.currentFocus)
    fm.currentFocus = element
    return element
  }
}

const findClosestDescendant = (fm, child) => {
  if ('children' in child) {
    let current = fm.currentFocus
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

const changeFocus = (fm, direction, delta) => {
  var target = fm.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      let sibling = target
      // if direction is correct walk (delta) sibling
      while ((sibling = parent.children[sibling.index + delta])) {
        const child = findClosestDescendant(fm, sibling)
        // if new focus return
        if (focusElement(fm, child)) return child
      }
    }
    target = parent
    parent = parent.parent
  }
}

export { autoFocus, changeFocus, focusElement }
