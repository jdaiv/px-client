import AuthStore from '../stores/AuthStore'
import SocketStore from '../stores/SocketStore'
import UIStore from '../stores/UIStore'
import AuthService from './AuthService'
import EventManager from './EventManager'
import SocketService from './SocketService'

export default class Services {

    public static promises = []
    public static ui: UIStore
    public static auth: AuthService
    public static socket: SocketService

    public static init(socketStore: SocketStore, authStore: AuthStore, uiStore: UIStore) {
        EventManager.init()

        this.ui = uiStore
        this.auth = new AuthService(authStore)
        this.socket = new SocketService(socketStore, this.auth)

        this.socket.open()

        EventManager.subscribe(
            'ws/game_state',
            'service',
            ({ error, data }) => {
                if (error === 0) this.ui.gameState = data
            })

        EventManager.subscribe(
            'ws/list_users',
            'chat_service',
            ({ error, action, data }) => {
                const pKey = 'list'
                if (this.promises[pKey]) {
                    if (error !== 0) {
                        this.promises[pKey].reject()
                    } else {
                        this.promises[pKey].resolve(data)
                    }
                    delete this.promises[pKey]
                }
            })

        EventManager.subscribe(
            'ws/game_state',
            'chat_service',
            ({ error, action, data }) => {
                const pKey = 'game_state'
                if (this.promises[pKey]) {
                    if (error !== 0) {
                        this.promises[pKey].reject()
                    } else {
                        this.promises[pKey].resolve(data)
                    }
                    delete this.promises[pKey]
                }
            })

        EventManager.subscribe(
            'ws/chat_message',
            'chat_service',
            ({ error, action, data }) => {
                uiStore.addEntry(data)
            })
    }

    public static destroy() {
        EventManager.clear()
        this.socket.destroy()
    }

    public static send(msg: string) {
        this.socket.send('chat_message', {
            content: msg
        })
    }

    public static getUserList(): Promise<any> {
        const pKey = 'list'
        if (!this.promises[pKey]) {
            const newP: any = {}
            this.socket.send('list_users')
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            this.promises[pKey] = newP
        }
        return this.promises[pKey].p
    }

    public static getGameState(): Promise<any> {
        const pKey = 'game_state'
        if (!this.promises[pKey]) {
            const newP: any = {}
            this.socket.send('game_state')
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            this.promises[pKey] = newP
        }
        return this.promises[pKey].p
    }

}
