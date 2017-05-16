const keys = {
  37: {
    value: 'left',
    direction: 'x',
    delta: -1,
    opposite: 'right'
  },
  38: {
    value: 'up',
    direction: 'y',
    delta: -1,
    opposite: 'down'
  },
  39: {
    value: 'right',
    direction: 'x',
    delta: 1,
    opposite: 'left'
  },
  40: {
    value: 'down',
    direction: 'y',
    delta: 1,
    opposite: 'up'
  }
}

const findClosestDescendant = child => {
  const x = fm.currentFocus.x.mid
  const y = fm.currentFocus.y.mid
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

const focusElement = element => {
  if (element.focusIn(element) !== false) {
    fm.currentFocus.focusOut(fm.currentFocus)
    fm.currentFocus = element
    return element
  }
}

const changeFocus = (direction, delta) => {
  var target = fm.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      const siblings = parent.children
      let sibling = target
      // if direction is correct walk (delta) sibling
      while (sibling = siblings[sibling.index + delta]) {
        const child = findClosestDescendant(sibling)
        // if new focus return
        if (focusElement(child)) return child
      }
    }
    target = parent
    parent = parent.parent
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
      const { delta, direction } = key
      if (direction) changeFocus(direction, delta)
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

const getStartPosition = (set, parent, index) => {
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

const setOnPosition = (coordinates, set) => {
  var parent = fm
  var index = coordinates[0]
  var x, y

  for (let i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) {
      const container = { index }
      if (parent.direction === 'y') {
        y = index ? parent.children[index - 1].y.end : parent.y.start
        container.direction = 'x'
        container.x = { start: parent.x.start, end: parent.x.end }
        container.y = { start: y, end: y }
      } else {
        x = index ? parent.children[index - 1].x.end : parent.x.start
        container.direction = 'y'
        container.x = { start: x, end: x }
        container.y = { start: parent.y.start, end: parent.y.end }
      }
      container.children = []
      container.parent = parent
      parent.children[index] = container
    }
    parent = parent.children[index]
    index = coordinates[++i]
  }

  // set the required infos on the element
  if (parent.direction === 'y') {
    x = set.x === void 0 ? parent.x.start : set.x
    y = set.y === void 0 ? index ? parent.children[index - 1].y.end : parent.y.start : set.y
  } else {
    x = set.x === void 0 ? index ? parent.children[index - 1].x.end : parent.x.start : set.x
    y = set.y === void 0 ? parent.y.start : set.y
  }

  set.index = index
  set.parent = parent
  set.x = { start: x, mid: x + (set.width || 1) / 2, end: x + (set.width || 1) }
  set.y = { start: y, mid: y + (set.height || 1) / 2, end: y + (set.height || 1) }
  parent.children[index] = set

  // update the positions based on last set
  while (parent) {
    const changedX = updateParentPosition(parent, set, 'x')
    const changedY = updateParentPosition(parent, set, 'y')
    if (changedY || changedX) {
      set = parent
      parent = parent.parent
    } else {
      break
    }
  }
}

const updateParentPosition = (parent, set, axis) => {
  if (axis in parent) {
    const a = parent[axis]
    if (a.end < set[axis].end) {
      a.end = set[axis].end
      a.mid = a.start + (a.end - a.start) / 2
      // if same direction stretch siblings to same size
      if ('parent' in parent && parent.direction === axis) {
        const siblings = parent.parent.children
        for (var i = siblings.length - 1; i >= 0; i--) {
          parent = siblings[i]
          parent[axis].end = a.end
          parent[axis].mid = a.mid
        }
      }
      return a
    }
  }
}

const fm = {
  currentFocus: false,
  x: {
    start: 0,
    mid: 0,
    end: 0
  },
  y: {
    start: 0,
    mid: 0,
    end: 0
  },
  children: [],
  /*
    starting direction
  */
  direction: 'y',
  /*
    register element, this can happen on eg. render
    params:
    - coordinates (obj) eg [0,0,0]
    - element (obj) eg { state, x, y, focusIn, focusUpdate, focusOut }
    returns element
  */
  register (coordinates, element) {
    addEventListeners()
    setOnPosition(coordinates, element)
    autoFocus(element)
    return element
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
      let children = fm.children
      let target
      for (let i = 0, l = element.length; i < l; i++) {
        target = children[element[i]]
        if (!target) return
        children = target.children
      }
      element = target
    }
    return focusElement(element)
  },
}

export default fm
