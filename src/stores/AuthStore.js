import { observable } from 'mobx'

export default class AuthStore {
    @observable processing = false
    @observable loggedIn = false
    @observable usernameN = ''
    @observable username = ''
    @observable token = ''
}