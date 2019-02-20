import AuthService from './AuthService'
import SocketService from './SocketService'
import EventManager from './EventManager'

export default class Services {

    static init (socketStore, authStore, uiStore) {
        EventManager.init()

        Services.auth = new AuthService(authStore)
        Services.socket = new SocketService(socketStore, Services.auth)

        Services.socket.open()
    }

}