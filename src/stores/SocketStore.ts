import { observable } from 'mobx'

export default class SocketStore {
    @observable public ready: boolean = false
    @observable public authenticated: boolean = false
    @observable.shallow public user: object = null
}
