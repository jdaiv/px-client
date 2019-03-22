import { mat4, vec3 } from 'gl-matrix'
import { Component, h, render } from 'preact'
import GameManager from '../shared/GameManager'
import GameState from '../shared/GameState'
import style from './Overlay.css'
import { TILE_SIZE } from './stages/Tiles'

export default class Overlay {

    private width: number
    private height: number
    private widthHalf: number
    private heightHalf: number

    private base: Element
    private el: HTMLElement

    private points: Map<string, any>
    private elements: any[]
    private elementsMap: Map<string, any>

    private player: any

    public matrix: mat4
    public playerPositions: Map<string, any>

    constructor(el: HTMLElement) {
        this.points = new Map()
        this.playerPositions = new Map()
        this.elements = []
        this.elementsMap = new Map()

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)

        this.base = el
        this.el = document.createElement('div')
        this.el.className = style.overlay
        el.appendChild(this.el)

        GameManager.instance.state.registerListener(this.update)

        console.log('[engine/overlay] initialised')
    }

    public resize() {
        console.log('[engine/overlay] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = Math.floor(box.width)
            this.height = Math.floor(box.height)
            this.widthHalf = this.width / 2
            this.heightHalf = this.height / 2
            this.el.style.width = this.width + 'px'
            this.el.style.height = this.height + 'px'
        })
    }

    public destroy() {
        window.removeEventListener('resize', this.resize)
        this.el.remove()
        console.log('[engine/overlay] destroyed')
    }

    public getOrCreatePoint(id) {
        let p = this.points.get(id)
        if (!p) {
            p = {}
            this.points.set(id, p)
        }
        p.active = true
        return p
    }

    public getOrCreateElement(id: string) {
        let el = this.elementsMap.get(id)
        if (!el) {
            this.elements.forEach(e => {
                if (!e.active) {
                    el = e
                }
            })
            if (!el) {
                el = {
                    active: false,
                    container: this.createElement()
                }
                this.elements.push(el)
            }
            this.elementsMap.set(id, el)
        }
        el.changed = !el.active
        el.active = true
        el.id = id
        return el
    }

    public setPlayerPos(id: number, position: vec3 | number[]) {
        this.playerPositions.set('p' + id, position)
    }

    // public addDamage(position, amt, effect) {
    //     const _p = position.join(',')
    //     if (!this.damagePoints.has(_p)) this.damagePoints.set(_p, [])
    //     this.damagePoints.get(_p).push({ amt, effect, timer: 0 })
    // }

    public compare(a: any, b: any) {
        if ((!a && b) || (a && !b)) return true
        let changed = false
        Object.keys(a).forEach(key => {
            changed = changed || a[key] !== b[key]
        })
        return changed
    }

    public update = (state: GameState) => {
        this.points.forEach(p => p.active = false)
        this.player = state.activePlayer
        state.players.forEach((x, id) => {
            if (id === this.player.id) return
            const key = 'p' + id
            const point = this.getOrCreatePoint(key)
            point.player = true
            point.yOffset = 24
            point.changed = true
            point.source = x
        })
        state.entities.forEach((e, id) => {
            const key = 'e' + id
            let offset: number
            switch (e.type) {
            case 'sign':
            case 'dummy':
                offset = 8
                break
            case 'door':
                offset = 12
                break
            case 'corpse':
                offset = 4
                break
            default:
                offset = 0
            }
            const point = this.getOrCreatePoint(key)
            point.yOffset = offset
            point.changed = true
            point.source = e
        })
        state.items.forEach((x, id) => {
            const key = 'i' + id
            const point = this.getOrCreatePoint(key)
            point.yOffset = 4
            point.changed = true
            point.source = x
        })
        state.npcs.forEach((x, id) => {
            const key = 'n' + id
            const point = this.getOrCreatePoint(key)
            point.yOffset = 10
            point.changed = true
            point.source = x
        })
    }

    public createElement() {
        const container = document.createElement('div')
        container.className = style.point
        this.el.appendChild(container)
        return container
    }

    public createNewPoints() {
        this.points.forEach((p, id) => {
            const el = this.elementsMap.get(id)
            if (!p.active && el) {
                el.active = false
                this.elementsMap.delete(id)
            } else if (p.active && !el) {
                p.el = this.getOrCreateElement(id)
                p.changed = true
            }
        })
        this.elements.forEach(e => {
            e.container.style.display = e.active ? 'block' : 'none'
        })
    }

    public transformPosition(pos: vec3 | number[]) {
        let transformed = vec3.clone(pos)
        transformed = vec3.transformMat4(transformed, transformed, this.matrix)
        transformed[0] = transformed[0] * this.width * 0.5 + this.widthHalf
        transformed[1] = transformed[1] * -this.height * 0.5 + this.heightHalf
        return transformed
    }

    public updatePointPositions(dt: number) {
        this.points.forEach((p, id) => {
            if (!p.el) return
            const c = p.el.container

            if (p.changed || c.changed) {
                const type = id.slice(0, 1)
                switch (type) {
                case 'p':
                    render(<Nametag player={p.source} me={this.player} />, c, c.firstChild)
                    break
                case 'n':
                    render(<Nametag player={p.source} me={this.player} />, c, c.firstChild)
                    break
                case 'e':
                    render(<Entity entity={p.source} player={this.player} />, c, c.firstChild)
                    break
                case 'i':
                    render(<Item item={p.source} player={this.player} />, c, c.firstChild)
                    break
                }

                p.changed = false
                c.changed = false
            }

            const current = p.currentPosition
            const newTarget = p.player ? this.playerPositions.get(id) :
                [p.source.x * TILE_SIZE, p.yOffset || 0, p.source.y * TILE_SIZE]
            const target = this.transformPosition(newTarget)

            target[2] = newTarget[1]

            if (!current) {
                p.currentPosition = target
                return
            }

            vec3.lerp(p.currentPosition, current, target, dt * 20)
            c.style.left = p.currentPosition[0] + 'px'
            c.style.top = p.currentPosition[1] + 'px'
            c.style.zIndex = Math.floor(p.currentPosition[2])
        })
    }

    public run(dt: number) {
        this.createNewPoints()
        this.updatePointPositions(dt)
    }

}

