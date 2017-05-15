const keys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

const log = obj => JSON.stringify(obj, (key, value) => key !== 'parent' ? value : void 0, 2)

const findClosestDescendant = child => {
  const x = fm.currentFocus.x.mid
  const y = fm.currentFocus.y.mid
  var children
  while (children = child.children) {
    for (let i = children.length - 1, diff; i >= 0; i--) {
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

const changeFocus = (direction, delta) => {
  var target = fm.currentFocus
  // walk up from currentFocus
  while (target) {
    if (target.direction === direction) {
      const siblings = target.parent.children
      let sibling = target
      // if direction is correct walk (delta) sibling
      while (sibling = siblings[sibling.index + delta]) {
        const child = findClosestDescendant(sibling)
        // if child focusIn doesnt cancel (returns false), complete transaction
        if (child.focusIn(child) !== false) {
          fm.currentFocus.focusOut(fm.currentFocus)
          fm.currentFocus = child
          return
        }
      }
    }
    target = target.parent
  }
}

const onKeyDown = event => {
  const key = keys[event.keyCode]
  if (key) {
    const focusUpdate = fm.currentFocus.focusUpdate
    const handledByElement = focusUpdate
      ? focusUpdate(fm.currentFocus)
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
        changeFocus(direction, delta)
      }
    }
  }
}

const addEventListeners = () => {
  if (!fm.addedListeners) {
    global.addEventListener('keydown', onKeyDown)
    fm.addedListeners = true
  }
}

const autoFocus = set => {
  if (!fm.currentFocus && !fm.autoFocusTimer) {
    fm.autoFocusTimer = setTimeout(() => {
      if (!fm.currentFocus) {
        set.focusIn(set)
        fm.currentFocus = set
      }
    })
    fm.autoFocusTimer = null
  }
}

const updatePositioningUpwards = (set, parent) => {
  while (parent.x) {
    let xChanged, yChanged
    if (parent.x.start === void 0 || parent.x.start > set.x.start) {
      parent.x.start = set.x.start
      xChanged = true
    }
    if (parent.x.end === void 0 || parent.x.end < set.x.end) {
      parent.x.end = set.x.end
      xChanged = true
    }
    if (parent.y.start === void 0 || parent.y.start > set.y.start) {
      parent.y.start = set.y.start
      yChanged = true
    }
    if (parent.y.end === void 0 || parent.y.end < set.y.end) {
      parent.y.end = set.y.end
      yChanged = true
    }
    if (!xChanged && !yChanged) {
      break
    }
    if (xChanged) {
      parent.x.mid = parent.x.start + (parent.x.end - parent.x.start) / 2
    }
    if (yChanged) {
      parent.y.mid = parent.y.start + (parent.y.end - parent.y.start) / 2
    }
    parent = parent.parent
  }
}

const getStartPosition = (set, parent, direction, index) => {
  if (direction === 'x') {
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

const setOnPosition = (coordinates, set) => {
  var parent = fm
  var direction = 'x'
  var index = coordinates[0]

  for (let i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) {
      const { x, y } = getStartPosition(set, parent, direction, index)
      parent.children[index] = {
        x: { start: x },
        y: { start: y },
        children: [],
        direction,
        index,
        parent
      }
    }
    parent = parent.children[index]
    children = parent.children
    direction = direction === 'x' ? 'y' : 'x'
    index = coordinates[++i]
  }

  const { x, y } = getStartPosition(set, parent, direction, index)

  set.index = index
  set.parent = parent
  set.direction = direction
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
  updatePositioningUpwards(set, parent)
}

const fm = {
  currentFocus: false,
  children: [],
  /*
    register element, this can happen on eg. render
    params:
    - coordinates (obj) eg [0,0,0]
    - set (obj) eg { state, x, y, focusIn, focusUpdate, focusOut }
  */
  register (coordinates, set) {
    addEventListeners()
    setOnPosition(coordinates, set)
    autoFocus(set)
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
  */
  unregister (coordinates) {
    setOnPosition(coordinates, null)
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
  }
}

export default fm
