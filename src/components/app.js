import { h } from 'preact'
import { Provider } from 'mobx-preact'

import Header from './header'
import Sidebar from './sidebar'
import ContentPortal from './content_portal'

import AuthStore from '../stores/AuthStore'
import SocketStore from '../stores/SocketStore'
import RoomStore from '../stores/RoomStore'
import Services from '../services'

const socketStore = new SocketStore()
const authStore = new AuthStore()
const roomStore = new RoomStore()

Services.init(socketStore, authStore, roomStore)
window.services = Services

const App = () => (
    <div id="app">
        <Provider auth={authStore} socket={socketStore} rooms={roomStore}>
            <Header />
            <div class="container">
                <ContentPortal />
                <Sidebar />
            </div>
        </Provider>
    </div>
)

export default App
