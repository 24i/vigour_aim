import aim from '../'

window.aim = aim

const log = obj => JSON.stringify(obj, (key, value) => key !== 'parent' ? value : void 0, 2)

const onFocus = ({ node, x, y, parent }) => {
  node.style.background = 'red'
  node.style.fontSize = '10px'
  node.innerHTML = 'x:' + log(x) +
    '<br/> y:' + log(y) +
    '<br/> parent.direction:' + parent.direction
}
const onBlur = ({ node }) => { node.style.background = 'lightgrey' }
const section = document.getElementsByTagName('section')[0]
const navItems = document.getElementsByTagName('nav')[0].getElementsByTagName('li')
const menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
const sectionItems = section.getElementsByTagName('li')
const bottomItems = document.getElementsByTagName('nav')[1].getElementsByTagName('li')
// [y, x, y]
aim.direction = 'y'

const register = (position, node) => {
  const rect = node.getBoundingClientRect()
  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  aim.register({
    node,
    height: rect.height,
    width: rect.width,
    onFocus,
    onBlur
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

const render = () => setTimeout(() => document.body.appendChild(aim.render({
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: '200px',
  height: '200px',
  fontSize: '10px'
})))

window.addEventListener('keydown', e => {
  render()
  e.preventDefault()
})

section.addEventListener('scroll', () => {
  aim.update(aim.get([1, 1]), 'y', -section.scrollTop)
})

render()

console.log('%cchildren:', 'font-weight: bold')
console.log(log(aim.children))

window.unregister = (position) => {
  aim.unregister(aim.get(position))
  render()
}
