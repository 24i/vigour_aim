const createBranch = (parent, index) => {
  if (!(index in parent.children)) {
    const child = { index, children: [], parent }
    if (parent.direction === 'y') {
      child.direction = 'x'
      child.x = parent.x
      child.y = index ? createBranch(parent, index - 1).yEnd : parent.y
      child.xEnd = parent.xEnd
      child.yEnd = child.y
    } else {
      child.direction = 'y'
      child.y = parent.y
      child.x = index ? createBranch(parent, index - 1).xEnd : parent.x
      child.yEnd = parent.yEnd
      child.xEnd = child.x
    }
    return (parent.children[index] = child)
  } else {
    return parent.children[index]
  }
}

const createLeaf = (parent, index, set) => {
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

export { createBranch, createLeaf }
