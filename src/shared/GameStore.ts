import { action, observable } from 'mobx'

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

class ChatLog {
    @observable.shallow public log: string[] = []
    @observable.shallow public userList: string[] = []

    @action.bound
    public addEntry({ from, content, notice, ...data }) {
        let formatted: string
        if (from && data.class !== 'server') {
            formatted = `(${new Date().toLocaleTimeString()}) ${from}: ${content}`
        } else {
            formatted = `(${data.class || 'system'}) ${content}`
        }
        this.log.push(formatted)
    }
}

export default class GameStore {

    public user = new UserObject()
    public connection = new ConnectionInfo()
    public settings = new GameSettings()
    public chatLog = new ChatLog()

    @observable.shallow public gameState: any = {}
    @observable public activeUseSlot = 'empty'

}
