(function (global, process) { 
var $3265389822_exports = {}
var $3265389822_$1874855716_autoFocus = function (fm, set) {
  if (!fm.currentFocus && !fm.autoFocusTimer) {
    fm.autoFocusTimer = setTimeout(function () {
      if (!fm.currentFocus) {
        set.onFocus(set)
        fm.currentFocus = set
      }
    })
    fm.autoFocusTimer = null
  }
}

var $3265389822_$1874855716_focusElement = function (fm, element) {
  if (element.onFocus(element) !== false) {
    fm.currentFocus.onBlur(fm.currentFocus)
    fm.currentFocus = element
    return element
  }
}

var $3265389822_$1874855716_findClosestDescendant = function (fm, child) {
  if ('children' in child) {
    var current = fm.currentFocus
    var parent = current
    var x = current.x.mid
    var y = current.y.mid
    var offsetX = 0
    var offsetY = 0
    while ((parent = parent.parent)) {
      if ('offset' in parent.x) { x += parent.x.offset }
      if ('offset' in parent.y) { y += parent.y.offset }
    }
    var children
    while ((children = child.children)) {
      if ('offset' in child.x) { offsetX += child.x.offset }
      if ('offset' in child.y) { offsetY += child.y.offset }
      for (var i = 0, l = children.length, diff = (void 0); i < l; i++) {
        var next = children[i]
        var a = x - next.x.mid - offsetX
        var b = y - next.y.mid - offsetY
        var c = Math.sqrt(a * a + b * b)
        if (diff === void 0 || c < diff) {
          child = next
          diff = c
        }
      }
    }
  }
  return child
}

var $3265389822_$1874855716_changeFocus = function (fm, direction, delta) {
  var target = fm.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      var sibling = target
      // if direction is correct walk (delta) sibling
      while ((sibling = parent.children[sibling.index + delta])) {
        var child = $3265389822_$1874855716_findClosestDescendant(fm, sibling)
        // if new focus return
        if ($3265389822_$1874855716_focusElement(fm, child)) { return child }
      }
    }
    target = parent
    parent = parent.parent
  }
}



