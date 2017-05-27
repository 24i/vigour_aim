import { autoFocus, changeFocus, focusElement } from './focus'
import { createBranch, createLeaf } from './create'

const updateX = (child, xDiff) => {
  child.x += xDiff
  child.xEnd += xDiff
  child.xMid = child.x - (child.xEnd - child.x) / 2
  if ('children' in child) {
    for (var i = child.children.length - 1; i >= 0; i--) {
      if (i in child.children) updateX(child.children[i], xDiff)
    }
  }
}

const updateY = (child, xDiff) => {
  child.x += xDiff
  child.xEnd += xDiff
  child.xMid = child.x - (child.xEnd - child.x) / 2
  if ('children' in child) {
    for (var i = child.children.length - 1; i >= 0; i--) {
      if (i in child.children) updateX(child.children[i], xDiff)
    }
  }
}

const updateXEnd = (parent, xEnd) => {
  if (parent.xEnd < xEnd) {
    parent.xMid = parent.x + (xEnd - parent.x) / 2
    if ('parent' in parent) {
      const siblings = parent.parent.children
      let l = siblings.length
      if (parent.direction === 'x') {
        for (let i = l - 1; i >= 0; i--) {
          if (i in siblings) {
            const sibling = siblings[i]
            sibling.xEnd = xEnd
            sibling.xMid = parent.xMid
          }
        }
      } else {
        for (let i = parent.index + 1; i < l; i++) {
          if (i in siblings) {
            updateX(siblings[i], xEnd - parent.xEnd)
            break
          }
        }
      }
    }
    parent.xEnd = xEnd
    return parent
  }
}

const updateYEnd = (parent, yEnd) => {
  if (parent.yEnd < yEnd) {
    parent.yMid = parent.y + (yEnd - parent.y) / 2
    if ('parent' in parent) {
      const siblings = parent.parent.children
      let l = siblings.length
      if (parent.direction === 'y') {
        for (let i = l - 1; i >= 0; i--) {
          if (i in siblings) {
            const sibling = siblings[i]
            sibling.yEnd = yEnd
            sibling.yMid = parent.yMid
          }
        }
      } else {
        for (let i = parent.index + 1; i < l; i++) {
          if (i in siblings) {
            updateY(siblings[i], yEnd - parent.yEnd)
            break
          }
        }
      }
    }
    parent.yEnd = yEnd
    return parent
  }
}

const updateParentPositions = (parent, set) => {
  while (parent) {
    const changedX = updateXEnd(parent, set.xEnd)
    const changedY = updateYEnd(parent, set.yEnd)
    if (changedY || changedX) {
      set = parent
      parent = parent.parent
    } else {
      break
    }
  }
}

const setOnPosition = (position, set) => {
  var parent = aim
  var index = position[0]
  for (let i = 0, n = position.length - 1; i < n;) {
    parent = createBranch(parent, index)
    index = position[++i]
  }
  createLeaf(parent, index, set)
  updateParentPositions(parent, set)
}

const resetParentPositions = parent => {
  if ('children' in parent) {
    parent.xEnd = 0
    parent.yEnd = 0
    for (var i = parent.children.length - 1; i >= 0; i--) {
      resetParentPositions(parent.children[i])
    }
  }
}

const updatePositions = parent => {
  var children = parent.children
  for (var i = 0, max = children.length - 1; i <= max; i++) {
    const target = children[i]
    if ('children' in target) {
      updatePositions(target)
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
        updateParentPositions(parent, target)
      }
    }
  }
}

const events = {
  left: {
    name: 'onArrowLeft',
    direction: 'x',
    delta: -1
  },
  right: {
    name: 'onArrowRight',
    direction: 'x',
    delta: 1
  },
  up: {
    name: 'onArrowUp',
    direction: 'y',
    delta: -1
  },
  down: {
    name: 'onArrowDown',
    direction: 'y',
    delta: 1
  },
  enter: {
    name: 'onEnter'
  }
}

const keys = {
  13: events.enter,
  37: events.left,
  38: events.up,
  39: events.right,
  40: events.down
}

const aim = {
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

  up: () => changeFocus(aim, events.up.direction, events.up.delta),
  down: () => changeFocus(aim, events.down.direction, events.down.delta),
  left: () => changeFocus(aim, events.left.direction, events.left.delta),
  right: () => changeFocus(aim, events.right.direction, events.right.delta),

  handleKeyEvent (e) {
    if (e.keyCode in keys) {
      const event = keys[e.keyCode]
      if (event.name in aim.currentFocus) {
        var useDefaultBehaviour = aim.currentFocus[event.name](aim.currentFocus)
      }
      if (useDefaultBehaviour === false) {
        return aim.currentFocus
      } else {
        if ('direction' in event) {
          if (changeFocus(aim, event.direction, event.delta)) {
            e.preventDefault()
            return aim.currentFocus
          }
        }
      }
    }
  },

  /*
    register target, this can happen on eg. render
    params:
    - position (obj) eg [0,0,0]
    - target (obj) eg { state, x, y, onFocus, focusUpdate, onBlur }
    returns target
  */
  register (target, position) {
    setOnPosition(position, target)
    autoFocus(aim, target)
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

    if (aim.currentFocus === target) {
      const sibling = children[index ? index - 1 : index + 1]
      if (sibling) {
        focusElement(aim, sibling)
      } else {
        changeFocus(aim, 'x', -1) ||
          changeFocus(aim, 'y', -1) ||
            changeFocus(aim, 'x', 1) ||
              changeFocus(aim, 'y', 1)
      }
    }
    while ((length = children.length) === 1 && (target = target.parent)) {
      children = target.children
    }
    for (var i = index + 1; i < length; i++) {
      if (i in children) {
        children[children[i].index = i - 1] = children[i]
      }
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
      if (aim.updateTimer) {
        aim.updateTimer = clearTimeout(aim.updateTimer)
      }

      aim.updateTimer = setTimeout(() => {
        resetParentPositions(aim)
        updatePositions(aim)
        aim.updateTimer = null
      }, throttleTime)
    }
  },
  get (position) {
    for (var i = 0, l = position.length, child = aim; i < l && child; i++) {
      child = child.children[position[i]]
    }
    return child
  },
  offsetX (target, x, w) {
    target.xOffset = x
    if (w !== void 0) target.wOffset = w
  },
  offsetY (target, y, h) {
    target.yOffset = y
    if (h !== void 0) target.hOffset = h
  },
  focus: target => focusElement(aim, target)
}

export default aim
