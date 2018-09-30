import { h } from 'preact'

import Header from './header'
import Debug from './debug'
import Sidebar from './sidebar'
import ContentPortal from './content_portal'

const App = () => (
    <div id="app">
        <Header />
        <div class="container">
            <ContentPortal />
            <Sidebar />
        </div>
        <Debug />
    </div>
)

export default App
