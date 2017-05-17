(function (global, process) { 
var $3265389822_exports = {}
var $3265389822_$1874855716_autoFocus = function (aim, set) {
  if (!aim.currentFocus && !aim.autoFocusTimer) {
    aim.autoFocusTimer = setTimeout(function () {
      aim.autoFocusTimer = null
      if (!aim.currentFocus) {
        set.onFocus(set)
        aim.currentFocus = set
      }
    })
  }
}

var $3265389822_$1874855716_focusElement = function (aim, target) {
  if (target.onFocus(target) !== false) {
    aim.currentFocus.onBlur(aim.currentFocus)
    aim.currentFocus = target
    return target
  }
}

var $3265389822_$1874855716_findClosestDescendant = function (aim, child) {
  if ('children' in child) {
    var current = aim.currentFocus
    var parent = current
    var x = current.xMid
    var y = current.yMid
    var xOffset = 0
    var yOffset = 0
    while ((parent = parent.parent)) {
      if ('xOffset' in parent) { x += parent.xOffset }
      if ('yOffset' in parent) { y += parent.yOffset }
    }
    var children
    while ((children = child.children)) {
      if ('xOffset' in child) { xOffset += child.xOffset }
      if ('yOffset' in child) { yOffset += child.yOffset }
      for (var i = 0, l = children.length, diff = (void 0); i < l; i++) {
        var next = children[i]
        var a = x - next.xMid - xOffset
        var b = y - next.yMid - yOffset
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

var $3265389822_$1874855716_changeFocus = function (aim, direction, delta) {
  var target = aim.currentFocus
  var parent = target.parent
  // walk up from currentFocus
  while (parent) {
    if (parent.direction === direction) {
      var sibling = target
      // if direction is correct walk (delta) sibling
      while ((sibling = parent.children[sibling.index + delta])) {
        var child = $3265389822_$1874855716_findClosestDescendant(aim, sibling)
        // if new focus return
        if ($3265389822_$1874855716_focusElement(aim, child)) { return child }
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
  var b = { index: index, children: [], parent: parent }
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

var $3265389822_$883917132_createLeaf = function (parent, index, set) {
  if (parent.direction === 'y') {
    if (!('x' in set)) { set.x = parent.x }
    if (!('y' in set)) { set.y = index ? parent.children[index - 1].yEnd : parent.y }
  } else {
    if (!('x' in set)) { set.x = index ? parent.children[index - 1].xEnd : parent.x }
    if (!('y' in set)) { set.y = parent.y }
  }
  set.index = index
  set.xMid = set.x + (set.w || 1) / 2
  set.xEnd = set.x + (set.w || 1)
  set.yMid = set.y + (set.h || 1) / 2
  set.yEnd = set.y + (set.h || 1)
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

var $3265389822_$686231703_addEventListeners = function (aim) {
  if (!aim.addedListeners) {
    global.addEventListener('keydown', function (event) {
      if (event.keyCode in $3265389822_$686231703_keys) {
        var focusUpdate = aim.currentFocus.focusUpdate
        var handledByElement = focusUpdate
          ? focusUpdate(aim.currentFocus)
          : false
        if (handledByElement === false) {
          var ref = $3265389822_$686231703_keys[event.keyCode];
          var delta = ref.delta;
          var direction = ref.direction;
          if (direction) { $3265389822_$1874855716_changeFocus(aim, direction, delta) }
        }
      }
    })
    aim.addedListeners = true
  }
}



var $3265389822_$686231703_$ALL$ = {
  addEventListeners: $3265389822_$686231703_addEventListeners
}
;



var $3265389822_$2537101590_updateX = function (parent, set) {
  if (parent.xEnd < set.xEnd) {
    parent.xEnd = set.xEnd
    parent.xMid = parent.x + (parent.xEnd - parent.x) / 2
    if ('parent' in parent && parent.direction === 'x') {
      var siblings = parent.parent.children
      for (var i = siblings.length - 1; i >= 0; i--) {
        var sibling = siblings[i]
        sibling.xEnd = parent.xEnd
        sibling.xMid = parent.xMid
      }
    }
    return parent
  }
}

var $3265389822_$2537101590_updateY = function (parent, set) {
  if (parent.yEnd < set.yEnd) {
    parent.yEnd = set.yEnd
    parent.yMid = parent.y + (parent.yEnd - parent.y) / 2
    if ('parent' in parent && parent.direction === 'y') {
      var siblings = parent.parent.children
      for (var i = siblings.length - 1; i >= 0; i--) {
        var sibling = siblings[i]
        sibling.yEnd = parent.yEnd
        sibling.yMid = parent.yMid
      }
    }
    return parent
  }
}

var $3265389822_$2537101590_updatePositions = function (parent, set) {
  while (parent) {
    var changedX = $3265389822_$2537101590_updateX(parent, set)
    var changedY = $3265389822_$2537101590_updateY(parent, set)
    if (changedY || changedX) {
      set = parent
      parent = parent.parent
    } else {
      break
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

var $3265389822_$2537101590_reset = function (parent) {
  if ('children' in parent) {
    parent.xEnd = 0
    parent.yEnd = 0
    for (var i = parent.children.length - 1; i >= 0; i--) {
      $3265389822_$2537101590_reset(parent.children[i])
    }
  }
}

var $3265389822_$2537101590_update = function (parent) {
  var children = parent.children
  for (var i = 0, max = children.length - 1; i <= max; i++) {
    var target = children[i]
    if ('children' in target) {
      $3265389822_$2537101590_update(target)
    } else {
      if (parent.direction === 'y') {
        target.y = i ? children[i - 1].yEnd : parent.y
        target.yMid = target.y + (target.h || 1) / 2
        target.yEnd = target.y + (target.h || 1)
      } else {
        target.x = i ? children[i - 1].xEnd : parent.x
        target.xMid = target.x + (target.w || 1) / 2
        target.xEnd = target.x + (target.w || 1)
      }
      if (max === i) {
        $3265389822_$2537101590_updatePositions(parent, target)
      }
    }
  }
}

var $3265389822_$2537101590_aim = {
  currentFocus: false,
  x: 0,
  xMid: 0,
  xEnd: 0,
  y: 0,
  yMid: 0,
  yEnd: 0,
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
  register: function register (target, position) {
    $3265389822_$686231703_addEventListeners($3265389822_$2537101590_aim)
    $3265389822_$2537101590_setOnPosition(position, target)
    $3265389822_$1874855716_autoFocus($3265389822_$2537101590_aim, target)
    return target
  },
  /*
    unregister target, this can happen on eg. remove
    params:
    - position (obj) eg [0,0,0]
  */
  unregister: function unregister (target) {
    var index = target.index
    var children = target.parent.children
    var length

    if ($3265389822_$2537101590_aim.currentFocus === target) {
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
  update: function update (target, property, value, throttleTime) {
    target[property] = value
    if (!('children' in target)) {
      if ($3265389822_$2537101590_aim.updateTimer) {
        $3265389822_$2537101590_aim.updateTimer = clearTimeout($3265389822_$2537101590_aim.updateTimer)
      }

      $3265389822_$2537101590_aim.updateTimer = setTimeout(function () {
        $3265389822_$2537101590_reset($3265389822_$2537101590_aim)
        $3265389822_$2537101590_update($3265389822_$2537101590_aim)
        $3265389822_$2537101590_aim.updateTimer = null
      }, throttleTime)
    }
  },
  get: function get (position) {
    for (var i = 0, l = position.length, child = $3265389822_$2537101590_aim; i < l && child; i++) {
      child = child.children[position[i]]
    }
    return child
  },
  offsetX: function offsetX (target, value) {
    target.xOffset = value
  },
  offsetY: function offsetY (target, value, size) {
    target.yOffset = value
  },
  focus: function focus (target) {
    if (target !== $3265389822_$2537101590_aim.currentFocus) { return $3265389822_$1874855716_focusElement($3265389822_$2537101590_aim, target) }
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

var $3265389822_$2537101590_render = function (root, target, position) {
  var div = document.createElement('div')
  var style = div.style

  style.position = 'absolute'
  style.left = target.x / $3265389822_$2537101590_aim.xEnd * 100 + '%'
  style.top = target.y / $3265389822_$2537101590_aim.yEnd * 100 + '%'
  style.width = (target.xEnd - target.x) / $3265389822_$2537101590_aim.xEnd * 100 + '%'
  style.height = (target.yEnd - target.y) / $3265389822_$2537101590_aim.yEnd * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in target) {
    for (var i = 0, l = target.children.length; i < l; i++) {
      var child = target.children[i]
      root.appendChild($3265389822_$2537101590_render(root, child, position.concat(child.index)))
    }
  } else {
    div.innerHTML = JSON.stringify(position)
    style.backgroundColor = target === $3265389822_$2537101590_aim.currentFocus
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
    h: rect.height,
    w: rect.width,
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
  left: 0,
  width: '200px',
  height: '200px',
  fontSize: '10px'
})); }); }

window.addEventListener('keydown', function (e) {
  $4271007840_render()
  e.preventDefault()
})

var $4271007840_target = $3265389822.get([1, 1])
$4271007840_section.addEventListener('scroll', function () {
  var n = $4271007840_section.scrollTop / ($4271007840_section.scrollHeight - $4271007840_section.offsetHeight)
  n = ~~(n * $4271007840_target.children.length - 0.5)
  $3265389822.focus($4271007840_target.children[n])
  $3265389822.offsetY($4271007840_target, -$4271007840_section.scrollTop)
  $4271007840_render()
})

window.addEventListener('resize', function (e) {
  for (var i = 0; i < $4271007840_navItems.length; i++) {
    var node = $4271007840_navItems[i]
    var rect = node.getBoundingClientRect()
    node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width
    var target = $3265389822.get([0, i])
    $3265389822.update(target, 'w', rect.width)
  }
  $4271007840_render()
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