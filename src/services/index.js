import Auth from './Auth'
import Connector from './Connector'
import Chat from './Chat'
import EventManager from './EventManager'

export default class Services {

    static init () {
        Services.auth = Auth
        Services.chat = Chat

        // core
        EventManager.init()
        Connector.init()
        Connector.open()

        // services
        Auth.init()
        Chat.init()
    }

}