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

const setOnPosition = (coordinates, set) => {
  var parent = fm
  var index = coordinates[0]
  for (let i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) createBranch(parent, index)
    parent = parent.children[index]
    index = coordinates[++i]
  }
  createLeaf(parent, index, set)
  updatePositions(parent, set)
}

const fm = {
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
    addEventListeners(fm)
    setOnPosition(coordinates, element)
    autoFocus(fm, element)
    return element
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
  */
  unregister (coordinates) {
    var child = fm
    var index, children
    for (var i = 0, l = coordinates.length; i < l && child; i++) {
      index = coordinates[i]
      children = child.children
      child = children[index]
    }
    if (fm.currentFocus === child) {
      const sibling = children[index ? index - 1 : index + 1]
      if (sibling) {
        focusElement(fm, sibling)
      } else {
        changeFocus(fm, 'x', -1) ||
          changeFocus(fm, 'y', -1) ||
            changeFocus(fm, 'x', 1) ||
              changeFocus(fm, 'y', 1)
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
  offset (element, axis, offset) {
    element[axis].offset = offset
  },
  get (coordinates) {
    for (var i = 0, l = coordinates.length, child = fm; i < l && child; i++) {
      child = child.children[coordinates[i]]
    }
    return child
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
      let children = fm.children
      let target
      for (let i = 0, l = element.length; i < l; i++) {
        target = children[element[i]]
        if (!target) return
        children = target.children
      }
      element = target
    }
    return focusElement(fm, element)
  },
  render (style) {
    const view = document.createElement('div')
    if (fm.view) {
      fm.view.parentNode.removeChild(fm.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    render(view, fm, [])
    return (fm.view = view)
  }
}

const render = (root, element, coordinates) => {
  const div = document.createElement('div')
  const style = div.style

  style.position = 'absolute'
  style.left = element.x.start / fm.x.end * 100 + '%'
  style.top = element.y.start / fm.y.end * 100 + '%'
  style.width = (element.x.end - element.x.start) / fm.x.end * 100 + '%'
  style.height = (element.y.end - element.y.start) / fm.y.end * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in element) {
    for (let i = 0, l = element.children.length; i < l; i++) {
      const child = element.children[i]
      root.appendChild(render(root, child, coordinates.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(coordinates)
    style.backgroundColor = element === fm.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

export default fm
