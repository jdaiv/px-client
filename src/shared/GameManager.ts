import Auth from './Auth'
import GameState from './GameState'
import GameStore from './GameStore'
import Socket from './Socket'

export default class GameManager {

// tslint:disable-next-line: variable-name
    private static _instance: GameManager
    public static get instance(): GameManager {
        return this._instance
    }

    public state: GameState
    public store: GameStore
    public auth: Auth
    public socket: Socket

    constructor() {
        this.state = new GameState()
        this.store = new GameStore(this.state)
        this.auth = new Auth(this.store)
        this.socket = new Socket(this.store, this.auth, this.onData)
        this.socket.open()
        GameManager._instance = this
    }

    public onData(type: string, { error, data }) {
        switch (type) {
        case 'game_state':
            if (error === 0) this.store.state.readData(data)
            break

        case 'list_users':
            break

        case 'chat_message':
            this.store.chatLog.addEntry(data)
            break
        }
    }

}
