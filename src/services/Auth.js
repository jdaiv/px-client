import { Base64 } from 'js-base64'
import EventManager from './EventManager'
import { apiUrl } from '../config/const'

const ADDR = `${apiUrl}/api/auth`

export default class Auth {

    static init () {
        Auth.loadToken()
        Auth.readClaims()
    }

    static loadToken () {
        Auth.token = window.localStorage.getItem('auth_token')
        EventManager.publish('auth_update', Auth.token != null)
    }

    static storeToken (token) {
        Auth.token = token
        window.localStorage.setItem('auth_token', token)
        if (token != null) {
            Auth.readClaims()
        }
    }

    static invalidate () {
        Auth.storeToken(null)
        EventManager.publish('auth_update', false)
    }

    static readClaims () {
        if (!Auth.token) return

        try {
            const [ , claimsRaw ] = Auth.token.split('.')
            // atob() butchers unicode, so we're bringing in something better?
            const claims = JSON.parse(Base64.fromBase64(claimsRaw))
            Auth.username = claims.name
        } catch (err) {
            console.log('token invalid', err)
            Auth.invalidate()
        }
    }

    static login (username, password) {
        const data = new FormData()
        data.append('username', username)
        data.append('password', password)
        fetch(ADDR, {
            method: 'POST',
            body: data
        }).then(r => {
            return r.json()
        }).then(json => {
            if (!json.error) {
                Auth.storeToken(json.data)
                EventManager.publish('auth_update', true)
            } else {
                throw new Error(json.message)
            }
        }).catch(err => {
            console.error('auth error', err)
            EventManager.publish('auth_update', false)
        })
    }

    static logout () {
        Auth.invalidate()
    }

}