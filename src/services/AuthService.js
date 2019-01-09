import { Base64 } from 'js-base64'
import EventManager from './EventManager'
import { apiUrl } from '../config/const'

const ADDR = `${apiUrl}/api/auth/`

const isBrowser = typeof window !== 'undefined'

export default class AuthService {

    constructor (authStore) {
        this.store = authStore
        this.password = null
        this.loadPassword()
        if (this.password !== null) {
            this.login(this.password)
        }
    }

    loadPassword () {
        if (isBrowser) this.password = window.localStorage.getItem('password')
        if (this.password == 'null') this.password = null
    }

    savePassword (password) {
        this.password = password
        if (isBrowser) window.localStorage.setItem('password', password)
    }

    invalidate () {
        this.savePassword(null)
        this.store.loggedIn = false
        EventManager.publish('auth_update', false)
    }

    login (password) {
        const data = new FormData()
        data.append('password', password)
        return fetch(ADDR + 'login', {
            method: 'POST',
            body: data
        }).then(r => {
            return r.json()
        }).then(json => {
            if (!json.error) {
                this.savePassword(password)
                this.store.usernameN = json.data.nameNormal
                this.store.username = json.data.name
                this.store.loggedIn = true
                EventManager.publish('auth_update', true)
            }

            return json
        }).catch(err => {
            console.error('auth error', err)
            this.store.loggedIn = false
            EventManager.publish('auth_update', false)
        })
    }

    createUser (username) {
        const data = new FormData()
        data.append('username', username)
        return fetch(ADDR + 'create', {
            method: 'POST',
            body: data
        }).then(r => {
            return r.json()
        }).then(json => {
            if (!json.error) {
                this.savePassword(json.data)
                return this.login(json.data)
            }

            return false
        }).catch(err => {
            console.error('auth error', err)
            this.store.loggedIn = false
            EventManager.publish('auth_update', false)
        })
    }

    logout () {
        this.invalidate()
    }

}