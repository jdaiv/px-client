import AuthService from './AuthService'
import SocketService from './SocketService'
import RoomService from './RoomService'
import EventManager from './EventManager'

export default class Services {

    static init (socketStore, authStore, roomStore) {
        EventManager.init()

        Services.auth = new AuthService(authStore)
        Services.socket = new SocketService(socketStore, Services.auth)
        Services.rooms = new RoomService(roomStore, Services.socket)

        Services.socket.open()
    }

}