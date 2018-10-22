import { h, Component } from 'preact'
import Helmet from 'preact-helmet'
import { Provider, observer } from 'mobx-preact'

import favicon from '../assets/favicon.png'

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
if (typeof window !== 'undefined') window.services = Services

@observer
export default class App extends Component{
    render() {
        return (
            <div id="app">
                <Provider auth={authStore} socket={socketStore} rooms={roomStore}>
                    <Helmet
                        title={'The Panic Express' + (roomStore.active ? ' - ' + roomStore.activeRoom.name : '')}
                        htmlAttributes={{ lang: 'en' }}
                        meta={[
                            { name: 'description', content: 'Play poorly made things with friends!' }
                        ]}
                        link={[
                            { rel: 'icon', type: 'image/png', href: favicon }
                        ]}
                    />
                    <Header />
                    <div class="container">
                        <ContentPortal />
                        <Sidebar />
                    </div>
                </Provider>
            </div>
        )
    }
}


