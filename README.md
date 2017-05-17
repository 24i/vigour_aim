# Aim
Dependency free **focus manager** with built-in universal key navigation.

```sh
npm i --save aim
```

## Examples
```js
aim.register({
  onFocus (target) {
    // fires when target is focused
  },
  onBlur (target) {
    // fires when target is unfocused 
  },
  onUpdate (target) {
    // fires when there has been an update such as scroll, resize 
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
Same as **aim.offsetY** for the x axis.

## Events
### onFocus(target)
Fires when target is focused.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Registered target. |

### onBlur(target)
Fires when target is unfocused.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Registered target. |
