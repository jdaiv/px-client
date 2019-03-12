import { observer, Provider } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../shared/GameManager'
import GameStore from '../shared/GameStore'
import style from '../style/index.css'
import ActionBar from './action_bar'
import ContentPortal from './content_portal'
import Header from './header'
import Sidebar from './sidebar'

const gameStore = new GameStore()
const gameManager = new GameManager(gameStore)

// tslint:disable-next-line: no-namespace
declare namespace window {
    let gameStore: GameStore
    let gameManager: GameManager
}

if (typeof window !== 'undefined') {
    if (window.gameManager) window.gameManager.socket.destroy()
    window.gameStore = gameStore
    window.gameManager = gameManager
}

@observer
export default class App extends Component {
    public render() {
        return (
            <div class={style.app}>
                <Provider game={gameStore}>
                    <Header />
                    <div class={style.container}>
                        <Sidebar />
                        <div class={style.gameArea}>
                            {/* <ContentPortal /> */}
                            {/* <ActionBar /> */}
                        </div>
                    </div>
                </Provider>
            </div>
        )
    }
}
