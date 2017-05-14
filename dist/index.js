const $2537101590_keys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

const $2537101590_moveFocus = (direction, delta) => {
  if (direction) {
    const currentPos = $2537101590_fm.currentFocus.pos
    let target = $2537101590_fm.currentFocus
    while (target) {
      const parent = target.parent
      if (target.direction === direction) {
        const siblings = parent.children
        let sibling = target
        while (sibling = siblings[sibling.index + delta]) {
          let child = sibling
          let children
          while (children = child.children) {
            // get correct child based on position
            let d
            for (let i = children.length - 1; i >= 0; i--) {
              const next = children[i]
              const diff = Math.abs(currentPos - (next.pos || 0))
              if (d === void 0 || diff < d) {
                child = next
                d = diff
              }
            }
            if (d === void 0) child = children[0]
          }
          if (child.focusIn(child) !== false) {
            $2537101590_fm.currentFocus.focusOut($2537101590_fm.currentFocus)
            $2537101590_fm.currentFocus = child
            return
          }
        }
      }
      target = parent
    }
  }
}

const $2537101590_addEventListeners = () => {
  if (!$2537101590_fm.addedListeners) {
    const onKeyDown = event => {
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
          $2537101590_moveFocus(direction, delta)
        }
      }
    }
    global.addEventListener('keydown', onKeyDown)
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

const $2537101590_setOnPosition = (coordinates, set) => {
  var children = $2537101590_fm.children
  var parent = $2537101590_fm
  var onYAxis

  for (var i = 0, n = coordinates.length - 1; i <= n; i++) {
    const index = coordinates[i]
    if (i === n) {
      set.index = index
      set.parent = parent
      set.direction = onYAxis ? 'y' : 'x'
      // include more in absolute pos (like other rows in the matrix)
      if (set.pos === void 0) set.pos = index
      children[index] = set
    } else {
      if (!children[index]) {
        children[index] = {
          children: [],
          direction: onYAxis ? 'y' : 'x',
          index,
          parent
        }
      }
      parent = children[index]
      children = parent.children
      onYAxis = !onYAxis
    }
  }
}

const $2537101590_fm = {
  currentFocus: false,
  children: [],
  /*
    register element, this can happen on eg. render
    params:
    - coordinates (obj) eg [0,0,0]
    - set (obj) eg { state, x, y, focusIn, focusUpdate, focusOut }
  */
  register (coordinates, set) {
    $2537101590_addEventListeners()
    $2537101590_setOnPosition(coordinates, set)
    $2537101590_autoFocus(set)
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
  }
}

var $2537101590 = $2537101590_fm


module.exports = $2537101590