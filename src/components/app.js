import { h, Component } from 'preact'
import Helmet from 'preact-helmet'
import { Provider, observer } from 'mobx-preact'

import favicon from '../assets/favicon.png'

import Header from './header'
import Sidebar from './sidebar'
import ContentPortal from './content_portal'
import ActionBar from './action_bar'

import AuthStore from '../stores/AuthStore'
import SocketStore from '../stores/SocketStore'
import Services from '../services'
import UIStore from '../stores/UIStore'

const socketStore = new SocketStore()
const authStore = new AuthStore()
const uiStore = new UIStore()

if (typeof window !== 'undefined') {
    if (window.services) window.services.destroy()
}
Services.init(socketStore, authStore, uiStore)
if (typeof window !== 'undefined') {
    window.services = Services
}

@observer
export default class App extends Component{
    render() {
        return (
            <div id="app">
                <Provider auth={authStore} socket={socketStore} ui={uiStore}>
                    <Helmet
                        title="The Panic Express"
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
                        <Sidebar />
                        <div class="gameArea">
                            <ContentPortal />
                            <ActionBar />
                        </div>
                    </div>
                </Provider>
            </div>
        )
    }
}


