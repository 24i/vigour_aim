const createBranch = (parent, index) => {
  let child = parent.children[index]
  if (child && 'children' in child) {
    return child
  } else {
    child = { index, children: [], parent }
    if (parent.direction === 'y') {
      child.direction = 'x'
      child.x = parent.x
      child.y = parent.y
      child.xEnd = parent.xEnd
      child.yEnd = child.y
      if (index) {
        for (let i = index - 1; i >= 0; i--) {
          if (i in parent.children) {
            child.y = parent.children[i].yEnd + 1
            break
          }
        }
      }
      for (let i = 0, l = parent.children.length; i < l; i++) {
        if (i in parent.children) {
          child.yEnd = parent.children[i].y - 1
          break
        }
      }
    } else {
      child.direction = 'y'
      child.y = parent.y
      child.x = parent.x
      child.yEnd = parent.yEnd
      child.xEnd = child.x
      if (index) {
        for (let i = index - 1; i >= 0; i--) {
          if (i in parent.children) {
            child.x = parent.children[i].xEnd + 1
            break
          }
        }
      }
      for (let i = 0, l = parent.children.length; i < l; i++) {
        if (i in parent.children) {
          child.xEnd = parent.children[i].x - 1
          break
        }
      }
    }
    return (parent.children[index] = child)
  }
}

const createLeaf = (parent, index, set) => {
  if (parent.direction === 'y') {
    if (!('x' in set)) set.x = parent.x
    if (!('y' in set)) {
      set.y = parent.y
      if (index) {
        for (let i = index - 1; i >= 0; i--) {
          if (i in parent.children) {
            set.y = parent.children[i].yEnd + 1
            break
          }
        }
      }
    }
  } else {
    if (!('x' in set)) {
      set.x = parent.x
      if (index) {
        for (let i = index - 1; i >= 0; i--) {
          if (i in parent.children) {
            set.x = parent.children[i].xEnd + 1
            break
          }
        }
      }
    }
    if (!('y' in set)) {
      set.y = parent.y
    }
  }
  set.index = index
  set.xEnd = set.x + (set.w || 0)
  set.yEnd = set.y + (set.h || 0)
  set.parent = parent
  return (parent.children[index] = set)
}

export { createBranch, createLeaf }
