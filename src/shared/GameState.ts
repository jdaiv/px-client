import { vec3 } from 'gl-matrix'
import { action, IObservableArray, observable, ObservableMap } from 'mobx'

type Listener = (arg0: GameState, zoneChanged: boolean) => void

export default class GameState {

    @observable public valid = false
    @observable.shallow public activePlayer: any
    @observable.shallow public combatInfo: any
    @observable.shallow public definitions: any
    @observable.shallow public zoneDebug: any
    @observable.shallow public allZones: any

    public entities: ObservableMap<number, any>
    public players: ObservableMap<number, any>
    public items: ObservableMap<number, any>
    public npcs: ObservableMap<number, any>
    public tiles: IObservableArray<any>
    private oldZoneName = ''
    @observable public zoneName = ''
    @observable public mapMinX = 0
    @observable public mapMaxX = 0
    @observable public mapMinY = 0
    @observable public mapMaxY = 0

    private listeners = new Array<Listener>()

    constructor() {
        this.entities = observable.map(null, { deep: false })
        this.players = observable.map(null, { deep: false })
        this.items = observable.map(null, { deep: false })
        this.npcs = observable.map(null, { deep: false })
        this.tiles = observable.array(null, { deep: false })
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
        this.combatInfo = data.zone.combatInfo
        this.definitions = data.defs
        this.zoneDebug = data.debugZone
        this.allZones = data.allZones
        this.listeners.forEach(x => x(this, this.zoneName !== this.oldZoneName))
        this.oldZoneName = data.zone.name
    }

    public setTiles(map: any) {
        const newTiles = []

        this.mapMinX = 0
        this.mapMaxX = 0
        this.mapMinY = 0
        this.mapMaxY = 0

        for (const key in map) {
            const t = map[key]
            const coords = key.split(',')
            const x = Math.floor(parseInt(coords[0], 10))
            const y = Math.floor(parseInt(coords[1], 10))
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
            newTiles.push({
                type: t.id,
                position: vec3.fromValues(x, 1, y)
            })
        }
        this.tiles.replace(newTiles)
    }

    public set(activePlayer: any, players: any, ents: any, items: any, npcs: any) {
        const readInto = (source: any[], dest: ObservableMap<number, any>) => {
            dest.replace(source.map((x: any) => [x.id, x]))
        }

        this.activePlayer = activePlayer
        readInto(players, this.players)
        readInto(ents, this.entities)
        readInto(items, this.items)
        readInto(npcs, this.npcs)
    }

}
