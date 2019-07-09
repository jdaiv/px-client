import { observable } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import ItemLabel from '../../shared/ItemLabel'
import StatBar from '../../shared/StatBar'
import ToggleSection from '../../shared/ToggleSection'
import style from './style.css'

@inject('game')
@observer
export default class Player extends Component<{ game?: GameStore }> {
    public render({ game }) {
        let level: number
        const stats = []
        const equipped = []
        const bag = []
        const spells = []

        const gs = game.state
        const player = game.state.activePlayer

        if (player) {
            level = player.level
            for (const key in player.stats) {
                if (player.stats[key] > 0)
                    stats.push(<p class={style.invItem}>{key}: {player.stats[key]}</p>)
            }
            for (const key in player.slots) {
                equipped.push(
                    <Gear item={{ ...player.slots[key], key, equipped: true }} />)
            }
            for (const key in player.inventory) {
                bag.push(
                    <Gear item={{ ...player.inventory[key], bag: true }} />)
            }
            const activeSpell = gs.combat.activeSpell
            for (const key in player.spells) {
                const s = player.spells[key]
                spells.push(<Spell id={key} spell={s} inCombat={gs.inCombat} activeSpell={activeSpell} />)
            }
        }

        return(
            <div>
                <h2 class={style.heading}>player: {game.user.username}</h2>
                <p>level {level} player</p>
                <ToggleSection title="stats">{stats}</ToggleSection>
                <ToggleSection title="equipped" open={true}>{equipped}</ToggleSection>
                <ToggleSection title="bag">{bag}</ToggleSection>
            </div >
        )
    }
}

@observer
class Gear extends Component<{ item: any }> {
    private equip = () => GameManager.instance.playerEquipItem(this.props.item.id)
    private unequip = () => GameManager.instance.playerUnquipItem(this.props.item.key)
    private drop = () => GameManager.instance.playerDropItem(this.props.item.id)
    private use = () => GameManager.instance.playerEquipItem(this.props.item.id)

    @observable public statsVisible = false

    private showStats = () => {
        this.statsVisible = true
    }

    private hideStats = () => {
        this.statsVisible = false
    }

    public render({ item }) {
        const stats = []
        if (item.stats && Object.keys(item.stats).length > 0) {
            stats.push(<li><em>- stats -</em></li>)
            for (const stat in item.stats) {
                if (item.stats[stat] !== 0) {
                    stats.push(<li>&nbsp;&nbsp;{stat}: {item.stats[stat]}</li>)
                }
            }
        }
        let hover = null
        if (item.type !== 'empty' && this.statsVisible) {
            const box = this.base.getBoundingClientRect()
            hover = (
                <ul
                    class={style.stats}
                    style={`transform: translate(${box.left}px, ${box.bottom + 4}px)`}
                >
                    <li>quality: {item.quality}</li>
                    <li>value: {item.price || '0'}g</li>
                    {stats}
                </ul>
            )
        }
        if (item.specials && Object.keys(item.specials).length > 0) {
            stats.push(<li><em>- special -</em></li>)
            for (const s in item.specials) {
                stats.push(<li>&nbsp;&nbsp;{item.specials[s]}</li>)
            }
        }

        const actions = []
        if (item.equipped && item.type !== 'empty') {
            actions.push(<button class={style.invAction} onClick={this.unequip}>unequip</button>)
        } else if (item.bag) {
            actions.push(<button class={style.invAction} onClick={this.equip}>equip</button>)
            actions.push(<button class={style.invAction} onClick={this.drop}>drop</button>)
        }
        if (Array.isArray(item.specials) && item.specials.includes('consumable')) {
            actions.push(<button class={style.invAction} onClick={this.use}>use</button>)
        }
        return (
            <div class={style.invItem} onMouseOver={this.showStats} onMouseOut={this.hideStats}>
                {hover}
                <p>
                    {item.key ? `${item.key}: ` : ''}
                    <ItemLabel item={item} />
                </p>
                {actions}
            </div>
        )
    }
}

@observer
class Spell extends Component<{ id: string, spell: any, inCombat: boolean, activeSpell: string }> {
    private use = () => {
        GameManager.instance.state.combat.casting = true
        GameManager.instance.state.combat.activeSpell = this.props.id
    }

    private stop = () => {
        GameManager.instance.state.combat.casting = false
        GameManager.instance.state.combat.activeSpell = ''
    }

    @observable public statsVisible = false

    private showStats = () => {
        this.statsVisible = true
    }

    private hideStats = () => {
        this.statsVisible = false
    }

    public render({ id, spell, inCombat, activeSpell }) {
        let hover = null
        if (this.statsVisible) {
            const box = this.base.getBoundingClientRect()
            hover = (
                <ul
                    class={style.stats}
                    style={`transform: translate(${box.left}px, ${box.bottom + 4}px)`}
                >
                    <li>skill: {spell.skill}</li>
                </ul>
            )
        }

        const actions = []
        if (inCombat) {
            if (activeSpell === id) {
                actions.push(<button class={style.invAction} onClick={this.stop}>stop casting</button>)
            } else {
                actions.push(<button class={style.invAction} onClick={this.use}>cast</button>)
            }
        }
        return (
            <div class={style.invItem} onMouseOver={this.showStats} onMouseOut={this.hideStats}>
                {hover}
                <p>
                    L{spell.level} {spell.name}
                </p>
                {actions}
            </div>
        )
    }
}
