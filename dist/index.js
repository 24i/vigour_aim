const $2537101590_keys = {
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

const $2537101590_findClosestDescendant = child => {
  const x = $2537101590_fm.currentFocus.x.mid
  const y = $2537101590_fm.currentFocus.y.mid
  var children
  while ((children = child.children)) {
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
      while ((sibling = siblings[sibling.index + delta])) {
        const child = $2537101590_findClosestDescendant(sibling)
        // if new focus return
        if ($2537101590_focusElement(child)) return child
      }
    }
    target = parent
    parent = parent.parent
  }
}

const $2537101590_onKeyDown = event => {
  if (event.keyCode in $2537101590_keys) {
    const focusUpdate = $2537101590_fm.currentFocus.focusUpdate
    const handledByElement = focusUpdate
      ? focusUpdate($2537101590_fm.currentFocus)
      : false
    if (handledByElement === false) {
      const { delta, direction } = $2537101590_keys[event.keyCode]
      if (direction) $2537101590_changeFocus(direction, delta)
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

const $2537101590_createBranch = (parent, index) => {
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

const $2537101590_createLeaf = (parent, index, set) => {
  var x, y
  if (parent.direction === 'y') {
    x = set.x === void 0 ? parent.x.start : set.x
    y = set.y === void 0 ? index ? parent.children[index - 1].y.end : parent.y.start : set.y
  } else {
    x = set.x === void 0 ? index ? parent.children[index - 1].x.end : parent.x.start : set.x
    y = set.y === void 0 ? parent.y.start : set.y
  }
  set.index = index
  set.x = { start: x, mid: x + (set.width || 1) / 2, end: x + (set.width || 1) }
  set.y = { start: y, mid: y + (set.height || 1) / 2, end: y + (set.height || 1) }
  set.parent = parent
  parent.children[index] = set
}

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

const $2537101590_setOnPosition = (coordinates, set) => {
  var parent = $2537101590_fm
  var index = coordinates[0]
  for (let i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) $2537101590_createBranch(parent, index)
    parent = parent.children[index]
    index = coordinates[++i]
  }
  $2537101590_createLeaf(parent, index, set)
  $2537101590_updatePositions(parent, set)
}

const $2537101590_fm = {
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
    var child = $2537101590_fm
    var index, children
    for (var i = 0, l = coordinates.length; i < l; i++) {
      index = coordinates[i]
      children = child.children
      child = children[index]
      if (!child) return
    }
    if ($2537101590_fm.currentFocus === child) {
      const sibling = children[index ? index - 1 : index + 1]
      if (sibling) {
        $2537101590_focusElement(sibling)
      } else {
        $2537101590_changeFocus('x', -1) ||
          $2537101590_changeFocus('y', -1) ||
            $2537101590_changeFocus('x', 1) ||
              $2537101590_changeFocus('y', 1)
      }
    }
    let length
    while ((length = children.length) === 1 && (child = child.parent)) {
      children = child.children
    }
    for (let j = index + 1; j < length; j++) {
      const child = children[j]
      children[child.index = j - 1] = child
    }
    children.pop()
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
  render (style) {
    const view = document.createElement('div')
    if ($2537101590_fm.view) {
      $2537101590_fm.view.parentNode.removeChild($2537101590_fm.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    $2537101590_render(view, $2537101590_fm, [])
    return ($2537101590_fm.view = view)
  }
}

const $2537101590_render = (root, element, coordinates) => {
  const div = document.createElement('div')
  const style = div.style

  style.position = 'absolute'
  style.left = element.x.start / $2537101590_fm.x.end * 100 + '%'
  style.top = element.y.start / $2537101590_fm.y.end * 100 + '%'
  style.width = (element.x.end - element.x.start) / $2537101590_fm.x.end * 100 + '%'
  style.height = (element.y.end - element.y.start) / $2537101590_fm.y.end * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in element) {
    for (let i = 0, l = element.children.length; i < l; i++) {
      const child = element.children[i]
      root.appendChild($2537101590_render(root, child, coordinates.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(coordinates)
    style.backgroundColor = element === $2537101590_fm.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

var $2537101590 = $2537101590_fm


module.exports = $2537101590