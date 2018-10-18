import { Base64 } from 'js-base64'
import EventManager from './EventManager'
import { apiUrl } from '../config/const'

const ADDR = `${apiUrl}/api/auth`

const isBrowser = typeof window !== 'undefined'

export default class AuthService {

    constructor (authStore) {
        this.store = authStore
        this.loadToken()
        this.readClaims()
    }

    loadToken () {
        if (isBrowser) this.store.token = window.localStorage.getItem('auth_token')
        if (this.store.token == 'null') this.store.token = null
        this.store.loggedIn = this.store.token != null
        EventManager.publish('auth_update', this.store.token != null)
    }

    storeToken (token) {
        this.store.token = token
        if (isBrowser) window.localStorage.setItem('auth_token', token)
        if (token != null) {
            this.store.loggedIn = true
            this.readClaims()
        }
    }

    invalidate () {
        this.storeToken(null)
        this.store.loggedIn = false
        EventManager.publish('auth_update', false)
    }

    readClaims () {
        if (!this.store.token) return

        try {
            const [ , claimsRaw ] = this.store.token.split('.')
            // atob() butchers unicode, so we're bringing in something better?
            const claims = JSON.parse(Base64.fromBase64(claimsRaw))
            this.store.usernameN = claims.name
            this.store.username = claims.full_name
        } catch (err) {
            console.log('token invalid', err)
            this.invalidate()
        }
    }

    login (username, password) {
        const data = new FormData()
        data.append('username', username)
        data.append('password', password)
        return fetch(ADDR, {
            method: 'POST',
            body: data
        }).then(r => {
            return r.json()
        }).then(json => {
            if (!json.error) {
                this.storeToken(json.data)
                EventManager.publish('auth_update', this.store.loggedIn)
            }

            return json
        }).catch(err => {
            console.error('auth error', err)
            EventManager.publish('auth_update', false)
        })
    }

    logout () {
        this.invalidate()
    }

}