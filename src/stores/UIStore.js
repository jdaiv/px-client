import { observable, action } from 'mobx'

export default class UIStore {
    @observable processing = false

    @observable.shallow log = []

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