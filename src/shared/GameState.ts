import { action, IObservableArray, observable, ObservableMap } from 'mobx'

type Listener = (arg0: GameState, zoneChanged: boolean, mapChanged: boolean) => void

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
    private oldTiles: number[][]
    private mapChanged = false
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
        this.listeners.forEach(x => x(this, this.zoneName !== this.oldZoneName, this.mapChanged))
        this.oldZoneName = data.zone.name
        this.mapChanged = false
    }

    public setTiles(map: any) {
        let mapMinX = 0
        let mapMaxX = 0
        let mapMinY = 0
        let mapMaxY = 0

        map.forEach(t => {
            const x = t.x
            const y = t.y
            if (x < mapMinX) {
                mapMinX = x
            }
            if (x > mapMaxX) {
                mapMaxX = x
            }
            if (y < mapMinY) {
                mapMinY = y
            }
            if (y > mapMaxY) {
                mapMaxY = y
            }
        })

        // if the map size has changed everything is invalid
        const newTiles: number[][] = []
        for (let x = mapMinX; x <= mapMaxX; x++) {
            newTiles[x] = new Array<number>()
            for (let y = mapMinY; y <= mapMaxY; y++) {
                newTiles[x][y] = -1
            }
        }
        map.forEach(t => {
            newTiles[t.x][t.y] = t.id
        })

        if (this.mapMinX === mapMinX ||
            this.mapMaxX === mapMaxX ||
            this.mapMinY === mapMinY ||
            this.mapMaxY === mapMaxY) {

            if (this.oldTiles != null) {
                let diff = false
                for (let x = mapMinX; x <= mapMaxX; x++) {
                    for (let y = mapMinY; y <= mapMaxY; y++) {
                        if (newTiles[x][y] !== this.oldTiles[x][y]) {
                            diff = true
                            break
                        }
                    }
                    if (diff) break
                }
                if (!diff) return
            }
        }

        this.oldTiles = newTiles

        this.mapMinX = mapMinX
        this.mapMaxX = mapMaxX
        this.mapMinY = mapMinY
        this.mapMaxY = mapMaxY

        this.tiles.replace(map)
        this.mapChanged = true
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
