const $1874855716_autoFocus = (aim, set) => {
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

const $1874855716_focusElement = (aim, target) => {
  if (target.onFocus(target) !== false) {
    aim.currentFocus.onBlur(aim.currentFocus)
    aim.currentFocus = target
    return target
  }
}

const $1874855716_findClosestDescendant = (aim, child) => {
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

const $1874855716_changeFocus = (aim, direction, delta) => {
  var target = aim.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      let sibling = target
      // if direction is correct walk (delta) sibling
      while ((sibling = parent.children[sibling.index + delta])) {
        const child = $1874855716_findClosestDescendant(aim, sibling)
        // if new focus return
        if ($1874855716_focusElement(aim, child)) return child
      }
    }
    target = parent
    parent = parent.parent
  }
}



var $1874855716_$ALL$ = {
  autoFocus: $1874855716_autoFocus,
  changeFocus: $1874855716_changeFocus,
  focusElement: $1874855716_focusElement
}
;const $883917132_createBranch = (parent, index) => {
  const container = { index }
  if (parent.direction === 'y') {
    const y = index ? parent.children[index - 1].y.end : parent.y.start
    container.direction = 'x'
    container.x = { start: parent.x.start, end: parent.x.end }
    container.y = { start: y, end: y }
  } else {
    const x = index ? parent.children[index - 1].x.end : parent.x.start
    container.direction = 'y'
    container.x = { start: x, end: x }
    container.y = { start: parent.y.start, end: parent.y.end }
  }
  container.children = []
  container.parent = parent
  parent.children[index] = container
}

const $883917132_createLeaf = (parent, index, set) => {
  var x, y
  if (parent.direction === 'y') {
    x = set.x === void 0 ? parent.x.start : set.x
    y = set.y === void 0 ? index ? parent.children[index - 1].y.end : parent.y.start : set.y
  } else {
    x = set.x === void 0 ? index ? parent.children[index - 1].x.end : parent.x.start : set.x
    y = set.y === void 0 ? parent.y.start : set.y
  }
  set.index = index
  set.x = { start: x, mid: x + (set.w || 1) / 2, end: x + (set.w || 1) }
  set.y = { start: y, mid: y + (set.h || 1) / 2, end: y + (set.h || 1) }
  set.parent = parent
  parent.children[index] = set
}



var $883917132_$ALL$ = {
  createBranch: $883917132_createBranch,
  createLeaf: $883917132_createLeaf
}
;

