(function (global, process) { 
var $3265389822_exports = {}
var $3265389822_$2537101590_keys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

var $3265389822_$2537101590_moveFocus = function (direction, delta) {
  if (direction) {
    var currentPos = $3265389822_$2537101590_fm.currentFocus.pos
    var target = $3265389822_$2537101590_fm.currentFocus
    while (target) {
      var parent = target.parent
      if (target.direction === direction) {
        var siblings = parent.children
        var sibling = target
        while (sibling = siblings[sibling.index + delta]) {
          var child = sibling
          var children = (void 0)
          while (children = child.children) {
            // get correct child based on position
            var d = (void 0)
            for (var i = children.length - 1; i >= 0; i--) {
              var next = children[i]
              var diff = Math.abs(currentPos - (next.pos || 0))
              if (d === void 0 || diff < d) {
                child = next
                d = diff
              }
            }
            if (d === void 0) { child = children[0] }
          }
          if (child.focusIn(child) !== false) {
            $3265389822_$2537101590_fm.currentFocus.focusOut($3265389822_$2537101590_fm.currentFocus)
            $3265389822_$2537101590_fm.currentFocus = child
            return
          }
        }
      }
      target = parent
    }
  }
}

var $3265389822_$2537101590_addEventListeners = function () {
  if (!$3265389822_$2537101590_fm.addedListeners) {
    var onKeyDown = function (event) {
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
          $3265389822_$2537101590_moveFocus(direction, delta)
        }
      }
    }
    global.addEventListener('keydown', onKeyDown)
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

var $3265389822_$2537101590_setOnPosition = function (coordinates, set) {
  var children = $3265389822_$2537101590_fm.children
  var parent = $3265389822_$2537101590_fm
  var onYAxis

  for (var i = 0, n = coordinates.length - 1; i <= n; i++) {
    var index = coordinates[i]
    if (i === n) {
      set.index = index
      set.parent = parent
      set.direction = onYAxis ? 'y' : 'x'
      // include more in absolute pos (like other rows in the matrix)
      if (set.pos === void 0) { set.pos = index }
      children[index] = set
    } else {
      if (!children[index]) {
        children[index] = {
          children: [],
          direction: onYAxis ? 'y' : 'x',
          index: index,
          parent: parent
        }
      }
      parent = children[index]
      children = parent.children
      onYAxis = !onYAxis
    }
  }
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
var $1598400738_menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
var $1598400738_focusIn = function (ref) {
var node = ref.node;
 node.style.background = 'red' }
var $1598400738_focusOut = function (ref) {
var node = ref.node;
 node.style.background = 'lightgrey' }

var $1598400738_sectionItems = document.getElementsByTagName('section')[0].getElementsByTagName('li')

// register menuitems
for (var i = 0; i < $1598400738_menuItems.length; i++) {
  $3265389822.register([0, i], {
    node: $1598400738_menuItems[i],
    focusIn: $1598400738_focusIn,
    focusOut: $1598400738_focusOut
  })
}

// register sectionitems
for (var i$1 = 0; i$1 < $1598400738_sectionItems.length; i$1++) {
  $3265389822.register([1, i$1], {
    node: $1598400738_sectionItems[i$1],
    focusIn: $1598400738_focusIn,
    focusOut: $1598400738_focusOut
  })
}

console.log('%cchildren:', 'font-weight: bold')
console.log($1598400738_log($3265389822.children))
;
 })(window, {})