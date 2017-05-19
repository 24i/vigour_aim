# Aim
Dependency free **focus manager** with built-in universal key navigation.

```sh
npm i --save aim
```

## What?
Register your focusable targets with Aim and Aim will map these into a virtual *table-esque* view.

Aim will now listen for key events, delegate these to the currently focused target and execute default cursor navigation if not prevented by target handlers.

## Examples
```js
aim.register({
  onFocus (target) {
    // fires when target is focused
    // return false to prevent focus
  },
  onBlur (target) {
    // fires when target is unfocused 

  },
  onRight (target) {
    // fires when right is pressed
    // return false to prevent default behaviour (ie. moving cursor to the right)
  },
  onEnter (target) {
    // fires when enter is pressed
  }
}, [0, 0, 1])
```

## Methods
### aim.register(target, position)
Registers target on given position.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Target containing handlers. |
| position | <code>Array</code> | Coordinates for position. |

### aim.unregister(target)
Unregisters target.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Target to unregister. |

### aim.update(target, property, value)
Update properties for given target. Can be used for repositioning / resizing targets.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Target to update. |
| property | <code>String</code> | Property to update, eg. <code>x</code> or <code>y</code>. |
| value | <code>Number</code> | New value of property |

### aim.offsetY(target, value)
Sets an offsetY value to (holder) target, without updating all individual child nodes. Will be used when calculating left/up/down/right node.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Target to update. |
| value | <code>Number</code> | New value of property |

### aim.offsetX(target, value)
Same as **aim.offsetY()** for the x axis.

### aim.get(position)
Get target by position.

| Param | Type | Description |
| --- | --- | --- |
| position | <code>Array</code> | The coordinates to target (eg. [0, 0, 1]). |

### aim.left()
Move focus to the left.

### aim.up()
Move focus to up.

### aim.right()
Move focus to the right.

### aim.down()
Move focus to down.

### aim.handleKeyEvent(event)
Delegate key event to Aim.

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Object</code> | DOM KeyEvent. |

## Events
### onFocus(target)
Fires when target is focused.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Registered target. |

### onBlur(target)
Fires on target when removing focus.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Registered target. |

### onEnter(target)
Fires on focused target when user presses "enter".

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Registered target. |
