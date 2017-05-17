import { autoFocus, changeFocus, focusElement } from './focus'
import { createBranch, createLeaf } from './create'
import { addEventListeners } from './events'

const updatePositions = (parent, set) => {
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

const aim = {
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

      if (aim.updateTimer) {
        clearTimeout(aim.updateTimer)
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

      aim.updateTimer = setTimeout(() => {
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
  /*
    focus target
    - target (obj)
    returns target if new focus
  */
  focus (target) {
    return focusElement(aim, target)
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
  style.left = target.x.start / aim.x.end * 100 + '%'
  style.top = target.y.start / aim.y.end * 100 + '%'
  style.width = (target.x.end - target.x.start) / aim.x.end * 100 + '%'
  style.height = (target.y.end - target.y.start) / aim.y.end * 100 + '%'
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
