import aim from '../'
import util from '../dist/util'
import { render } from 'brisky-render'
import h from 'hub.js'

// clear html => we use brisky now
for (var i = document.body.children.length - 1; i >= 0; i--) {
  document.body.removeChild(document.body.children[i])
}

const state = h({
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

const Page = props => {
  return <div>{
    props.currentPage.map(p => <div style={{
      width: 'calc(100vw - 300px)',
      height: '200px',
      lineHeight: '200px',
      color: p.focused.compute() ? 'red' : 'black',
      borderBottom: '1px solid lightgrey'
    }} onRender={({ state }) => {
      aim.register({
        h: 200,
        onFocus () { state.set({ focused: true }) },
        onBlur () { state.set({ focused: false }) }
      }, [0, 1, state.key | 0])
    }}>{ p.title.compute() }</div>)
  }</div>
}

const Pages = props => {
  if (props.currentPage.compute()) {
    return <Page />
  }
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
      aim.register({
        h: 50,
        onFocus () {
          state.set({ focused: true })
        },
        onBlur () {
          state.set({ focused: false })
        }
      }, [0, 0, state.key | 0])
    }}>{ p.title.compute() }</div>)
  }</aside>
  <Pages />
</div>

document.body.appendChild(render(App, state))

window.addEventListener('keydown', e => {
  aim.handleKeyEvent(e)
})
