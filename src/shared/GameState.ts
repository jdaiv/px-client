import { action, IObservableArray, observable, ObservableMap } from 'mobx'

type Listener = (arg0: GameState, zoneChanged: boolean) => void

class Combat {
    @observable public enabled = false
    @observable public casting = false
    @observable public activeSpell = ''
}

export default class GameState {

    public combat = new Combat()

    @observable public valid = false
    @observable.shallow public activePlayer: any
    @observable.shallow public definitions: any
    @observable.shallow public zoneDebug: any
    @observable.shallow public allZones: any

    public entities: Map<number, any>
    public players: ObservableMap<number, any>
    public items: Map<number, any>
    public npcs: Map<number, any>
    public tiles: IObservableArray<any>
    private oldZoneName = ''
    @observable public zoneName = ''
    @observable public mapMinX = 0
    @observable public mapMaxX = 0
    @observable public mapMinY = 0
    @observable public mapMaxY = 0

    @observable public inCombat = false
    @observable public currentInitiative = 0
    public combatants: IObservableArray<any>

    private listeners = new Array<Listener>()

    constructor() {
        this.entities = new Map()
        this.players = observable.map(null, { deep: false })
        this.items = new Map()
        this.npcs = new Map()
        this.tiles = observable.array(null, { deep: false })
        this.combatants = observable.array(null, { deep: false })
    }

    public registerListener(fn: Listener) {
        this.listeners.push(fn)
    }

    @action
    public readData(data: any) {
        this.zoneName = data.zone.name
        this.setTiles(data.zone.map)
        this.set(data.player,
            data.zone.players,
            data.zone.entities,
            data.zone.items,
            data.zone.npcs)
        this.valid = true
        this.inCombat = data.zone.inCombat
        this.currentInitiative = data.zone.currentInitiative
        this.combatants = data.zone.combatants
        this.combatants.sort((a, b) => b.initiative - a.initiative)
        this.definitions = data.defs
        this.zoneDebug = data.debugZone
        this.allZones = data.allZones
        this.listeners.forEach(x => x(this, this.zoneName !== this.oldZoneName))
        this.oldZoneName = data.zone.name
    }

    public setTiles(map: any) {
        this.mapMinX = 0
        this.mapMaxX = 0
        this.mapMinY = 0
        this.mapMaxY = 0

        map.forEach(t => {
            const x = t.x
            const y = t.y
            if (x < this.mapMinX) {
                this.mapMinX = x
            }
            if (x > this.mapMaxX) {
                this.mapMaxX = x
            }
            if (y < this.mapMinY) {
                this.mapMinY = y
            }
            if (y > this.mapMaxY) {
                this.mapMaxY = y
            }
        })
        this.tiles.replace(map)
    }

    public set(activePlayer: any, players: any, ents: any, items: any, npcs: any) {
        const readInto = (source: any[], dest: ObservableMap<number, any>) => {
            dest.replace(source.map((x: any) => [x.id, x]))
        }

        this.activePlayer = activePlayer
        readInto(players, this.players)
        this.entities = new Map(ents.map((x: any) => [x.id, x]))
        this.items = new Map(items.map((x: any) => [x.id, x]))
        this.npcs = new Map(npcs.map((x: any) => [x.id, x]))
    }

}
