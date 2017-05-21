const autoFocus = (aim, set) => {
  if (!aim.currentFocus && !aim.autoFocusTimer) {
    aim.autoFocusTimer = setTimeout(() => {
      aim.autoFocusTimer = null
      if (!aim.currentFocus) {
        focusElement(aim, set)
      }
    })
  }
}

const focusElement = (aim, target) => {
  if (target !== aim.currentFocusAttempt) {
    aim.currentFocusAttempt = target
    if (!('onFocus' in target) || target.onFocus(target, aim) !== false) {
      const blurTarget = aim.currentFocus
      aim.currentFocus = target
      if (blurTarget && 'onBlur' in blurTarget) {
        blurTarget.onBlur(blurTarget, aim)
      }
      return target
    }
    aim.currentFocusAttempt = null
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
    let top, left, right, bottom
    while ((parent = parent.parent)) {
      if ('xOffset' in parent) x += parent.xOffset
      if ('yOffset' in parent) y += parent.yOffset
    }
    let children
    while ((children = child.children)) {
      if ('xOffset' in child) {
        xOffset += child.xOffset
      }
      if ('yOffset' in child) {
        yOffset += child.yOffset
      }
      if ('hOffset' in child) {
        top = !top || child.y > top ? child.y : top
        bottom = top + child.hOffset
      }
      if ('hOffset' in child) {
        left = !left || child.y > left ? child.y : left
        right = left + child.hOffset
      }
      for (let i = 0, l = children.length, diff; i < l; i++) {
        const next = children[i]
        const a = x - next.xMid - xOffset
        const b = y - next.yMid - yOffset
        const c = Math.sqrt(a * a + b * b)
        if (diff === void 0 || c < diff) {
          if (top || bottom) {
            if (next.y + yOffset >= bottom || next.yEnd + yOffset <= top) {
              continue
            }
          }
          if (left || right) {
            if (next.x + xOffset >= right || next.xEnd + xOffset <= left) {
              continue
            }
          }
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
