import Auth from './Auth'
import GameStore from './GameStore'
import Socket from './Socket'

export default class GameManager {

// tslint:disable-next-line: variable-name
    private static _instance: GameManager
    private static get instance(): GameManager {
        return this._instance
    }

    public store: GameStore
    public auth: Auth
    public socket: Socket

    constructor(store: GameStore) {
        this.store = store
        this.auth = new Auth(store)
        this.socket = new Socket(store, this.auth, this.onData)
        this.socket.open()
        GameManager._instance = this
    }

    public onData(type: string, { error, data }) {
        switch (type) {
        case 'game_state':
            if (error === 0) this.store.gameState = data
            break

        case 'list_users':
            break

        case 'chat_message':
            this.store.chatLog.addEntry(data)
            break
        }
    }

}
