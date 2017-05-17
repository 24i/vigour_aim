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
    register element, this can happen on eg. render
    params:
    - position (obj) eg [0,0,0]
    - element (obj) eg { state, x, y, onFocus, focusUpdate, onBlur }
    returns element
  */
  register (element, position) {
    addEventListeners(aim)
    setOnPosition(position, element)
    autoFocus(aim, element)
    return element
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - position (obj) eg [0,0,0]
  */
  unregister (element) {
    const index = element.index
    var children = element.parent.children
    var length

    if (aim.currentFocus === element) {
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
    while ((length = children.length) === 1 && (element = element.parent)) {
      children = element.children
    }
    for (var i = index + 1; i < length; i++) {
      children[children[i].index = i - 1] = children[i]
    }
    children.pop()
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - position (obj) eg [0,0,0]
    - set (obj) eg { x }
  */
  update (element, property, value) {
    if ('children' in element) {
      if (property === 'y' || property === 'x') {
        element[property].offset = value
      }
    } else {
      // @todo!
      // do all types of repositioning etc!
      element[property] = value
    }
  },
  get (position) {
    for (var i = 0, l = position.length, child = aim; i < l && child; i++) {
      child = child.children[position[i]]
    }
    return child
  },
  /*
    focus element
    params:
    - position (obj) eg [0,0,0]
    OR
    - element (obj)
    returns element if new focus
  */
  focus (element) {
    if (Array.isArray(element)) {
      let children = aim.children
      let target
      for (let i = 0, l = element.length; i < l; i++) {
        target = children[element[i]]
        if (!target) return
        children = target.children
      }
      element = target
    }
    return focusElement(aim, element)
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

const render = (root, element, position) => {
  const div = document.createElement('div')
  const style = div.style

  style.position = 'absolute'
  style.left = element.x.start / aim.x.end * 100 + '%'
  style.top = element.y.start / aim.y.end * 100 + '%'
  style.width = (element.x.end - element.x.start) / aim.x.end * 100 + '%'
  style.height = (element.y.end - element.y.start) / aim.y.end * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in element) {
    for (let i = 0, l = element.children.length; i < l; i++) {
      const child = element.children[i]
      root.appendChild(render(root, child, position.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(position)
    style.backgroundColor = element === aim.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

export default aim
