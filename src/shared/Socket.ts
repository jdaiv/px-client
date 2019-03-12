import { IReactionDisposer, reaction } from 'mobx'
import { wsUrl } from '../config/const'
import Auth from './Auth'
import GameStore from './GameStore'

const RETRY_WAIT = 1500
const MAX_RETRIES = 3

type DataCallback = (arg0: string, arg1: any) => void

export default class Socket {

    public auth: Auth
    public store: GameStore
    public authReaction: IReactionDisposer
    public onData: DataCallback

    private destroyed: boolean
    private retries: number
    private queue: any[]
    private ws: WebSocket
    private pingInterval: any

    constructor(store: GameStore, auth: Auth, onData: DataCallback) {
        this.store = store
        this.auth = auth
        this.onData = onData

        this.retries = 0
        this.queue = []
        this.destroyed = false

        this.authReaction = reaction(
            () => this.store.connection.validUser,
            valid => {
                if (valid) {
                    this.login()
                } else {
                    this.store.connection.authenticated = false
                    this.close()
                }
            }
        )
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
            this.pingInterval = setInterval(() => {
                this.send('ping', null, true)
            }, 1000) as any
        }

        this.ws.onmessage = (evt) => {
            // console.log('ws message', evt)
            this.receive(evt)
        }

        this.ws.onerror = (evt) => {
            console.error('ws error', evt)
            this.retries++
        }

        this.ws.onclose = () => {
            console.log('ws closed')
            this.store.connection.authenticated = false
            this.store.connection.connected = false
            if (!this.destroyed) setTimeout(this.open.bind(this), RETRY_WAIT)
            clearInterval(this.pingInterval)
        }
    }

    public close() {
        this.store.connection.connected = false
        this.store.connection.authenticated = false
        this.ws.close()
    }

    public destroy() {
        this.destroyed = true
        this.close()
    }

    public login() {
        if (this.auth.password &&
            this.store.connection.connected &&
            !this.store.connection.authenticated) {
            this.send('login', this.auth.password, true)
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
            (!this.ws || this.ws.readyState !== 1 || !this.store.connection.connected)) {
            this.queue.push([action, data])
        } else {
            // console.log(`sending ${action}:`, data)
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

        if (!this.store.connection.connected && !this.store.connection.authenticated) {
            if (!data.error && data.action === 'ping') {
                this.store.connection.connected = true
                this.login()
            }
        } else if (data.action === 'login') {
            if (data.error === 0) {
                this.store.connection.authenticated = true
                this.flushQueue()
            } else {
                this.auth.logout()
            }
        } else {
            this.onData(data.action, data)
        }
    }

}
