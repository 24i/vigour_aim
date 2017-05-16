(function (global, process) { 
var $3265389822_exports = {}
var $3265389822_$2537101590_keys = {
  37: {
    value: 'left',
    direction: 'x',
    delta: -1,
    opposite: 'right'
  },
  38: {
    value: 'up',
    direction: 'y',
    delta: -1,
    opposite: 'down'
  },
  39: {
    value: 'right',
    direction: 'x',
    delta: 1,
    opposite: 'left'
  },
  40: {
    value: 'down',
    direction: 'y',
    delta: 1,
    opposite: 'up'
  }
}

var $3265389822_$2537101590_findClosestDescendant = function (child) {
  var x = $3265389822_$2537101590_fm.currentFocus.x.mid
  var y = $3265389822_$2537101590_fm.currentFocus.y.mid
  var children
  while ((children = child.children)) {
    for (var i = 0, l = children.length, diff = (void 0); i < l; i++) {
      var next = children[i]
      var a = x - next.x.mid
      var b = y - next.y.mid
      var c = Math.sqrt(a * a + b * b)
      if (diff === void 0 || c < diff) {
        child = next
        diff = c
      }
    }
  }
  return child
}

var $3265389822_$2537101590_focusElement = function (element) {
  if (element.focusIn(element) !== false) {
    $3265389822_$2537101590_fm.currentFocus.focusOut($3265389822_$2537101590_fm.currentFocus)
    $3265389822_$2537101590_fm.currentFocus = element
    return element
  }
}

var $3265389822_$2537101590_changeFocus = function (direction, delta) {
  var target = $3265389822_$2537101590_fm.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      var siblings = parent.children
      var sibling = target
      // if direction is correct walk (delta) sibling
      while ((sibling = siblings[sibling.index + delta])) {
        var child = $3265389822_$2537101590_findClosestDescendant(sibling)
        // if new focus return
        if ($3265389822_$2537101590_focusElement(child)) { return child }
      }
    }
    target = parent
    parent = parent.parent
  }
}

var $3265389822_$2537101590_onKeyDown = function (event) {
  if (event.keyCode in $3265389822_$2537101590_keys) {
    var focusUpdate = $3265389822_$2537101590_fm.currentFocus.focusUpdate
    var handledByElement = focusUpdate
      ? focusUpdate($3265389822_$2537101590_fm.currentFocus)
      : false
    if (handledByElement === false) {
      var ref = $3265389822_$2537101590_keys[event.keyCode];
      var delta = ref.delta;
      var direction = ref.direction;
      if (direction) { $3265389822_$2537101590_changeFocus(direction, delta) }
    }
  }
}

var $3265389822_$2537101590_addEventListeners = function () {
  if (!$3265389822_$2537101590_fm.addedListeners) {
    global.addEventListener('keydown', $3265389822_$2537101590_onKeyDown)
    $3265389822_$2537101590_fm.addedListeners = true
  }
}

var $3265389822_$2537101590_autoFocus = function (set) {
  if (!$3265389822_$2537101590_fm.currentFocus && !$3265389822_$2537101590_fm.autoFocusTimer) {
    $3265389822_$2537101590_fm.autoFocusTimer = setTimeout(function () {
      if (!$3265389822_$2537101590_fm.currentFocus) {
        set.focusIn(set)
        $3265389822_$2537101590_fm.currentFocus = set
      }
    })
    $3265389822_$2537101590_fm.autoFocusTimer = null
  }
}

var $3265389822_$2537101590_createBranch = function (parent, index) {
  var container = { index: index }
  if (parent.direction === 'y') {
    var y = index ? parent.children[index - 1].y.end : parent.y.start
    container.direction = 'x'
    container.x = { start: parent.x.start, end: parent.x.end }
    container.y = { start: y, end: y }
  } else {
    var x = index ? parent.children[index - 1].x.end : parent.x.start
    container.direction = 'y'
    container.x = { start: x, end: x }
    container.y = { start: parent.y.start, end: parent.y.end }
  }
  container.children = []
  container.parent = parent
  parent.children[index] = container
}

