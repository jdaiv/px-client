/* eslint-disable react/prefer-stateless-function */
import { h, render, Component } from 'preact'
import { vec3 } from 'gl-matrix'

import './overlayStyle'
import EventManager from '../services/EventManager'
import { TILE_SIZE } from './stages/Tiles'
import Services from '../services'

export default class Overlay {

    constructor (el) {
        this.points = new Map()
        this.positions = new Map()
        this.playerPositions = new Map()
        this.elements = []
        this.elementsMap = new Map()

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)

        this.base = el
        this.el = document.createElement('div')
        this.el.className = 'overlay'
        el.appendChild(this.el)

        EventManager.subscribe('ws/game_state', 'overlay', this.update)

        console.log('[engine/overlay] initialised')
    }

    resize () {
        console.log('[engine/overlay] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = this.el.width = Math.floor(box.width)
            this.height = this.el.height = Math.floor(box.height)
            this.width_2 = this.width / 2
            this.height_2 = this.height / 2
            this.el.style.width = this.width + 'px'
            this.el.style.height = this.height + 'px'
        })
    }

    destroy () {
        window.removeEventListener('resize', this.resize)
        this.el.remove()
        console.log('[engine/overlay] destroyed')
    }

    getOrCreatePoint (id, position) {
        let p = this.points.get(id)
        if (!p) {
            p = {}
            this.points.set(id, p)
        }
        p.active = true
        p.targetPosition = position
        return p
    }

    getOrCreateElement (id) {
        let el = this.elementsMap.get(id)
        if (!el) {
            this.elements.forEach((e, i) => {
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

    setPlayerPos (id, position) {
        this.playerPositions.set('p' + id, position)
    }

    addDamage (position, amt, effect) {
        const _p = position.join(',')
        if (!this.damagePoints.has(_p)) this.damagePoints.set(_p, [])
        this.damagePoints.get(_p).push({ amt, effect, timer: 0 })
    }

    compare (a, b) {
        if ((!a && b) || (a && !b)) return true
        let changed = false
        Object.keys(a).forEach(key => {
            changed = changed || a[key] != b[key]
        })
        return changed
    }

    update = ({ data }) => {
        this.points.forEach(p => p.active = false)

        this.player = data.player
        this.players = data.zone.players
        this.entities = data.zone.entities
        this.items = data.zone.items
        this.npcs = data.zone.npcs

        for (let id in this.players) {
            const key = 'p' + id
            const p = this.players[id]
            const point = this.getOrCreatePoint(key, [p.x * TILE_SIZE, 24, p.y * TILE_SIZE])
            point.changed = this.compare(point.player, p)
            point.player = p
        }
        this.entities.forEach(e => {
            const key = 'e' + e.id
            let offset
            switch (e.type) {
            case 'sign':
            case 'dummy':
                offset = 8
                break
            case 'door':
                offset = 12
                break
            default:
                offset = 0
            }
            const point = this.getOrCreatePoint(key, [e.x * TILE_SIZE, offset, e.y * TILE_SIZE])
            point.changed = this.compare(point.entity, e)
            point.entity = e
        })
        for (let id in this.items) {
            const key = 'i' + id
            const i = this.items[id]
            const point = this.getOrCreatePoint(key, [i.x * TILE_SIZE, 4, i.y * TILE_SIZE])
            point.changed = this.compare(point.item, i)
            point.item = i
        }
        for (let id in this.npcs) {
            const key = 'n' + id
            const n = this.npcs[id]
            const point = this.getOrCreatePoint(key, [n.x * TILE_SIZE, 10, n.y * TILE_SIZE])
            point.changed = this.compare(point.npc, n)
            point.npc = n
        }
    }

    createElement () {
        const container = document.createElement('div')
        container.className = 'point'
        this.el.appendChild(container)
        return container
    }

    createNewPoints () {
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

    transformPosition (pos) {
        let _pos = vec3.clone(pos)
        _pos = vec3.transformMat4(_pos, _pos, this.matrix)
        _pos[0] = _pos[0] * this.width * 0.5 + this.width_2
        _pos[1] = _pos[1] * -this.height * 0.5 + this.height_2
        return _pos
    }

    updatePointPositions (dt) {
        this.points.forEach((p, id) => {
            if (!p.el) return
            const c = p.el.container

            if (p.changed || c.changed) {
                const type = id.slice(0, 1)
                switch (type) {
                case 'p':
                    render(<Nametag player={p.player} />, c, c.firstChild)
                    break
                case 'n':
                    render(<Nametag player={p.npc} />, c, c.firstChild)
                    break
                case 'e':
                    render(<Entity entity={p.entity} player={this.player} />, c, c.firstChild)
                    break
                case 'i':
                    render(<Item item={p.item} player={this.player} />, c, c.firstChild)
                    break
                }

                p.el.rect = c.getBoundingClientRect()
                p.changed = false
                c.changed = false
            }

            const current = p.currentPosition
            const _pos = p.player ? this.playerPositions.get(id) : p.targetPosition
            const target = this.transformPosition(_pos)

            const rect = p.el.rect
            if (rect) {
                target[0] -= rect.width / 2
                target[1] -= rect.height / 2
            }
            target[2] = _pos[1]

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

    run (dt) {
        this.createNewPoints()
        this.updatePointPositions(dt)
    }

}

class Nametag extends Component {
    render ({ player }) {
        return (
            <div class="pointInner">
                <p>
                    { player.name }<br />
                    L0 { player.hp } / { player.maxHP }
                </p>
            </div>
        )
    }
}

class Entity extends Component {
    click = () => {
        Services.socket.send('game_action', {
            type: 'use',
            params: {
                id: this.props.entity.id
            }
        })
    }

    render ({ entity, player }) {
        let classes = ['pointInner']

        if (Math.abs(player.x - entity.x) > 1 || Math.abs(player.y - entity.y) > 1) {
            classes.push('hide')
        }

        if (!entity.usable) {
            return <div class={classes.join(' ')}><p>{ entity.name }</p></div>
        }

        return (
            <div class={classes.join(' ')}>
                <button class="useBtn" onClick={this.click}><em>{ entity.useText }</em> { entity.name }</button>
            </div>
        )
    }
}

class Item extends Component {
    click = () => {
        Services.socket.send('game_action', {
            type: 'take_item',
            params: {
                id: this.props.item.id
            }
        })
    }

    render ({ item, player }) {
        let classes = ['pointInner']

        if (Math.abs(player.x - item.x) > 1 || Math.abs(player.y - item.y) > 1) {
            classes.push('hide')
        }

        return (
            <div class={classes.join(' ')}>
                <button class="useBtn" onClick={this.click}><em>take</em> { item.name }</button>
            </div>
        )
    }
}