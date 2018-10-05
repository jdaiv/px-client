import { observable } from 'mobx'

export default class SocketStore {
    @observable ready = false
    @observable authenticated = false
}