import { autoFocus, changeFocus, focusElement } from './focus'
import { createBranch, createLeaf } from './create'

const updateX = (child, xDiff) => {
  child.x += xDiff
  child.xEnd += xDiff
  if ('children' in child) {
    for (var i = child.children.length - 1; i >= 0; i--) {
      if (i in child.children) {
        updateX(child.children[i], xDiff)
      }
    }
  }
}

const updateY = (child, yDiff) => {
  child.y += yDiff
  child.yEnd += yDiff
  if ('children' in child) {
    for (var i = child.children.length - 1; i >= 0; i--) {
      if (i in child.children) {
        updateY(child.children[i], yDiff)
      }
    }
  }
}

const updateXEnd = (parent, xEnd) => {
  if (parent.xEnd < xEnd) {
    if ('parent' in parent) {
      const siblings = parent.parent.children
      let l = siblings.length
      if (parent.direction === 'x') {
        for (let i = l - 1; i >= 0; i--) {
          if (i in siblings) siblings[i].xEnd = xEnd
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
    if ('parent' in parent) {
      const siblings = parent.parent.children
      let l = siblings.length
      if (parent.direction === 'y') {
        for (let i = l - 1; i >= 0; i--) {
          if (i in siblings) {
            siblings[i].yEnd = yEnd
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
  if (index in parent.children && parent.children[index] === aim.currentFocus) {
    aim.currentFocus = createLeaf(parent, index, set)
  } else {
    createLeaf(parent, index, set)
  }
  if (parent.children.length > index + 1) {
    updatePositions(parent)
  } else {
    updateParentPositions(parent, set)
  }
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
  var prevEnd
  for (var i = 0, max = children.length - 1; i <= max; i++) {
    if (i in children) {
      const target = children[i]
      if ('children' in target) {
        updatePositions(target)
      } else {
        if (parent.direction === 'y') {
          target.y = prevEnd ? prevEnd + 1 : parent.y
          prevEnd = target.yEnd = target.y + (target.h || 0)
        } else {
          target.x = prevEnd ? prevEnd + 1 : parent.x
          prevEnd = target.xEnd = target.x + (target.w || 0)
        }
        if (max === i) {
          updateParentPositions(parent, target)
        }
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
  },
  back: {
    name: 'onBack'
  },
  space: {
    name: 'onSpace'
  },
  escape: {
    name: 'onEscape'
  },
  mediaRewind: {
    name: 'onMediaRewind'
  },
  mediaFastForward: {
    name: 'onMediaFastForward'
  },
  mediaPlay: {
    name: 'onMediaPlay'
  },
  mediaPause: {
    name: 'onMediaPause'
  },
  mediaPlayPause: {
    name: 'onMediaPlayPause'
  },
  mediaStop: {
    name: 'onMediaStop'
  }
}

const keys = {
  8: events.back,
  13: events.enter,
  27: events.escape,
  32: events.space,
  37: events.left,
  38: events.up,
  39: events.right,
  40: events.down,
  205: events.left,
  206: events.right,
  203: events.up,
  204: events.down,
  195: events.enter,
  196: events.back,
  214: events.left,
  213: events.right,
  211: events.up,
  212: events.down,
  461: events.back, // lg webos
  10009: events.back, // tizen

  412: events.mediaRewind, // tizen / lg
  227: events.mediaRewind, // android / firefox os

  417: events.mediaFastForward, // tizen / lg
  228: events.mediaFastForward, // android / firefox os

  250: events.mediaPlay, // firefox os
  415: events.mediaPlay, // tizen / lg
  19: events.mediaPause, // tizen / lg / firefox os

  10252: events.mediaPlayPause, // tizen
  179: events.mediaPlayPause, // android (both pause and play button use this code)

  178: events.mediaStop, // android / firefox os
  413: events.mediaStop // tizen / lg
}

const aim = {
  /**
  * Current focused leaf.
  * @property {Object | Boolean}
  * @readonly
  */
  currentFocus: false,
  /**
  * X start position of virtual view.
  * @property {Number}
  * @readonly
  */
  x: 0,
  /**
  * X end position of virtual view.
  * @property {Number}
  * @readonly
  */
  xEnd: 0,
  /**
  * Y start position of virtual view.
  * @property {Number}
  * @readonly
  */
  y: 0,
  /**
  * Y end position of virtual view.
  * @property {Number}
  * @readonly
  */
  yEnd: 0,
  /**
  * Children of top level view.
  * @property {Array.<Object>}
  * @readonly
  */
  children: [],
  /**
  * Top level direction of layout, y being column, x being row.
  * @property {String}
  */
  direction: 'y',
  /**
  * Focus one item upward.
  */
  up: () => changeFocus(aim, events.up.direction, events.up.delta),
  /**
  * Focus one item downward.
  */
  down: () => changeFocus(aim, events.down.direction, events.down.delta),
  /**
  * Focus one to the left.
  */
  left: () => changeFocus(aim, events.left.direction, events.left.delta),
  /**
  * Focus one to the right.
  */
  right: () => changeFocus(aim, events.right.direction, events.right.delta),
  /**
  * Will delegate given event to currently focused item.
  * @param {Event} e
  * @example window.addEventListener('keydown', e => aim.handleKeyEvent(e))
  */
  handleKeyEvent (e) {
    if (e.keyCode in keys && aim.currentFocus) {
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
  /**
  * Registers target on given position.
  * @param {Object} target Target containing handlers.
  * @param {Array.<Number>} position Coordinates for position.
  * @returns {Object} target
  */
  register (target, position) {
    setOnPosition(position, target)
    autoFocus(aim, target)
    return target
  },
  /**
  * Unregisters target.
  * @param {Object} target Target to unregister.
  */
  unregister (target) {
    var index = target.index
    var parent = target.parent
    var children = parent.children
    var length
    if (aim.currentFocus === target) {
      aim.currentFocus = false
    }
    while ((length = children.length) === 1 && ('parent' in target)) {
      index = target.index
      parent = target.parent
      children = parent.children
      target = parent
    }

    if (index === length - 1) {
      children.pop()
    } else {
      delete children[index]
    }
  },
  /**
  * Gets target on given position.
  * @param {Array.<Number>} position Coordinates for position.
  * @returns {Object|undefined} target
  */
  get (position) {
    for (var i = 0, l = position.length, child = aim; i < l && child; i++) {
      child = child.children[position[i]]
    }
    return child
  },
  /**
  * Focuses passed target.
  * @param {Object} target Target to focus.
  * @returns {Object|undefined} target
  */
  focus: target => {
    if (!('children' in target)) {
      return focusElement(aim, target)
    }
  },
  offsetX (target, x, w) {
    target.xOffset = x
    if (w !== void 0) target.wOffset = w
  },
  offsetY (target, y, h) {
    target.yOffset = y
    if (h !== void 0) target.hOffset = h
  },
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
  }
}

export default aim
