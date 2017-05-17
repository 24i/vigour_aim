const createBranch = (parent, index) => {
  const container = { index }
  if (parent.direction === 'y') {
    const y = index ? parent.children[index - 1].y.end : parent.y.start
    container.direction = 'x'
    container.x = { start: parent.x.start, end: parent.x.end }
    container.y = { start: y, end: y }
  } else {
    const x = index ? parent.children[index - 1].x.end : parent.x.start
    container.direction = 'y'
    container.x = { start: x, end: x }
    container.y = { start: parent.y.start, end: parent.y.end }
  }
  container.children = []
  container.parent = parent
  parent.children[index] = container
}

const createLeaf = (parent, index, set) => {
  var x, y
  if (parent.direction === 'y') {
    x = set.x === void 0 ? parent.x.start : set.x
    y = set.y === void 0 ? index ? parent.children[index - 1].y.end : parent.y.start : set.y
  } else {
    x = set.x === void 0 ? index ? parent.children[index - 1].x.end : parent.x.start : set.x
    y = set.y === void 0 ? parent.y.start : set.y
  }
  set.index = index
  set.x = { start: x, mid: x + (set.w || 1) / 2, end: x + (set.w || 1) }
  set.y = { start: y, mid: y + (set.h || 1) / 2, end: y + (set.h || 1) }
  set.parent = parent
  parent.children[index] = set
}

export { createBranch, createLeaf }
