const createBranch = (parent, index) => {
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
