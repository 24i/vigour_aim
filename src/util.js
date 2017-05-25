const renderChild = (aim, root, target, position) => {
  const div = document.createElement('div')
  const style = div.style

  style.position = 'absolute'
  style.left = target.x / aim.xEnd * 100 + '%'
  style.top = target.y / aim.yEnd * 100 + '%'
  style.width = (target.xEnd - target.x) / aim.xEnd * 100 + '%'
  style.height = (target.yEnd - target.y) / aim.yEnd * 100 + '%'
  style.boxSizing = 'border-box'
  style.border = '1px solid white'
  style.textAlign = 'center'
  style.color = 'white'

  if ('children' in target) {
    for (let i = 0, l = target.children.length; i < l; i++) {
      if (i in target.children) {
        const child = target.children[i]
        root.appendChild(renderChild(aim, root, child, position.concat(child.index)))
      }
    }
  } else {
    div.innerHTML = JSON.stringify(position)
    style.backgroundColor = target === aim.currentFocus
      ? 'rgba(255,0,0,0.5)'
      : 'rgba(0,0,0,0.5)'
  }
  return div
}

export default {
  render (aim, style) {
    const view = document.createElement('div')
    if (aim.view) {
      aim.view.parentNode.removeChild(aim.view)
    }
    for (var field in style) {
      view.style[field] = style[field]
    }
    renderChild(aim, view, aim, [])
    return (aim.view = view)
  }
}
