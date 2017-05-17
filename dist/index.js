const $1874855716_autoFocus = (aim, set) => {
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
  const b = { index, children: [], parent }
  if (parent.direction === 'y') {
    b.direction = 'x'
    b.x = parent.x
    b.y = index ? parent.children[index - 1].yEnd : parent.y
    b.xEnd = parent.xEnd
    b.yEnd = b.y
  } else {
    b.direction = 'y'
    b.y = parent.y
    b.x = index ? parent.children[index - 1].xEnd : parent.x
    b.yEnd = parent.yEnd
    b.xEnd = b.x
  }
  parent.children[index] = b
}

const $883917132_createLeaf = (parent, index, set) => {
  if (parent.direction === 'y') {
    if (!('x' in set)) set.x = parent.x
    if (!('y' in set)) set.y = index ? parent.children[index - 1].yEnd : parent.y
  } else {
    if (!('x' in set)) set.x = index ? parent.children[index - 1].xEnd : parent.x
    if (!('y' in set)) set.y = parent.y
  }
  set.index = index
  set.xMid = set.x + (set.w || 1) / 2
  set.xEnd = set.x + (set.w || 1)
  set.yMid = set.y + (set.h || 1) / 2
  set.yEnd = set.y + (set.h || 1)
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



const $2537101590_updateX = (parent, set) => {
  if (parent.xEnd < set.xEnd) {
    parent.xEnd = set.xEnd
    parent.xMid = parent.x + (parent.xEnd - parent.x) / 2
    if ('parent' in parent && parent.direction === 'x') {
      const siblings = parent.parent.children
      for (var i = siblings.length - 1; i >= 0; i--) {
        const sibling = siblings[i]
        sibling.xEnd = parent.xEnd
        sibling.xMid = parent.xMid
      }
    }
    return parent
  }
}

const $2537101590_updateY = (parent, set) => {
  if (parent.yEnd < set.yEnd) {
    parent.yEnd = set.yEnd
    parent.yMid = parent.y + (parent.yEnd - parent.y) / 2
    if ('parent' in parent && parent.direction === 'y') {
      const siblings = parent.parent.children
      for (var i = siblings.length - 1; i >= 0; i--) {
        const sibling = siblings[i]
        sibling.yEnd = parent.yEnd
        sibling.yMid = parent.yMid
      }
    }
    return parent
  }
}

const $2537101590_updatePositions = (parent, set) => {
  while (parent) {
    const changedX = $2537101590_updateX(parent, set)
    const changedY = $2537101590_updateY(parent, set)
    if (changedY || changedX) {
      set = parent
      parent = parent.parent
    } else {
      break
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

const $2537101590_reset = parent => {
  if ('children' in parent) {
    parent.xEnd = 0
    parent.yEnd = 0
    for (var i = parent.children.length - 1; i >= 0; i--) {
      $2537101590_reset(parent.children[i])
    }
  }
}

const $2537101590_update = parent => {
  var children = parent.children
  for (var i = 0, max = children.length - 1; i <= max; i++) {
    const target = children[i]
    if ('children' in target) {
      $2537101590_update(target)
    } else {
      if (parent.direction === 'y') {
        target.y = i ? children[i - 1].yEnd : parent.y
        target.yMid = target.y + (target.h || 1) / 2
        target.yEnd = target.y + (target.h || 1)
      } else {
        target.x = i ? children[i - 1].xEnd : parent.x
        target.xMid = target.x + (target.w || 1) / 2
        target.xEnd = target.x + (target.w || 1)
      }
      if (max === i) {
        $2537101590_updatePositions(parent, target)
      }
    }
  }
}

const $2537101590_aim = {
  currentFocus: false,
  x: 0,
  xMid: 0,
  xEnd: 0,
  y: 0,
  yMid: 0,
  yEnd: 0,
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
    target[property] = value
    if (!('children' in target)) {
      if ($2537101590_aim.updateTimer) {
        $2537101590_aim.updateTimer = clearTimeout($2537101590_aim.updateTimer)
      }

      $2537101590_aim.updateTimer = setTimeout(() => {
        $2537101590_reset($2537101590_aim)
        $2537101590_update($2537101590_aim)
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
  offsetX (target, value) {
    target.xOffset = value
  },
  offsetY (target, value, size) {
    target.yOffset = value
  },
  focus (target) {
    if (target !== $2537101590_aim.currentFocus) return $1874855716_focusElement($2537101590_aim, target)
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
  style.left = target.x / $2537101590_aim.xEnd * 100 + '%'
  style.top = target.y / $2537101590_aim.yEnd * 100 + '%'
  style.width = (target.xEnd - target.x) / $2537101590_aim.xEnd * 100 + '%'
  style.height = (target.yEnd - target.y) / $2537101590_aim.yEnd * 100 + '%'
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