import { autoFocus, changeFocus, focusElement } from './focus'
import { createBranch, createLeaf } from './create'
import { addEventListeners } from './events'

const updateX = (parent, set) => {
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

const updateY = (parent, set) => {
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

const updatePositions = (parent, set) => {
  while (parent) {
    const changedX = updateX(parent, set)
    const changedY = updateY(parent, set)
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
    if (!parent.children[index]) createBranch(parent, index)
    parent = parent.children[index]
    index = position[++i]
  }
  createLeaf(parent, index, set)
  updatePositions(parent, set)
}

const reset = parent => {
  if ('children' in parent) {
    parent.xEnd = 0
    parent.yEnd = 0
    for (var i = parent.children.length - 1; i >= 0; i--) {
      reset(parent.children[i])
    }
  }
}

const update = parent => {
  var children = parent.children
  for (var i = 0, max = children.length - 1; i <= max; i++) {
    const target = children[i]
    if ('children' in target) {
      update(target)
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
        updatePositions(parent, target)
      }
    }
  }
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
  /*
    register target, this can happen on eg. render
    params:
    - position (obj) eg [0,0,0]
    - target (obj) eg { state, x, y, onFocus, focusUpdate, onBlur }
    returns target
  */
  register (target, position) {
    addEventListeners(aim)
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
      if (aim.updateTimer) {
        aim.updateTimer = clearTimeout(aim.updateTimer)
      }

      aim.updateTimer = setTimeout(() => {
        reset(aim)
        update(aim)
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
  offsetX (target, value) {
    target.xOffset = value
  },
  offsetY (target, value, size) {
    target.yOffset = value
  },
  focus (target) {
    if (target !== aim.currentFocus) return focusElement(aim, target)
  },
  render (style) {
    const view = document.createElement('div')
    if (aim.view) {
      aim.view.parentNode.removeChild(aim.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    render(view, aim, [])
    return (aim.view = view)
  }
}

const render = (root, target, position) => {
  const div = document.createElement('div')
  const style = div.style

  style.position = 'absolute'
  style.left = target.x / aim.xEnd * 100 + '%'
  style.top = target.y / aim.yEnd * 100 + '%'
  style.width = (target.xEnd - target.x) / aim.xEnd * 100 + '%'
  style.height = (target.yEnd - target.y) / aim.yEnd * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in target) {
    for (let i = 0, l = target.children.length; i < l; i++) {
      const child = target.children[i]
      root.appendChild(render(root, child, position.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(position)
    style.backgroundColor = target === aim.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

export default aim
