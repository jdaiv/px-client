import { apiUrl } from '../config/const'
import GameStore from './GameStore'

const ADDR = `${apiUrl}/api/auth/`

const isBrowser = typeof window !== 'undefined'

export default class Auth {

    public password: string
    public store: GameStore

    constructor(store: GameStore) {
        this.store = store
        this.password = null
        this.loadPassword()
        if (this.password !== null) {
            this.login(this.password)
        }
    }

    public loadPassword() {
        if (isBrowser) this.password = window.localStorage.getItem('password')
        if (this.password === 'null') this.password = null
    }

    public savePassword(password: string) {
        this.password = password
        if (isBrowser) window.localStorage.setItem('password', password)
    }

    public invalidate() {
        this.savePassword(null)
        this.store.connection.validUser = false
    }

    public async login(password: string): Promise<any> {
        const data = new FormData()
        data.append('password', password)
        try {
            const r = await fetch(ADDR + 'login', {
                method: 'POST',
                body: data
            })
            const json = await r.json()
            if (!json.error) {
                this.savePassword(password)
                this.store.user.usernameN = json.data.nameNormal
                this.store.user.username = json.data.name
                this.store.connection.validUser = true
            }
            return json
        } catch (err) {
            console.error('auth error', err)
            this.store.connection.validUser = false
        }
    }

    public async createUser(username: string): Promise<boolean> {
        const data = new FormData()
        data.append('username', username)
        try {
            const r = await fetch(ADDR + 'create', {
                method: 'POST',
                body: data
            })
            const json = await r.json()
            if (!json.error) {
                this.savePassword(json.data)
                return this.login(json.data)
            }
            return false
        } catch (err) {
            console.error('auth error', err)
            this.store.connection.validUser = false
        }
    }

    public logout() {
        this.invalidate()
    }

}
