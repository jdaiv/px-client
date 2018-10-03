import EventManager from './EventManager'
import Auth from './Auth'
import { wsUrl } from '../config/const'

const RETRY_WAIT = 1500
const MAX_RETRIES = 3

export default class Connector {

    static init () {
        Connector.retries = 0
        Connector.queue = []
        Connector.ready = false
        Connector.authenticated = false
        Connector.username = ''

        EventManager.subscribe('auth_update', 'ws_auth', (data) => {
            if (data === true) Connector.auth()
            else if (data === false) {
                Connector.authenticated = false
                Connector.username = ''
                Connector.close()
            }
        })
    }

    static open () {
        if (Connector.retries >= MAX_RETRIES) throw new Error('Max retries hit')
        // if we're currently connecting or connecting, don't attempt
        if (Connector.ws != null && Connector.ws.readyState < 2) return
        Connector.ws = new WebSocket(wsUrl)

        Connector.ws.onopen = () => {
            console.log('ws opened', wsUrl)
            Connector.retries = 0
            EventManager.publish('ws_debug', null)
            Connector.send('global', 'ping', 'all', null, true)
        }

        Connector.ws.onmessage = (evt) => {
            console.log('ws message', evt)
            Connector.receive(evt)
            EventManager.publish('ws_debug', null)
        }

        Connector.ws.onerror = (evt) => {
            console.error('ws error', evt)
            Connector.retries++
            EventManager.publish('ws_debug', null)
        }

        Connector.ws.onclose = () => {
            console.log('ws closed')
            Connector.authenticated = false
            Connector.ready = false
            EventManager.publish('ws_debug', null)
            EventManager.publish('ws_status', false)
            setTimeout(Connector.open, RETRY_WAIT)
        }
    }

    static close () {
        Connector.ws.close()
    }

    static auth () {
        if (Auth.token && Connector.ready && !Connector.authenticated) {
            Connector.send('auth', 'login', 'all', Auth.token, true)
        }
    }

    static flushQueue () {
        const queue = Connector.queue.slice()
        Connector.queue = []
        queue.forEach(d => Connector.send(d.scope, d.action, d.target, d.data))
    }

    static send (scope, action, target, data, force) {
        if (force && !Connector.ws && Connector.ws.readyState != 1){
            console.log(`can't force send ${scope}/${action}:`, data)
        } else if (!force &&
            (!Connector.ws || Connector.ws.readyState != 1 ||
             !Connector.ready || !Connector.authenticated)) {
            Connector.queue.push({ scope, action, target, data })
        } else {
            console.log(`sending ${scope}/${action}/${target}:`, data)
            EventManager.publish('ws_debug', data)
            Connector.ws.send(JSON.stringify({
                action: {
                    scope,
                    type: action,
                    target
                },
                data: JSON.stringify(data)
            }))
        }
    }

    static receive (evt) {
        let data
        try {
            data = JSON.parse(evt.data)
        } catch (err) {
            console.error('ignoring message, not JSON', evt)
            return
        }

        EventManager.publish('ws_debug', data)

        const { type, scope } = data.action

        if (!Connector.ready && !Connector.authenticated) {
            if (!data.error && scope == 'global' && type == 'pong') {
                Connector.ready = true
                Connector.auth()
            }
            EventManager.publish('ws_status', Connector.ready)
        } else if (!Connector.authenticated) {
            if (scope == 'auth' && type == 'login') {
                if (data.error === 0) {
                    Connector.authenticated = true
                    Connector.username = data.data.name
                    Connector.flushQueue()
                } else {
                    Auth.logout()
                }
            }
            EventManager.publish('ws_auth', Connector.authenticated)
        } else {
            EventManager.publish(`ws/${scope}/${type}`, data)
        }
    }

}