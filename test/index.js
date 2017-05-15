import fm from '../'

window.fm = fm

const log = obj => JSON.stringify(obj, (key, value) => key !== 'parent' ? value : void 0, 2)

const focusIn = ({ node, x, y, parent }) => {
  node.style.background = 'red'
  node.style.fontSize = '10px'
  node.innerHTML = 'x:' + JSON.stringify(x) +
    '<br/> y:' + JSON.stringify(y) +
    '<br/> parent.direction:' + JSON.stringify(parent.direction)
}
const focusOut = ({ node }) => { node.style.background = 'lightgrey' }

const navItems = document.getElementsByTagName('nav')[0].getElementsByTagName('li')
const menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
const sectionItems = document.getElementsByTagName('section')[0].getElementsByTagName('li')

// [x, y, x, y]

// register navitems
for (let i = 0; i < navItems.length; i++) {
  const node = navItems[i]
  const rect = node.getBoundingClientRect()

  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  fm.register([0, 0, i], {
    node,
    height: rect.height,
    width: rect.width,
    focusIn,
    focusOut
  })
}

// register menuitems
for (let i = 0; i < menuItems.length; i++) {
  const node = menuItems[i]
  const rect = node.getBoundingClientRect()
  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  fm.register([0, 1, 0, i], {
    node,
    height: rect.height,
    width: rect.width,
    focusIn,
    focusOut
  })
}

// register sectionitems
for (let i = 0; i < sectionItems.length; i++) {
  const node = sectionItems[i]
  const rect = node.getBoundingClientRect()
  node.innerHTML = 'h:' + rect.height + ' | w:' + rect.width

  fm.register([0, 1, 1, i], {
    node,
    height: rect.height,
    width: rect.width,
    focusIn,
    focusOut
  })
}

console.log('%cchildren:', 'font-weight: bold')
console.log(log(fm.children))
