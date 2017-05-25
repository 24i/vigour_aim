import aim from '../'
import util from '../dist/util'
import { render } from 'brisky-render'
import bs from 'stamp'
import h from 'hub.js'

// clear html => we use brisky now
for (var i = document.body.children.length - 1; i >= 0; i--) {
  document.body.removeChild(document.body.children[i])
}

const hub = h({
  currentPage: [ '@', 'root', 'page', 'discover' ],
  menu: [
    { title: 'menu a' },
    { title: 'menu b' },
    { title: 'menu c' },
    { title: 'menu d' },
    { title: 'menu e' }
  ],
  page: {
    discover: [
      { title: 'discover a' },
      { title: 'discover b' },
      { title: 'discover c' },
      { title: 'discover d' },
      { title: 'discover e' }
    ],
    shows: [
      { title: 'shows a' },
      { title: 'shows b' },
      { title: 'shows c' },
      { title: 'shows d' },
      { title: 'shows e' }
    ]
  }
})

const listenForFocus = columnIndex => ({
  focusListener: {
    type: 'property',
    $: 'focused',
    render: {
      state: (t, s) => {
        if (s.compute()) {
          const target = aim.get([0, columnIndex, s._p.key | 0])
          if (target) aim.focus(target)
          renderView()
        }
      }
    }
  }
})

const registerTarget = (state, target, position) => {
  target.onFocus = (target, aim) => {
    const stamp = bs.create()
    if (aim.currentFocus) {
      aim.currentFocus.state.get('focused').set(false, stamp)
    }
    state.get('focused').set(true, stamp)
    bs.close()
    // state
  }
  target.onBlur = () => {
    // state.get('focused').set(false)
  }
  target.state = state
  aim.register(target, position)
  if (state.get('focused', false).compute()) {
    aim.focus(target)
  }
}

const Page = props => {
  return <div>{
    props.page.discover.map(p => <div style={{
      width: 'calc(100vw - 300px)',
      height: '200px',
      lineHeight: '200px',
      color: p.focused.compute() ? 'red' : 'black',
      borderBottom: '1px solid lightgrey'
    }} onRender={({ state }) => {
      registerTarget(state, { h: 200, w: 300 }, [0, 1, state.key | 0])
    }} inject={listenForFocus(1)}>{ p.title.compute() }</div>)
  }</div>
}

const App = props => <div>
  <aside style={{
    verticalAlign: 'top'
  }}>{
    props.menu.map(p => <div style={{
      width: '300px',
      height: '50px',
      lineHeight: '50px',
      color: p.focused.compute() ? 'red' : 'black',
      borderBottom: '1px solid lightgrey'
    }} onRender={({ state }) => {
      registerTarget(state, { h: 50, w: 300 }, [0, 0, state.key | 0])
    }} inject={listenForFocus(0)}>{ p.title.compute() }</div>)
  }</aside>
  <Page />
</div>

document.body.appendChild(render(App, hub))

hub.connect('ws://localhost:3030')

const renderView = () => setTimeout(() => document.body.appendChild(util.render(aim, {
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '200px',
  height: '200px',
  fontSize: '10px'
})))

window.addEventListener('keydown', aim.handleKeyEvent)
