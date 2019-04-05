import { observer, Provider } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../shared/GameManager'
import style from '../style/index.css'
import ActionBar from './action_bar'
import ContentPortal from './content_portal'
import Header from './header'
import Sidebar from './sidebar'

const gameManager = new GameManager()

// tslint:disable-next-line: no-namespace
declare namespace window {
    let gameManager: GameManager
}

if (typeof window !== 'undefined') {
    if (window.gameManager) window.gameManager.socket.destroy()
    window.gameManager = gameManager
}

@observer
export default class App extends Component {
    public render() {
        return (
            <div class={style.app}>
                <Provider game={gameManager.store}>
                    <div class={style.container}>
                        <Header />
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
