import { changeFocus } from './focus'

const keys = {
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

const addEventListeners = fm => {
  if (!fm.addedListeners) {
    global.addEventListener('keydown', event => {
      if (event.keyCode in keys) {
        const focusUpdate = fm.currentFocus.focusUpdate
        const handledByElement = focusUpdate
          ? focusUpdate(fm.currentFocus)
          : false
        if (handledByElement === false) {
          const { delta, direction } = keys[event.keyCode]
          if (direction) changeFocus(fm, direction, delta)
        }
      }
    })
    fm.addedListeners = true
  }
}

export { addEventListeners }
