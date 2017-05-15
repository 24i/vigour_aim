(function (global, process) { 
var $3265389822_exports = {}
var $3265389822_$2537101590_keys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

var $3265389822_$2537101590_log = function (obj) { return JSON.stringify(obj, function (key, value) { return key !== 'parent' ? value : void 0; }, 2); }

var $3265389822_$2537101590_findClosestDescendant = function (child) {
  var x = $3265389822_$2537101590_fm.currentFocus.x.mid
  var y = $3265389822_$2537101590_fm.currentFocus.y.mid
  var children
  while (children = child.children) {
    for (var i = children.length - 1, diff = (void 0); i >= 0; i--) {
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

var $3265389822_$2537101590_changeFocus = function (direction, delta) {
  var target = $3265389822_$2537101590_fm.currentFocus
  // walk up from currentFocus
  while (target) {
    if (target.direction === direction) {
      var siblings = target.parent.children
      var sibling = target
      // if direction is correct walk (delta) sibling
      while (sibling = siblings[sibling.index + delta]) {
        var child = $3265389822_$2537101590_findClosestDescendant(sibling)
        // if child focusIn doesnt cancel (returns false), complete transaction
        if (child.focusIn(child) !== false) {
          $3265389822_$2537101590_fm.currentFocus.focusOut($3265389822_$2537101590_fm.currentFocus)
          $3265389822_$2537101590_fm.currentFocus = child
          return
        }
      }
    }
    target = target.parent
  }
}

var $3265389822_$2537101590_onKeyDown = function (event) {
  var key = $3265389822_$2537101590_keys[event.keyCode]
  if (key) {
    var focusUpdate = $3265389822_$2537101590_fm.currentFocus.focusUpdate
    var handledByElement = focusUpdate
      ? focusUpdate($3265389822_$2537101590_fm.currentFocus)
      : false
    if (handledByElement === false) {
      var delta, direction
      if (key === 'up') {
        direction = 'y'
        delta = -1
      } else if (key === 'down') {
        direction = 'y'
        delta = 1
      } else if (key === 'left') {
        direction = 'x'
        delta = -1
      } else if (key === 'right') {
        direction = 'x'
        delta = 1
      }
      if (direction) {
        $3265389822_$2537101590_changeFocus(direction, delta)
      }
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

var $3265389822_$2537101590_updatePositioningUpwards = function (set, parent) {
  while (parent.x) {
    var xChanged = (void 0), yChanged = (void 0)
    if (parent.x.start === void 0 || parent.x.start > set.x.start) {
      parent.x.start = set.x.start
      xChanged = true
    }
    if (parent.x.end === void 0 || parent.x.end < set.x.end) {
      parent.x.end = set.x.end
      xChanged = true
    }
    if (parent.y.start === void 0 || parent.y.start > set.y.start) {
      parent.y.start = set.y.start
      yChanged = true
    }
    if (parent.y.end === void 0 || parent.y.end < set.y.end) {
      parent.y.end = set.y.end
      yChanged = true
    }
    if (!xChanged && !yChanged) {
      break
    }
    if (xChanged) {
      parent.x.mid = parent.x.start + (parent.x.end - parent.x.start) / 2
    }
    if (yChanged) {
      parent.y.mid = parent.y.start + (parent.y.end - parent.y.start) / 2
    }
    parent = parent.parent
  }
}

var $3265389822_$2537101590_getStartPosition = function (set, parent, direction, index) {
  if (direction === 'x') {
    return {
      x: set.x === void 0
      ? index ? parent.children[index - 1].x.end : parent.x ? parent.x.start : 0
      : set.x,
      y: set.y === void 0
      ? parent.y ? parent.y.start : 0
      : set.y
    }
  } else {
    return {
      x: set.x === void 0
      ? parent.x ? parent.x.start : 0
      : set.x,
      y: set.y === void 0
      ? index ? parent.children[index - 1].y.end : parent.y ? parent.y.start : 0
      : set.y
    }
  }
}

var $3265389822_$2537101590_setOnPosition = function (coordinates, set) {
  var parent = $3265389822_$2537101590_fm
  var direction = 'x'
  var index = coordinates[0]

  for (var i = 0, n = coordinates.length - 1; i < n;) {
    if (!parent.children[index]) {
      var ref = $3265389822_$2537101590_getStartPosition(set, parent, direction, index);
      var x$1 = ref.x;
      var y$1 = ref.y;
      parent.children[index] = {
        x: { start: x$1 },
        y: { start: y$1 },
        children: [],
        direction: direction,
        index: index,
        parent: parent
      }
    }
    parent = parent.children[index]
    children = parent.children
    direction = direction === 'x' ? 'y' : 'x'
    index = coordinates[++i]
  }

  var ref$1 = $3265389822_$2537101590_getStartPosition(set, parent, direction, index);
  var x = ref$1.x;
  var y = ref$1.y;

  set.index = index
  set.parent = parent
  set.direction = direction
  set.x = {
    start: x,
    mid: x + (set.width || 1) / 2,
    end: x + (set.width || 1)
  }
  set.y = {
    start: y,
    mid: y + (set.height || 1) / 2,
    end: y + (set.height || 1)
  }
  parent.children[index] = set
  $3265389822_$2537101590_updatePositioningUpwards(set, parent)
}

var $3265389822_$2537101590_fm = {
  currentFocus: false,
  children: [],
  /*
    register element, this can happen on eg. render
    params:
    - coordinates (obj) eg [0,0,0]
    - set (obj) eg { state, x, y, focusIn, focusUpdate, focusOut }
  */
  register: function register (coordinates, set) {
    $3265389822_$2537101590_addEventListeners()
    $3265389822_$2537101590_setOnPosition(coordinates, set)
    $3265389822_$2537101590_autoFocus(set)
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
  */
  unregister: function unregister (coordinates) {
    $3265389822_$2537101590_setOnPosition(coordinates, null)
    // refocus here
  },
  /*
    unregister element, this can happen on eg. remove
    params:
    - coordinates (obj) eg [0,0,0]
    - set (obj) eg { x }
  */
  update: function update (coordinates, set) {
    console.log('- update', coordinates, set)
  }
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
  var direction = ref.direction;

  node.style.background = 'red'
  node.style.fontSize = '12px'
  node.innerHTML = 'x:' + JSON.stringify(x) +
    '<br/> y:' + JSON.stringify(y) +
    '<br/> direction:' + JSON.stringify(direction)
}
var $1598400738_focusOut = function (ref) {
var node = ref.node;
 node.style.background = 'lightgrey' }

var $1598400738_navItems = document.getElementsByTagName('nav')[0].getElementsByTagName('li')
var $1598400738_menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
var $1598400738_sectionItems = document.getElementsByTagName('section')[0].getElementsByTagName('li')

// [x, y, x, y]

// register navitems
for (var i = 0; i < $1598400738_navItems.length; i++) {
  var node = $1598400738_navItems[i]
  var rect = node.getBoundingClientRect()

  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  $3265389822.register([0, 0, i], {
    node: node,
    height: rect.height,
    width: rect.width,
    focusIn: $1598400738_focusIn,
    focusOut: $1598400738_focusOut
  })
}

// register menuitems
for (var i$1 = 0; i$1 < $1598400738_menuItems.length; i$1++) {
  var node$1 = $1598400738_menuItems[i$1]
  var rect$1 = node$1.getBoundingClientRect()
  node$1.innerHTML = 'h:' + rect$1.height + ' | w:' + rect$1.width

  $3265389822.register([0, 1, 0, i$1], {
    node: node$1,
    height: rect$1.height,
    width: rect$1.width,
    focusIn: $1598400738_focusIn,
    focusOut: $1598400738_focusOut
  })
}

// register sectionitems
for (var i$2 = 0; i$2 < $1598400738_sectionItems.length; i$2++) {
  var node$2 = $1598400738_sectionItems[i$2]
  var rect$2 = node$2.getBoundingClientRect()
  node$2.innerHTML = 'h:' + rect$2.height + ' | w:' + rect$2.width

  $3265389822.register([0, 1, 1, i$2], {
    node: node$2,
    height: rect$2.height,
    width: rect$2.width,
    focusIn: $1598400738_focusIn,
    focusOut: $1598400738_focusOut
  })
}

console.log('%cchildren:', 'font-weight: bold')
console.log($1598400738_log($3265389822.children))
;
 })(window, {})