const $686231703_keys = {
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

const $686231703_addEventListeners = aim => {
  if (!aim.addedListeners) {
    global.addEventListener('keydown', event => {
      if (event.keyCode in $686231703_keys) {
        const focusUpdate = aim.currentFocus.focusUpdate
        const handledByElement = focusUpdate
          ? focusUpdate(aim.currentFocus)
          : false
        if (handledByElement === false) {
          const { delta, direction } = $686231703_keys[event.keyCode]
          if (direction) $1874855716_changeFocus(aim, direction, delta)
        }
      }
    })
    aim.addedListeners = true
  }
}



var $686231703_$ALL$ = {
  addEventListeners: $686231703_addEventListeners
}
;



const $2537101590_updatePositions = (parent, set) => {
  while (parent) {
    const changedX = $2537101590_updateParentPosition(parent, set, 'x')
    const changedY = $2537101590_updateParentPosition(parent, set, 'y')
    if (changedY || changedX) {
      set = parent
      parent = parent.parent
    } else {
      break
    }
  }
}

const $2537101590_updateParentPosition = (parent, set, axis) => {
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

const $2537101590_setOnPosition = (position, set) => {
  var parent = $2537101590_aim
  var index = position[0]
  for (let i = 0, n = position.length - 1; i < n;) {
    if (!parent.children[index]) $883917132_createBranch(parent, index)
    parent = parent.children[index]
    index = position[++i]
  }
  $883917132_createLeaf(parent, index, set)
  $2537101590_updatePositions(parent, set)
}

const $2537101590_aim = {
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
    register target, this can happen on eg. render
    params:
    - position (obj) eg [0,0,0]
    - target (obj) eg { state, x, y, onFocus, focusUpdate, onBlur }
    returns target
  */
  register (target, position) {
    $686231703_addEventListeners($2537101590_aim)
    $2537101590_setOnPosition(position, target)
    $1874855716_autoFocus($2537101590_aim, target)
    return target
  },
  /*
    unregister target, this can happen on eg. remove
    params:
    - position (obj) eg [0,0,0]
  */
  unregister (target) {
    const index = target.index
    var children = target.parent.children
    var length

    if ($2537101590_aim.currentFocus === target) {
      const sibling = children[index ? index - 1 : index + 1]
      if (sibling) {
        $1874855716_focusElement($2537101590_aim, sibling)
      } else {
        $1874855716_changeFocus($2537101590_aim, 'x', -1) ||
          $1874855716_changeFocus($2537101590_aim, 'y', -1) ||
            $1874855716_changeFocus($2537101590_aim, 'x', 1) ||
              $1874855716_changeFocus($2537101590_aim, 'y', 1)
      }
    }
    while ((length = children.length) === 1 && (target = target.parent)) {
      children = target.children
    }
    for (var i = index + 1; i < length; i++) {
      children[children[i].index = i - 1] = children[i]
    }
    children.pop()
  },
  /*
    unregister target, this can happen on eg. remove
    params:
    - position (obj) eg [0,0,0]
    - set (obj) eg { x }
  */
  update (target, property, value, throttleTime) {
    if ('children' in target) {
      if (property === 'y' || property === 'x') {
        target[property].offset = value
      }
    } else {
      console.log('mission man:', property, value)
      // @todo!
      // do all types of repositioning etc!
      if (property === 'h') {
        target.y.size = value
      } else if (property === 'w') {
        target.x.size = value
      } else if (property === 'y') {
        target.y.start = value
      } else if (property === 'x') {
        target.x.start = value
      }
      // do repositioning!

      if ($2537101590_aim.updateTimer) {
        clearTimeout($2537101590_aim.updateTimer)
      }

      const update = parent => {
        var children = parent.children
        for (var i = 0, l = children.length; i < l; i++) {
          const target = children[i]
          if ('children' in target) {
            update(target)
          } else {
            if (parent.direction === 'y') {
              const y = i ? children[i - 1].y.end : parent.y.start
              target.y = {
                start: y,
                mid: y + (target.y.size || 1) / 2,
                end: y + (target.y.size || 1)
              }
            } else {
              const x = i ? children[i - 1].x.end : parent.x.start
              target.x = {
                start: x,
                mid: x + (target.x.size || 1) / 2,
                end: x + (target.x.size || 1)
              }
            }
          }
        }
      }

      $2537101590_aim.updateTimer = setTimeout(() => {
        update($2537101590_aim)
        $2537101590_aim.updateTimer = null
      }, throttleTime)
    }
  },
  get (position) {
    for (var i = 0, l = position.length, child = $2537101590_aim; i < l && child; i++) {
      child = child.children[position[i]]
    }
    return child
  },
  /*
    focus target
    - target (obj)
    returns target if new focus
  */
  focus (target) {
    return $1874855716_focusElement($2537101590_aim, target)
  },
  render (style) {
    const view = document.createElement('div')
    if ($2537101590_aim.view) {
      $2537101590_aim.view.parentNode.removeChild($2537101590_aim.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    $2537101590_render(view, $2537101590_aim, [])
    return ($2537101590_aim.view = view)
  }
}

const $2537101590_render = (root, target, position) => {
  const div = document.createElement('div')
  const style = div.style

  style.position = 'absolute'
  style.left = target.x.start / $2537101590_aim.x.end * 100 + '%'
  style.top = target.y.start / $2537101590_aim.y.end * 100 + '%'
  style.width = (target.x.end - target.x.start) / $2537101590_aim.x.end * 100 + '%'
  style.height = (target.y.end - target.y.start) / $2537101590_aim.y.end * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in target) {
    for (let i = 0, l = target.children.length; i < l; i++) {
      const child = target.children[i]
      root.appendChild($2537101590_render(root, child, position.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(position)
    style.backgroundColor = target === $2537101590_aim.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

var $2537101590 = $2537101590_aim


module.exports = $2537101590