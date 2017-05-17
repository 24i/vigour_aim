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

const addEventListeners = aim => {
  if (!aim.addedListeners) {
    global.addEventListener('keydown', event => {
      if (event.keyCode in keys) {
        const focusUpdate = aim.currentFocus.focusUpdate
        const handledByElement = focusUpdate
          ? focusUpdate(aim.currentFocus)
          : false
        if (handledByElement === false) {
          const { delta, direction } = keys[event.keyCode]
          if (direction) changeFocus(aim, direction, delta)
        }
      }
    })
    aim.addedListeners = true
  }
}

export { addEventListeners }
