import { wsUrl } from '../config/const'
import SocketStore from '../stores/SocketStore'
import AuthService from './AuthService'
import EventManager from './EventManager'

const RETRY_WAIT = 1500
const MAX_RETRIES = 3

export default class SocketService {

    public store: SocketStore
    public authService: AuthService

    private destroyed: boolean
    private retries: number
    private queue: any[]
    private ws: WebSocket
    private pingInterval: any

    constructor(socketStore: SocketStore, authService: AuthService) {
        this.store = socketStore
        this.authService = authService

        this.retries = 0
        this.queue = []
        this.destroyed = false

        EventManager.subscribe('auth_update', 'ws_auth', (data) => {
            if (data === true) this.auth()
            else if (data === false) {
                this.store.authenticated = false
            }
        })
    }

    public open(manual?: boolean) {
        if (this.destroyed) return
        if (typeof window === 'undefined') return
        if (this.retries >= MAX_RETRIES && !manual) throw new Error('Max retries hit')
        // if we're currently connecting or connecting, don't attempt
        if (this.ws != null && this.ws.readyState < 2) return
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
            console.log('ws opened', wsUrl)
            this.retries = 0
            EventManager.publish('ws_debug', null)
            this.pingInterval = setInterval(() => {
                this.send('ping', null, true)
            }, 1000) as any
        }

        this.ws.onmessage = (evt) => {
            // console.log('ws message', evt)
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
            if (!this.destroyed) setTimeout(this.open.bind(this), RETRY_WAIT)
            clearInterval(this.pingInterval)
        }
    }

    public close() {
        this.store.ready = false
        this.store.authenticated = false
        this.ws.close()
    }

    public destroy() {
        this.destroyed = true
        this.close()
    }

    public auth() {
        if (this.authService.password && this.store.ready && !this.store.authenticated) {
            this.send('login', this.authService.password, true)
        }
    }

    public flushQueue() {
        const queue = this.queue.slice()
        this.queue = []
        queue.forEach(d => this.send(d.action, d.data, d.force))
    }

    public send(action: string, data?: any, force?: boolean) {
        if (force && !this.ws && this.ws.readyState !== 1) {
            console.log(`can't force send ${action}:`, data)
        } else if (!force &&
            (!this.ws || this.ws.readyState != 1 || !this.store.ready)) {
            this.queue.push([action, data])
        } else {
            // console.log(`sending ${action}:`, data)
            EventManager.publish('ws_debug', data)
            this.ws.send(JSON.stringify({
                action,
                data: JSON.stringify(data)
            }))
        }
    }

    public receive(evt: any) {
        let data: any
        try {
            data = JSON.parse(evt.data)
        } catch (err) {
            console.error('ignoring message, not JSON', evt)
            return
        }

        EventManager.publish('ws_debug', data)

        if (!this.store.ready && !this.store.authenticated) {
            if (!data.error && data.action === 'ping') {
                this.store.ready = true
                this.auth()
            }
            EventManager.publish('ws_status', this.store.ready)
        } else if (data.action === 'login') {
            if (data.error === 0) {
                this.store.authenticated = true
                this.flushQueue()
            } else {
                this.authService.logout()
            }
            EventManager.publish('ws_auth', this.store.authenticated)
        } else {
            EventManager.publish(`ws/${data.action}`, data)
        }
    }

}
