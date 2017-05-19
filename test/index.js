import aim from '../'
import util from '../src/util'

window.aim = aim

const log = obj => JSON.stringify(obj, (key, value) => key !== 'parent' ? value : void 0, 2)

const onFocus = ({ index, node, x, y, parent }) => {
  node.style.background = 'red'
  node.style.fontSize = '10px'
  if (!node._info) {
    node._info = document.createElement('div')
    node.appendChild(node._info)
  }
  node._info.innerHTML = 'x:' + log(x) +
    '<br/> y:' + log(y) +
    '<br/> parent.direction:' + parent.direction
}
const onBlur = ({ node }) => {
  node.style.background = 'lightgrey'
}
const onEnter = ({ node }) => {
  node.style.background = 'blue'
}

const section = document.getElementsByTagName('section')[0]
const navItems = document.getElementsByTagName('nav')[0].getElementsByTagName('li')
const menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
const sectionItems = section.getElementsByTagName('li')
const bottomItems = document.getElementsByTagName('nav')[1].getElementsByTagName('li')

const register = (position, node) => {
  const rect = node.getBoundingClientRect()
  if (!node._hw) {
    node._hw = document.createElement('div')
    node.appendChild(node._hw)
  }
  node._hw.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  aim.register({
    node,
    h: rect.height,
    w: rect.width,
    onFocus,
    onBlur,
    onEnter
  }, position)
}

// register navitems
for (let i = 0; i < navItems.length; i++) {
  register([0, i], navItems[i])
}

// register menuitems
for (let i = 0; i < menuItems.length; i++) {
  register([1, 0, i], menuItems[i])
}

// register sectionitems
for (let i = 0; i < sectionItems.length; i++) {
  register([1, 1, i], sectionItems[i])
}

// register bottomitems
for (let i = 0; i < bottomItems.length; i++) {
  register([2, i], bottomItems[i])
}

const render = () => setTimeout(() => document.body.appendChild(util.render(aim, {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '200px',
  height: '200px',
  fontSize: '10px'
})))

window.addEventListener('keydown', e => {
  aim.handleKeyEvent(e)
  render()
})

const target = aim.get([1, 1])

section.addEventListener('scroll', () => {
  const { scrollTop, offsetHeight } = section
  var n = scrollTop / (section.scrollHeight - offsetHeight)
  n = ~~(n * target.children.length - 0.5)
  aim.focus(target.children[n])
  aim.offsetY(target, -scrollTop, offsetHeight)
  render()
})

window.addEventListener('resize', e => {
  for (let i = 0; i < navItems.length; i++) {
    const node = navItems[i]
    const rect = node.getBoundingClientRect()
    node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width
    const target = aim.get([0, i])
    aim.update(target, 'w', rect.width)
  }
  render()
})

render()

console.log('%cchildren:', 'font-weight: bold')
console.log(log(aim.children))

window.unregister = (position) => {
  aim.unregister(aim.get(position))
  render()
}
