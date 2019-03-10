import { observable } from 'mobx'

export default class AuthStore {
    @observable public processing: boolean = false
    @observable public loggedIn: boolean = false
    @observable public usernameN: string = ''
    @observable public username: string = ''
    @observable public token: string = ''
}
