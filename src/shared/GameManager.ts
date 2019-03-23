import Auth from './Auth'
import GameState from './GameState'
import GameStore from './GameStore'
import Socket from './Socket'

export default class GameManager {

// tslint:disable-next-line: variable-name
    private static _instance: GameManager
    public static get instance(): GameManager {
        return this._instance
    }

    public promises = new Map<string, Promise<any>>()

    public state: GameState
    public store: GameStore
    public auth: Auth
    public socket: Socket

    public onEffect: (arg0: any) => void

    constructor() {
        this.state = new GameState()
        this.store = new GameStore(this.state)
        this.auth = new Auth(this.store)
        this.socket = new Socket(this.store, this.auth, this.onData)
        this.socket.open()
        GameManager._instance = this
    }

    private onData = (type: string, { error, data }) => {
        switch (type) {
        case 'game_state':
            if (error === 0) this.store.state.readData(data)
            break

        case 'play_effect':
            if (this.onEffect) {
                this.onEffect(data)
            }
            break

        case 'list_users':
            const pKey = 'list'
            if (this.promises[pKey]) {
                if (error !== 0) {
                    this.promises[pKey].reject()
                } else {
                    this.promises[pKey].resolve(data)
                }
                delete this.promises[pKey]
            }
            break

        case 'chat_message':
            this.store.chatLog.addEntry(data)
            break
        }
    }

    public destroy() {
        this.socket.destroy()
    }

    public send(msg: string) {
        this.socket.send('chat_message', {
            content: msg
        })
    }

    public getUserList(): Promise<any> {
        const pKey = 'list'
        if (!this.promises[pKey]) {
            const newP: any = {}
            this.socket.send('list_users')
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            this.promises[pKey] = newP
        }
        return this.promises[pKey].p
    }

    public playerMove(direction: string) {
        this.socket.send('game_action', {
            type: 'move', params: { direction }
        })
    }

    public playerSetFacing(direction: string) {
        this.socket.send('game_action', {
            type: 'face', params: { direction }
        })
    }

    public playerEquipItem(id: number) {
        this.socket.send('game_action', {
            type: 'equip_item', params: { id }
        })
    }

    public playerUnquipItem(slot: string) {
        this.socket.send('game_action', {
            type: 'unequip_item', params: { slot }
        })
    }

    public playerDropItem(id: number) {
        this.socket.send('game_action', {
            type: 'drop_item', params: { id }
        })
    }

    public playerTakeItem(id: number) {
        this.socket.send('game_action', {
            type: 'take_item', params: { id }
        })
    }

    public playerAttack(id: number) {
        this.socket.send('game_action', {
            type: 'attack', params: { mode: 'melee', id }
        })
    }

    public playerSpell(spell: string, x: number, y: number) {
        this.socket.send('game_action', {
            type: 'attack', params: { mode: 'spell', spell, x, y }
        })
    }

    public playerUse(id: number) {
        this.socket.send('game_action', {
            type: 'use', params: { id }
        })
    }

    public editAction(params: any) {
        this.socket.send('game_edit', {
            type: 'edit', params
        })
    }

    public toggleEdit(on: boolean) {
        this.socket.send('game_edit', {
            type: 'edit',
            params: {
                type: on ? 'enable' : 'disable'
            }
        })
    }

}
