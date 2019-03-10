import { h, render } from 'preact'
import App from './components/app'

const root = document.getElementById('app-root')
render(<App />, root, root.firstChild as Element) // not actually an element 👀
