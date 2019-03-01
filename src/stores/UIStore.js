import { observable, action } from 'mobx'

export default class UIStore {
    @observable quality = 2

    @observable processing = false

    @observable.shallow log = []
    @observable.shallow gameState = {}

    @action.bound
    addEntry ({ from, content, notice, ...data }) {
        const timestamp = new Date()
        let formatted
        if (from && data.class != 'server') {
            formatted = `(${timestamp.toLocaleTimeString()}) ${from}: ${content}`
        } else {
            formatted = `(${data.class || 'system'}) ${content}`
        }
        this.log.push({
            from,
            content,
            timestamp,
            formatted,
            notice: notice || data.class == 'server' || !from
        })
    }
}