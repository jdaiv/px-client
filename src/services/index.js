import AuthService from './AuthService'
import SocketService from './SocketService'
import EventManager from './EventManager'

export default class Services {

    static init (socketStore, authStore, uiStore) {
        Services.promises = []
        EventManager.init()

        Services.ui = uiStore
        Services.auth = new AuthService(authStore)
        Services.socket = new SocketService(socketStore, Services.auth)

        Services.socket.open()

        EventManager.subscribe(
            'ws/game_state',
            'service',
            ({ error, action, data }) => {
                if (error === 0) Services.ui.gameState = data
            })

        EventManager.subscribe(
            'ws/list_users',
            'chat_service',
            ({ error, action, data }) => {
                const pKey = 'list'
                if (Services.promises[pKey]) {
                    if (error != 0) {
                        Services.promises[pKey].reject()
                    } else {
                        Services.promises[pKey].resolve(data)
                    }
                    delete Services.promises[pKey]
                }
            })

        EventManager.subscribe(
            'ws/game_state',
            'chat_service',
            ({ error, action, data }) => {
                const pKey = 'game_state'
                if (Services.promises[pKey]) {
                    if (error != 0) {
                        Services.promises[pKey].reject()
                    } else {
                        Services.promises[pKey].resolve(data)
                    }
                    delete Services.promises[pKey]
                }
            })


        EventManager.subscribe(
            'ws/chat_message',
            'chat_service',
            ({ error, action, data }) => {
                uiStore.addEntry(data)
            })
    }

    static destroy () {
        EventManager.clear()
        Services.socket.destroy()
    }

    static send (msg) {
        Services.socket.send('chat_message', {
            content: msg
        })
    }

    static getUserList () {
        const pKey = 'list'
        if (!Services.promises[pKey]) {
            const newP = {}
            Services.socket.send('list_users')
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            Services.promises[pKey] = newP
        }
        return Services.promises[pKey].p
    }

    static getGameState () {
        const pKey = 'game_state'
        if (!Services.promises[pKey]) {
            const newP = {}
            Services.socket.send('game_state')
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            Services.promises[pKey] = newP
        }
        return Services.promises[pKey].p
    }

}