var $3265389822_$2537101590_createLeaf = function (parent, index, set) {
  var x, y
  if (parent.direction === 'y') {
    x = set.x === void 0 ? parent.x.start : set.x
    y = set.y === void 0 ? index ? parent.children[index - 1].y.end : parent.y.start : set.y
  } else {
    x = set.x === void 0 ? index ? parent.children[index - 1].x.end : parent.x.start : set.x
    y = set.y === void 0 ? parent.y.start : set.y
  }
  set.index = index
  set.x = { start: x, mid: x + (set.width || 1) / 2, end: x + (set.width || 1) }
  set.y = { start: y, mid: y + (set.height || 1) / 2, end: y + (set.height || 1) }
  set.parent = parent
  parent.children[index] = set
}

var $3265389822_$2537101590_updatePositions = function (parent, set) {
  while (parent) {
    var changedX = $3265389822_$2537101590_updateParentPosition(parent, set, 'x')
    var changedY = $3265389822_$2537101590_updateParentPosition(parent, set, 'y')
    if (changedY || changedX) {
      set = parent
      parent = parent.parent
    } else {
      break
    }
  }
}

var $3265389822_$2537101590_updateParentPosition = function (parent, set, axis) {
  if (axis in parent) {
    var a = parent[axis]
    if (a.end < set[axis].end) {
      a.end = set[axis].end
      a.mid = a.start + (a.end - a.start) / 2
      // if same direction stretch siblings to same size
      if ('parent' in parent && parent.direction === axis) {
        var siblings = parent.parent.children
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

var $3265389822_$2537101590_setOnPosition = function (coordinates, set) {
  var parent = $3265389822_$2537101590_fm
  var index = coordinates[0]
  for (var i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) { $3265389822_$2537101590_createBranch(parent, index) }
    parent = parent.children[index]
    index = coordinates[++i]
  }
  $3265389822_$2537101590_createLeaf(parent, index, set)
  $3265389822_$2537101590_updatePositions(parent, set)
}

var $3265389822_$2537101590_fm = {
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
  register: function register (coordinates, element) {
    $3265389822_$2537101590_addEventListeners()
    $3265389822_$2537101590_setOnPosition(coordinates, element)
    $3265389822_$2537101590_autoFocus(element)
    return element
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
  */
  unregister: function unregister (coordinates) {
    var child = $3265389822_$2537101590_fm
    var index, children
    for (var i = 0, l = coordinates.length; i < l; i++) {
      index = coordinates[i]
      children = child.children
      child = children[index]
      if (!child) { return }
    }
    if ($3265389822_$2537101590_fm.currentFocus === child) {
      var sibling = children[index ? index - 1 : index + 1]
      if (sibling) {
        $3265389822_$2537101590_focusElement(sibling)
      } else {
        $3265389822_$2537101590_changeFocus('x', -1) ||
          $3265389822_$2537101590_changeFocus('y', -1) ||
            $3265389822_$2537101590_changeFocus('x', 1) ||
              $3265389822_$2537101590_changeFocus('y', 1)
      }
    }
    var length
    while ((length = children.length) === 1 && (child = child.parent)) {
      children = child.children
    }
    for (var j = index + 1; j < length; j++) {
      var child$1 = children[j]
      children[child$1.index = j - 1] = child$1
    }
    children.pop()
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
    - set (obj) eg { x }
  */
  update: function update (coordinates, set) {
    console.log('- update', coordinates, set)
  },
  /*
    focus element
    params:
    - coordinates (obj) eg [0,0,0]
    OR
    - element (obj)
    returns element if new focus
  */
  focus: function focus (element) {
    if (Array.isArray(element)) {
      var children = $3265389822_$2537101590_fm.children
      var target
      for (var i = 0, l = element.length; i < l; i++) {
        target = children[element[i]]
        if (!target) { return }
        children = target.children
      }
      element = target
    }
    return $3265389822_$2537101590_focusElement(element)
  },
  render: function render (style) {
    var view = document.createElement('div')
    if ($3265389822_$2537101590_fm.view) {
      $3265389822_$2537101590_fm.view.parentNode.removeChild($3265389822_$2537101590_fm.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    $3265389822_$2537101590_render(view, $3265389822_$2537101590_fm, [])
    return ($3265389822_$2537101590_fm.view = view)
  }
}

var $3265389822_$2537101590_render = function (root, element, coordinates) {
  var div = document.createElement('div')
  var style = div.style

  style.position = 'absolute'
  style.left = element.x.start / $3265389822_$2537101590_fm.x.end * 100 + '%'
  style.top = element.y.start / $3265389822_$2537101590_fm.y.end * 100 + '%'
  style.width = (element.x.end - element.x.start) / $3265389822_$2537101590_fm.x.end * 100 + '%'
  style.height = (element.y.end - element.y.start) / $3265389822_$2537101590_fm.y.end * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in element) {
    for (var i = 0, l = element.children.length; i < l; i++) {
      var child = element.children[i]
      root.appendChild($3265389822_$2537101590_render(root, child, coordinates.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(coordinates)
    style.backgroundColor = element === $3265389822_$2537101590_fm.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

var $3265389822_$2537101590 = $3265389822_$2537101590_fm


var $3265389822 = $3265389822_$2537101590
;

window.fm = $3265389822

var $1598400738_log = function (obj) { return JSON.stringify(obj, function (key, value) { return key !== 'parent' ? value : void 0; }, 2); }

var $1598400738_focusIn = function (ref) {
  var node = ref.node;
  var x = ref.x;
  var y = ref.y;
  var parent = ref.parent;

  node.style.background = 'red'
  node.style.fontSize = '10px'
  node.innerHTML = 'x:' + JSON.stringify(x) +
    '<br/> y:' + JSON.stringify(y) +
    '<br/> parent.direction:' + JSON.stringify(parent.direction)
}
var $1598400738_focusOut = function (ref) {
var node = ref.node;
 node.style.background = 'lightgrey' }

var $1598400738_navItems = document.getElementsByTagName('nav')[0].getElementsByTagName('li')
var $1598400738_menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
var $1598400738_sectionItems = document.getElementsByTagName('section')[0].getElementsByTagName('li')
var $1598400738_bottomItems = document.getElementsByTagName('nav')[1].getElementsByTagName('li')
// [y, x, y]
$3265389822.direction = 'y'

var $1598400738_register = function (coordinates, node) {
  var rect = node.getBoundingClientRect()
  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  $3265389822.register(coordinates, {
    node: node,
    height: rect.height,
    width: rect.width,
    focusIn: $1598400738_focusIn,
    focusOut: $1598400738_focusOut
  })
}

// register navitems
for (var i = 0; i < $1598400738_navItems.length; i++) {
  $1598400738_register([0, i], $1598400738_navItems[i])
}

// register menuitems
for (var i$1 = 0; i$1 < $1598400738_menuItems.length; i$1++) {
  $1598400738_register([1, 0, i$1], $1598400738_menuItems[i$1])
}

// register sectionitems
for (var i$2 = 0; i$2 < $1598400738_sectionItems.length; i$2++) {
  $1598400738_register([1, 1, i$2], $1598400738_sectionItems[i$2])
}

// register bottomitems
for (var i$3 = 0; i$3 < $1598400738_bottomItems.length; i$3++) {
  $1598400738_register([2, i$3], $1598400738_bottomItems[i$3])
}

var $1598400738_render = function () { return setTimeout(function () { return document.body.appendChild($3265389822.render({
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: '200px',
  height: '200px',
  fontSize: '10px'
})); }); }

window.addEventListener('keydown', $1598400738_render)
$1598400738_render()

console.log('%cchildren:', 'font-weight: bold')
console.log($1598400738_log($3265389822.children))

window.unregister = function (coordinates) {
  $3265389822.unregister(coordinates)
  $1598400738_render()
}
;
 })(window, {})