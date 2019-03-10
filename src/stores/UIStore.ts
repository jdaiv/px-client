import { action, observable } from 'mobx'

export default class UIStore {
    @observable public quality = 2

    @observable public processing = false

    @observable.shallow public log: any[] = []
    @observable.shallow public gameState: any = {}
    @observable public activeUseSlot = 'empty'

    @action.bound
    public addEntry({ from, content, notice, ...data }) {
        const timestamp = new Date()
        let formatted: string
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