var $3265389822_$1874855716_$ALL$ = {
  autoFocus: $3265389822_$1874855716_autoFocus,
  changeFocus: $3265389822_$1874855716_changeFocus,
  focusElement: $3265389822_$1874855716_focusElement
}
;var $3265389822_$883917132_createBranch = function (parent, index) {
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

var $3265389822_$883917132_createLeaf = function (parent, index, set) {
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



var $3265389822_$883917132_$ALL$ = {
  createBranch: $3265389822_$883917132_createBranch,
  createLeaf: $3265389822_$883917132_createLeaf
}
;

var $3265389822_$686231703_keys = {
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

var $3265389822_$686231703_addEventListeners = function (fm) {
  if (!fm.addedListeners) {
    global.addEventListener('keydown', function (event) {
      if (event.keyCode in $3265389822_$686231703_keys) {
        var focusUpdate = fm.currentFocus.focusUpdate
        var handledByElement = focusUpdate
          ? focusUpdate(fm.currentFocus)
          : false
        if (handledByElement === false) {
          var ref = $3265389822_$686231703_keys[event.keyCode];
          var delta = ref.delta;
          var direction = ref.direction;
          if (direction) { $3265389822_$1874855716_changeFocus(fm, direction, delta) }
        }
      }
    })
    fm.addedListeners = true
  }
}



var $3265389822_$686231703_$ALL$ = {
  addEventListeners: $3265389822_$686231703_addEventListeners
}
;



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

var $3265389822_$2537101590_setOnPosition = function (position, set) {
  var parent = $3265389822_$2537101590_aim
  var index = position[0]
  for (var i = 0, n = position.length - 1; i < n;) {
    if (!parent.children[index]) { $3265389822_$883917132_createBranch(parent, index) }
    parent = parent.children[index]
    index = position[++i]
  }
  $3265389822_$883917132_createLeaf(parent, index, set)
  $3265389822_$2537101590_updatePositions(parent, set)
}

var $3265389822_$2537101590_aim = {
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
  register: function register (element, position) {
    $3265389822_$686231703_addEventListeners($3265389822_$2537101590_aim)
    $3265389822_$2537101590_setOnPosition(position, element)
    $3265389822_$1874855716_autoFocus($3265389822_$2537101590_aim, element)
    return element
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - position (obj) eg [0,0,0]
  */
  unregister: function unregister (element) {
    var index = element.index
    var children = element.parent.children
    var length

    if ($3265389822_$2537101590_aim.currentFocus === element) {
      var sibling = children[index ? index - 1 : index + 1]
      if (sibling) {
        $3265389822_$1874855716_focusElement($3265389822_$2537101590_aim, sibling)
      } else {
        $3265389822_$1874855716_changeFocus($3265389822_$2537101590_aim, 'x', -1) ||
          $3265389822_$1874855716_changeFocus($3265389822_$2537101590_aim, 'y', -1) ||
            $3265389822_$1874855716_changeFocus($3265389822_$2537101590_aim, 'x', 1) ||
              $3265389822_$1874855716_changeFocus($3265389822_$2537101590_aim, 'y', 1)
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
  update: function update (element, property, value) {
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
  get: function get (position) {
    for (var i = 0, l = position.length, child = $3265389822_$2537101590_aim; i < l && child; i++) {
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
  focus: function focus (element) {
    if (Array.isArray(element)) {
      var children = $3265389822_$2537101590_aim.children
      var target
      for (var i = 0, l = element.length; i < l; i++) {
        target = children[element[i]]
        if (!target) { return }
        children = target.children
      }
      element = target
    }
    return $3265389822_$1874855716_focusElement($3265389822_$2537101590_aim, element)
  },
  render: function render (style) {
    var view = document.createElement('div')
    if ($3265389822_$2537101590_aim.view) {
      $3265389822_$2537101590_aim.view.parentNode.removeChild($3265389822_$2537101590_aim.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    $3265389822_$2537101590_render(view, $3265389822_$2537101590_aim, [])
    return ($3265389822_$2537101590_aim.view = view)
  }
}

var $3265389822_$2537101590_render = function (root, element, position) {
  var div = document.createElement('div')
  var style = div.style

  style.position = 'absolute'
  style.left = element.x.start / $3265389822_$2537101590_aim.x.end * 100 + '%'
  style.top = element.y.start / $3265389822_$2537101590_aim.y.end * 100 + '%'
  style.width = (element.x.end - element.x.start) / $3265389822_$2537101590_aim.x.end * 100 + '%'
  style.height = (element.y.end - element.y.start) / $3265389822_$2537101590_aim.y.end * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in element) {
    for (var i = 0, l = element.children.length; i < l; i++) {
      var child = element.children[i]
      root.appendChild($3265389822_$2537101590_render(root, child, position.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(position)
    style.backgroundColor = element === $3265389822_$2537101590_aim.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }

  return div
}

var $3265389822_$2537101590 = $3265389822_$2537101590_aim


var $3265389822 = $3265389822_$2537101590
;

window.aim = $3265389822

var $4271007840_log = function (obj) { return JSON.stringify(obj, function (key, value) { return key !== 'parent' ? value : void 0; }, 2); }

var $4271007840_onFocus = function (ref) {
  var node = ref.node;
  var x = ref.x;
  var y = ref.y;
  var parent = ref.parent;

  node.style.background = 'red'
  node.style.fontSize = '10px'
  node.innerHTML = 'x:' + $4271007840_log(x) +
    '<br/> y:' + $4271007840_log(y) +
    '<br/> parent.direction:' + parent.direction
}
var $4271007840_onBlur = function (ref) {
var node = ref.node;
 node.style.background = 'lightgrey' }
var $4271007840_section = document.getElementsByTagName('section')[0]
var $4271007840_navItems = document.getElementsByTagName('nav')[0].getElementsByTagName('li')
var $4271007840_menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
var $4271007840_sectionItems = $4271007840_section.getElementsByTagName('li')
var $4271007840_bottomItems = document.getElementsByTagName('nav')[1].getElementsByTagName('li')
// [y, x, y]
$3265389822.direction = 'y'

var $4271007840_register = function (position, node) {
  var rect = node.getBoundingClientRect()
  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  $3265389822.register({
    node: node,
    height: rect.height,
    width: rect.width,
    onFocus: $4271007840_onFocus,
    onBlur: $4271007840_onBlur
  }, position)
}

// register navitems
for (var i = 0; i < $4271007840_navItems.length; i++) {
  $4271007840_register([0, i], $4271007840_navItems[i])
}

// register menuitems
for (var i$1 = 0; i$1 < $4271007840_menuItems.length; i$1++) {
  $4271007840_register([1, 0, i$1], $4271007840_menuItems[i$1])
}

// register sectionitems
for (var i$2 = 0; i$2 < $4271007840_sectionItems.length; i$2++) {
  $4271007840_register([1, 1, i$2], $4271007840_sectionItems[i$2])
}

// register bottomitems
for (var i$3 = 0; i$3 < $4271007840_bottomItems.length; i$3++) {
  $4271007840_register([2, i$3], $4271007840_bottomItems[i$3])
}

var $4271007840_render = function () { return setTimeout(function () { return document.body.appendChild($3265389822.render({
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: '200px',
  height: '200px',
  fontSize: '10px'
})); }); }

window.addEventListener('keydown', function (e) {
  $4271007840_render()
  e.preventDefault()
})

$4271007840_section.addEventListener('scroll', function () {
  $3265389822.update($3265389822.get([1, 1]), 'y', -$4271007840_section.scrollTop)
})

$4271007840_render()

console.log('%cchildren:', 'font-weight: bold')
console.log($4271007840_log($3265389822.children))

window.unregister = function (position) {
  $3265389822.unregister($3265389822.get(position))
  $4271007840_render()
}
;
 })(window, {})