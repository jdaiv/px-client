import { action, observable } from 'mobx'
import GameState from './GameState'

class UserObject {
    @observable public id: number
    @observable public usernameN: string
    @observable public username: string
}

class ConnectionInfo {
    @observable public connected: boolean
    @observable public processing: boolean
    @observable public validUser: boolean
    @observable public authenticated: boolean
}

class GameSettings {
    @observable public quality: number = 2
}

class EditorSettings {
    @observable public mode = 'zone'
    @observable public enabled = false
    @observable public activeTile: number = 2
    @observable public activeEntity: string
    @observable public selectedEntity = -1
}

interface IChatMessage {
    notice: boolean
    content: string
}

class ChatLog {
    @observable.shallow public log: IChatMessage[] = []
    @observable.shallow public userList: string[] = []

    @action.bound
    public addEntry({ from, content, notice, ...data }) {
        let formatted: string
        if (from && data.class !== 'server') {
            formatted = `(${new Date().toLocaleTimeString()}) ${from}: ${content}`
        } else {
            formatted = `(${data.class || 'system'}) ${content}`
        }
        this.log.push({ notice: data.class === 'server', content: formatted })
    }
}

export default class GameStore {

    public user = new UserObject()
    public connection = new ConnectionInfo()
    public settings = new GameSettings()
    public editor = new EditorSettings()
    public chatLog = new ChatLog()
    public state: GameState

    @observable public activeUseSlot = 'empty'

    constructor(state: GameState) {
        this.state = state
    }

}
