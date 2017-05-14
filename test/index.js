import fm from '../'

window.fm = fm

const log = obj => JSON.stringify(obj, (key, value) => key !== 'parent' ? value : void 0, 2)
const menuItems = document.getElementsByTagName('aside')[0].getElementsByTagName('li')
const focusIn = ({ node }) => { node.style.background = 'red' }
const focusOut = ({ node }) => { node.style.background = 'lightgrey' }

const sectionItems = document.getElementsByTagName('section')[0].getElementsByTagName('li')

// register menuitems
for (let i = 0; i < menuItems.length; i++) {
  fm.register([0, i], {
    node: menuItems[i],
    focusIn,
    focusOut
  })
}

// register sectionitems
for (let i = 0; i < sectionItems.length; i++) {
  fm.register([1, i], {
    node: sectionItems[i],
    focusIn,
    focusOut
  })
}

console.log('%cchildren:', 'font-weight: bold')
console.log(log(fm.children))
