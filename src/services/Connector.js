import EventManager from './EventManager'
import Auth from './Auth'

const RETRY_WAIT = 1500
const MAX_RETRIES = 3
const ADDR = 'ws://localhost:8000/api/ws'

export default class Connector {

    static init () {
        Connector.ws = window.apiWs
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
                console.log('wack')
            }
        })
    }

    static open () {
        if (Connector.retries >= MAX_RETRIES) throw new Error('Max retries hit')
        // if we're currently connecting or connecting, don't attempt
        if (Connector.ws != null && Connector.ws.readyState < 2) return
        Connector.ws = window.apiWs = new WebSocket(ADDR)

        Connector.ws.onopen = () => {
            console.log('ws opened', ADDR)
            Connector.retries = 0
            EventManager.publish('ws_debug', null)
            Connector.send('global', 'ping', null, true)
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
            Connector.send('auth', 'login', Auth.token, true)
        }
    }

    static flushQueue () {
        const queue = Connector.queue.slice()
        Connector.queue = []
        queue.forEach(d => Connector.send(d.scope, d.action, d.data))
    }

    static send (scope, action, data, force) {
        if (force && !Connector.ws && Connector.ws.readyState != 1){
            console.log(`can't force send ${scope}/${action}:`, data)
        } else if (!force &&
            (!Connector.ws || Connector.ws.readyState != 1 ||
             !Connector.ready || !Connector.authenticated)) {
            Connector.queue.push({ scope, action, data })
        } else {
            console.log(`sending ${scope}/${action}:`, data)
            EventManager.publish('ws_debug', data)
            Connector.ws.send(JSON.stringify({
                scope,
                action,
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

        if (data.error) {
            console.error('server error', data)
        }

        if (!Connector.ready && !Connector.authenticated) {
            if (!data.error && data.scope == 'global' && data.action == 'pong') {
                Connector.ready = true
                Connector.auth()
            }
            EventManager.publish('ws_status', Connector.ready)
        } else if (!Connector.authenticated) {
            if (data.scope == 'auth' && data.action == 'login') {
                if (data.error === 0) {
                    Connector.authenticated = true
                    Connector.username = data.data.name
                    Connector.flushQueue()
                } else {
                    Auth.logout()
                }
            }
            EventManager.publish('ws_auth', data)
        } else {
            EventManager.publish('ws_message', data)
        }
    }

}