const keys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

const log = obj => JSON.stringify(obj, (key, value) => key !== 'parent' ? value : void 0, 2)
const moveFocus = (direction, delta) => {
  if (direction) {
    const perpendicular = direction === 'y' ? 'x' : 'y'
    let target = fm.currentFocus
    while (target) {
      const parent = target.parent
      if (target.direction === direction) {
        const siblings = parent.children
        let sibling = target

        while (sibling = siblings[sibling.index + delta]) {
          let child = sibling
          let children

          while (children = child.children) {
            for (let i = children.length - 1, diff; i >= 0; i--) {
              const next = children[i]
              const a = fm.currentFocus[perpendicular].mid - next[perpendicular].mid
              const b = fm.currentFocus[direction].mid - next[direction].mid
              const c = Math.sqrt(a * a + b * b)
              if (diff === void 0 || c < diff) {
                child = next
                diff = c
              }
            }
          }

          if (child.focusIn(child) !== false) {
            fm.currentFocus.focusOut(fm.currentFocus)
            fm.currentFocus = child
            return
          }
        }
      }
      target = parent
    }
  }
}

const addEventListeners = () => {
  if (!fm.addedListeners) {
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
          moveFocus(direction, delta)
        }
      }
    }
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

const setOnPosition = (coordinates, set) => {
  var children = fm.children
  var parent = fm
  var direction = 'x'

  for (var i = 0, n = coordinates.length - 1; i <= n; i++) {
    const index = coordinates[i]

    let startX, startY
    if (direction === 'x') {
      startX = set.x === void 0
        ? index ? children[index - 1].x.end : parent.x ? parent.x.start : 0
        : set.x
      startY = set.y === void 0
        ? parent.y ? parent.y.start : 0
        : set.y
    } else {
      startX = set.x === void 0
        ? parent.x ? parent.x.start : 0
        : set.x
      startY = set.y === void 0
        ? index ? children[index - 1].y.end : parent.y ? parent.y.start : 0
        : set.y
    }

    if (i === n) {
      set.index = index
      set.parent = parent
      set.direction = direction
      set.x = {
        start: startX,
        mid: startX + (set.width || 1) / 2,
        end: startX + (set.width || 1)
      }
      set.y = {
        start: startY,
        mid: startY + (set.height || 1) / 2,
        end: startY + (set.height || 1)
      }

      children[index] = set

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
    } else {
      if (!children[index]) {
        children[index] = {
          x: { start: startX },
          y: { start: startY },
          children: [],
          direction,
          index,
          parent
        }
      }
      parent = children[index]
      children = parent.children
      direction = direction === 'x' ? 'y' : 'x'
    }
  }
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
