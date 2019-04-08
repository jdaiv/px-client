import { action, observable, reaction } from 'mobx'
import GameState from './GameState'

class UserObject {
    @observable public id: number
    @observable public usernameN: string
    @observable public username: string
    @observable public superuser: boolean
}

class ConnectionInfo {
    @observable public connected: boolean
    @observable public processing: boolean
    @observable public validUser: boolean
    @observable public authenticated: boolean
}

class GameSettings {
    @observable public quality: number = 4
    @observable public mouseSensitivity: number = 0.25
    @observable public fov: number = 90

    constructor() {
        reaction(() => this.quality, this.saveSettings, {delay: 500})
        reaction(() => this.mouseSensitivity, this.saveSettings, {delay: 500})
        reaction(() => this.fov, this.saveSettings, {delay: 500})

        const loaded = window.localStorage.getItem('settings')
        try {
            const loadedObj = JSON.parse(loaded)
            if (loadedObj.quality) {
                this.quality = loadedObj.quality
            }
            if (loadedObj.mouseSensitivity) {
                this.mouseSensitivity = loadedObj.mouseSensitivity
            }
            if (loadedObj.fov) {
                this.fov = loadedObj.fov
            }
        } catch (e) {
            console.log('Error loading settings: ', e)
        }
    }

    public saveSettings = () => {
        window.localStorage.setItem('settings', JSON.stringify({
            quality: this.quality,
            mouseSensitivity: this.mouseSensitivity
        }))
    }
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

    constructor(state: GameState) {
        this.state = state
    }

}
