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
Update properties for given target. Can be used when scrolling sections of the view, animating components or resizing the window.

| Param | Type | Description |
| --- | --- | --- |
| target | <code>Object</code> | Coordinates for position or target. |
| property | <code>String</code> | Property to update, eg. <code>x</code> or <code>y</code>. |

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
