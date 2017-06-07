const createBranch = (parent, index) => {
  if (index in parent.children && 'children' in parent.children[index]) {
    return parent.children[index]
  } else {
    const child = { index, children: [], parent }
    if (parent.direction === 'y') {
      child.direction = 'x'
      child.x = parent.x
      child.y = parent.y
      if (index) {
        for (let i = index - 1; i >= 0; i--) {
          if (i in parent.children) {
            child.y = parent.children[i].yEnd + 1
            break
          }
        }
      }
      child.xEnd = parent.xEnd
      child.yEnd = child.y
    } else {
      child.direction = 'y'
      child.y = parent.y
      child.x = parent.x
      if (index) {
        for (let i = index - 1; i >= 0; i--) {
          if (i in parent.children) {
            child.x = parent.children[i].xEnd + 1
            break
          }
        }
      }
      child.yEnd = parent.yEnd
      child.xEnd = child.x
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
  parent.children[index] = set
}

export { createBranch, createLeaf }
