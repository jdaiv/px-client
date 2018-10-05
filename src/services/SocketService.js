import EventManager from './EventManager'
import { wsUrl } from '../config/const'

const RETRY_WAIT = 1500
const MAX_RETRIES = 3

export default class SocketService {

    constructor (socketStore, authService) {
        this.store = socketStore
        this.authService = authService

        this.retries = 0
        this.queue = []

        EventManager.subscribe('auth_update', 'ws_auth', (data) => {
            if (data === true) this.auth()
            else if (data === false) {
                this.close()
            }
        })
    }

    open (manual) {
        if (this.retries >= MAX_RETRIES && !manual) throw new Error('Max retries hit')
        // if we're currently connecting or connecting, don't attempt
        if (this.ws != null && this.ws.readyState < 2) return
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
            console.log('ws opened', wsUrl)
            this.retries = 0
            EventManager.publish('ws_debug', null)
            this.send('global', 'ping', 'all', null, true)
        }

        this.ws.onmessage = (evt) => {
            console.log('ws message', evt)
            this.receive(evt)
            EventManager.publish('ws_debug', null)
        }

        this.ws.onerror = (evt) => {
            console.error('ws error', evt)
            this.retries++
            EventManager.publish('ws_debug', null)
        }

        this.ws.onclose = () => {
            console.log('ws closed')
            this.store.authenticated = false
            this.store.ready = false
            EventManager.publish('ws_debug', null)
            EventManager.publish('ws_status', false)
            setTimeout(this.open.bind(this), RETRY_WAIT)
        }
    }

    close () {
        this.store.ready = false
        this.store.authenticated = false
        this.ws.close()
    }

    auth () {
        if (this.authService.store.token && this.store.ready && !this.store.authenticated) {
            this.send('auth', 'login', 'all', this.authService.store.token, true)
        }
    }

    flushQueue () {
        const queue = this.queue.slice()
        this.queue = []
        queue.forEach(d => this.send(...d))
    }

    send (scope, action, target, data, force) {
        if (force && !this.ws && this.ws.readyState != 1){
            console.log(`can't force send ${scope}/${action}:`, data)
        } else if (!force &&
            (!this.ws || this.ws.readyState != 1 || !this.store.ready)) {
            this.queue.push([scope, action, target, data])
        } else {
            console.log(`sending ${scope}/${action}/${target}:`, data)
            EventManager.publish('ws_debug', data)
            this.ws.send(JSON.stringify({
                action: {
                    scope,
                    type: action,
                    target
                },
                data: JSON.stringify(data)
            }))
        }
    }

    receive (evt) {
        let data
        try {
            data = JSON.parse(evt.data)
        } catch (err) {
            console.error('ignoring message, not JSON', evt)
            return
        }

        EventManager.publish('ws_debug', data)

        const { type, scope } = data.action

        if (!this.store.ready && !this.store.authenticated) {
            if (!data.error && scope == 'global' && type == 'pong') {
                this.store.ready = true
                this.flushQueue()
                this.auth()
            }
            EventManager.publish('ws_status', this.store.ready)
        } else if (scope == 'auth' && type == 'login') {
            if (data.error === 0) {
                this.store.authenticated = true
            } else {
                this.authService.logout()
            }
            EventManager.publish('ws_auth', this.store.authenticated)
        } else {
            EventManager.publish(`ws/${scope}/${type}`, data)
        }
    }

}