class Nametag extends Component<{ player: any; me: any }> {
    public click = () => {
        if (this.props.player.alignment !== 'hostile') return
        // GameManager.instance.playerAttack(this.props.player.id)
        GameManager.instance.playerSpell('fireball', this.props.player.x, this.props.player.y)
    }

    public render({ player, me }) {
        const canAttack = player.alignment === 'hostile'
        // if (Math.abs(player.x - me.x) <= 1 && Math.abs(player.y - me.y) <= 1) {
        //     canAttack = true
        // }
        return (
            <div class={style.pointInner}>
                <button class={style.useBtn} onClick={canAttack ? this.click : null}>
                    {canAttack && player.alignment === 'hostile' ? <em>attack<br /></em> : ''}
                    {player.name} - L{player.level}<br />
                    HP {player.hp} / {player.maxHP}
                </button>
            </div>
        )
    }
}

class Entity extends Component<{ player: any; entity: any }> {
    public click = () => GameManager.instance.playerUse(this.props.entity.id)

    public render({ entity, player }) {
        const classes = [style.pointInner]

        if (Math.abs(player.x - entity.x) > 1 || Math.abs(player.y - entity.y) > 1) {
            classes.push(style.hide)
        }

        if (!entity.usable) {
            return <div class={classes.join(' ')}><p>{entity.name}</p></div>
        }

        return (
            <div class={classes.join(' ')}>
                <button class={style.useBtn} onClick={this.click}><em>{entity.useText}</em> {entity.name}</button>
            </div>
        )
    }
}

class Item extends Component<{ player: any; item: any }>  {
    public click = () => GameManager.instance.playerTakeItem(this.props.item.id)

    public render({ item, player }) {
        const classes = [style.pointInner]

        if (Math.abs(player.x - item.x) > 1 || Math.abs(player.y - item.y) > 1) {
            classes.push(style.hide)
        }

        return (
            <div class={classes.join(' ')}>
                <button class={style.useBtn} onClick={this.click}><em>take</em> {item.name}</button>
            </div>
        )
    }
}
