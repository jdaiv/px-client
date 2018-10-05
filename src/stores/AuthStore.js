import { observable } from 'mobx'

export default class AuthStore {
    @observable processing = false
    @observable loggedIn = false
    @observable username = ''
    @observable token = ''
}