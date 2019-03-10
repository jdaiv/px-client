import { observer, Provider } from 'mobx-preact'
import { Component, h } from 'preact'
import Services from '../services'
import SocketService from '../services/SocketService'
import AuthStore from '../stores/AuthStore'
import SocketStore from '../stores/SocketStore'
import UIStore from '../stores/UIStore'
import style from '../style/index.css'
import ActionBar from './action_bar'
import ContentPortal from './content_portal'
import Header from './header'
import Sidebar from './sidebar'

const socketStore = new SocketStore()
const authStore = new AuthStore()
const uiStore = new UIStore()

// tslint:disable-next-line: no-namespace
declare namespace window {
    let services: Services
    let socketService: SocketService
}

Services.init(socketStore, authStore, uiStore)
if (typeof window !== 'undefined') {
    if (window.socketService) window.socketService.destroy()
    window.services = Services
    window.socketService = Services.socket
}

@observer
export default class App extends Component {
    public render() {
        return (
            <div class={style.app}>
                <Provider auth={authStore} socket={socketStore} ui={uiStore}>
                    <Header />
                    <div class={style.container}>
                        <Sidebar />
                        <div class={style.gameArea}>
                            <ContentPortal />
                            <ActionBar />
                        </div>
                    </div>
                </Provider>
            </div>
        )
    }
}
