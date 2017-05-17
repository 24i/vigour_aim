# Aim
Dependency free **focus manager** with built-in universal key navigation.

```sh
npm i --save aim
```

## Examples
```js
aim.register({
  onFocus () {
    // fires when element is focused
  },
  onBlur () {
    // fires when element is unfocused 
  },
  onUpdate () {
    // fires when there has been an update such as scroll, resize 
  }
}, [0, 0, 1])
```

## Methods
### aim.register(element, position)
Registers element on given position.

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Object</code> | Element containing handlers. |
| position | <code>Array</code> | Coordinates for position. |

### aim.unregister(element)
Unregisters element.

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Object</code> | Element to unregister. |

### aim.update(element, property, value)
Update properties for given element. Can be used when scrolling sections of the view, animating components or resizing the window.

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Object</code> | Coordinates for position or element. |
| property | <code>String</code> | Property to update, eg. <code>x</code> or <code>y</code>. |

## Events
### onFocus(element)
Fires when element is focused.

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Object</code> | Registered element. |

### onBlur(element)
Fires when element is unfocused.

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Object</code> | Registered element. |
