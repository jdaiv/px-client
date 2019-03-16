import { vec3 } from 'gl-matrix'
import { action, IObservableArray, observable, ObservableMap } from 'mobx'

type Listener = (arg0: GameState) => void

export default class GameState {

    @observable public valid = false
    @observable.shallow public activePlayer: any
    @observable.shallow public combatInfo: any

    public entities: ObservableMap<number, any>
    public players: ObservableMap<number, any>
    public items: ObservableMap<number, any>
    public npcs: ObservableMap<number, any>
    public tiles: IObservableArray<any>
    @observable public mapWidth = 0
    @observable public mapHeight = 0

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
        this.setTiles(data.zone.map,
            data.zone.width,
            data.zone.height)
        this.set(data.player,
            data.zone.players,
            data.zone.entities,
            data.zone.items,
            data.zone.npcs)
        this.valid = true
        this.combatInfo = data.zone.combatInfo
        this.listeners.forEach(x => x(this))
    }

    public setTiles(map: any, width: number, height: number) {
        const newTiles = []
        map.forEach((t: any, i: number) => {
            newTiles.push({
                type: t.type,
                position: vec3.fromValues(
                    Math.floor(i % width),
                    1,
                    Math.floor(i / width),
                )
            })
        })
        this.mapWidth = width
        this.mapHeight = height
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
