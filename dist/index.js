const $2537101590_keys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

const $2537101590_findClosestDescendant = child => {
  const x = $2537101590_fm.currentFocus.x.mid
  const y = $2537101590_fm.currentFocus.y.mid
  var children
  while (children = child.children) {
    for (let i = 0, l = children.length, diff; i < l; i++) {
      const next = children[i]
      const a = x - next.x.mid
      const b = y - next.y.mid
      const c = Math.sqrt(a * a + b * b)
      if (diff === void 0 || c < diff) {
        child = next
        diff = c
      }
    }
  }
  return child
}

const $2537101590_focusElement = element => {
  if (element.focusIn(element) !== false) {
    $2537101590_fm.currentFocus.focusOut($2537101590_fm.currentFocus)
    $2537101590_fm.currentFocus = element
    return element
  }
}

const $2537101590_changeFocus = (direction, delta) => {
  var target = $2537101590_fm.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      const siblings = parent.children
      let sibling = target
      // if direction is correct walk (delta) sibling
      while (sibling = siblings[sibling.index + delta]) {
        const child = $2537101590_findClosestDescendant(sibling)
        // if new focus return
        if ($2537101590_focusElement(child)) return
      }
    }
    target = parent
    parent = parent.parent
  }
}

const $2537101590_onKeyDown = event => {
  const key = $2537101590_keys[event.keyCode]
  if (key) {
    const focusUpdate = $2537101590_fm.currentFocus.focusUpdate
    const handledByElement = focusUpdate
      ? focusUpdate($2537101590_fm.currentFocus)
      : false
    if (handledByElement === false) {
      let delta, direction
      if (key === 'up') {
        direction = 'y'
        delta = -1
      } else if (key === 'down') {
        direction = 'y'
        delta = 1
      } else if (key === 'left') {
        direction = 'x'
        delta = -1
      } else if (key === 'right') {
        direction = 'x'
        delta = 1
      }
      if (direction) {
        $2537101590_changeFocus(direction, delta)
      }
    }
  }
}

const $2537101590_addEventListeners = () => {
  if (!$2537101590_fm.addedListeners) {
    global.addEventListener('keydown', $2537101590_onKeyDown)
    $2537101590_fm.addedListeners = true
  }
}

const $2537101590_autoFocus = set => {
  if (!$2537101590_fm.currentFocus && !$2537101590_fm.autoFocusTimer) {
    $2537101590_fm.autoFocusTimer = setTimeout(() => {
      if (!$2537101590_fm.currentFocus) {
        set.focusIn(set)
        $2537101590_fm.currentFocus = set
      }
    })
    $2537101590_fm.autoFocusTimer = null
  }
}

const $2537101590_updatePosition = (parent, axis, set) => {
  var changed
  if (axis in parent) {
    if (parent[axis].start === void 0 || parent[axis].start > set[axis].start) {
      parent[axis].start = set[axis].start
      changed = true
    }
    if (parent[axis].end === void 0 || parent[axis].end < set[axis].end) {
      parent[axis].end = set[axis].end
      changed = true
    }
    if (changed) {
      parent[axis].mid = parent[axis].start + (parent[axis].end - parent[axis].start) / 2
    }
  }
  return changed
}

const $2537101590_getStartPosition = (set, parent, index) => {
  if (parent.direction === 'x') {
    return {
      x: set.x === void 0
      ? index ? parent.children[index - 1].x.end : parent.x ? parent.x.start : 0
      : set.x,
      y: set.y === void 0
      ? parent.y ? parent.y.start : 0
      : set.y
    }
  } else {
    return {
      x: set.x === void 0
      ? parent.x ? parent.x.start : 0
      : set.x,
      y: set.y === void 0
      ? index ? parent.children[index - 1].y.end : parent.y ? parent.y.start : 0
      : set.y
    }
  }
}

const $2537101590_setOnPosition = (coordinates, set) => {
  var parent = $2537101590_fm
  var index = coordinates[0]

  for (let i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) {
      const { x, y } = $2537101590_getStartPosition(set, parent, index)
      parent.children[index] = {
        x: { start: x },
        y: { start: y },
        children: [],
        direction: parent.direction === 'x' ? 'y' : 'x',
        index,
        parent
      }
    }
    parent = parent.children[index]
    index = coordinates[++i]
  }

  const { x, y } = $2537101590_getStartPosition(set, parent, index)

  set.index = index
  set.parent = parent
  set.x = {
    start: x,
    mid: x + (set.width || 1) / 2,
    end: x + (set.width || 1)
  }
  set.y = {
    start: y,
    mid: y + (set.height || 1) / 2,
    end: y + (set.height || 1)
  }
  parent.children[index] = set

  // update the positions based on last set
  while (parent) {
    const xChanged = $2537101590_updatePosition(parent, 'x', set)
    const yChanged = $2537101590_updatePosition(parent, 'y', set)
    if (!xChanged && !yChanged) break
    parent = parent.parent
  }
}

const $2537101590_fm = {
  currentFocus: false,
  children: [],
  /*
    starting direction
  */
  direction: 'x',
  /*
    register element, this can happen on eg. render
    params:
    - coordinates (obj) eg [0,0,0]
    - element (obj) eg { state, x, y, focusIn, focusUpdate, focusOut }
    returns element
  */
  register (coordinates, element) {
    $2537101590_addEventListeners()
    $2537101590_setOnPosition(coordinates, element)
    $2537101590_autoFocus(element)
    return element
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
  */
  unregister (coordinates) {
    $2537101590_setOnPosition(coordinates, null)
    // refocus here
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
    - set (obj) eg { x }
  */
  update (coordinates, set) {
    console.log('- update', coordinates, set)
  },
  /*
    focus element
    params:
    - coordinates (obj) eg [0,0,0]
    OR
    - element (obj)
    returns element if new focus
  */
  focus (element) {
    if (Array.isArray(element)) {
      let children = $2537101590_fm.children
      let target
      for (let i = 0, l = element.length; i < l; i++) {
        target = children[element[i]]
        if (!target) return
        children = target.children
      }
      element = target
    }
    return $2537101590_focusElement(element)
  },
}

var $2537101590 = $2537101590_fm


module.exports = $2537101590