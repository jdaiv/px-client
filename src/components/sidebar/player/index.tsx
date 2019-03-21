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
        let health = []
        const stats = []
        const equipped = []
        const bag = []
        const skills = []

        const gs = game.state
        const player = game.state.activePlayer

        if (player) {
            level = player.level
            health = [
                <StatBar label="HP" min={player.hp} max={player.maxHP} />,
                <StatBar label="AP" min={player.ap} max={player.maxAP} />
            ]
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
            for (const key in player.skills) {
                const s = player.skills[key]
                skills.push(
                    <StatBar label={`L${s.level} ${key}`} min={s.xp} max={100} small={true} />)
            }
        }

        const combatInfo = []
        if (gs.combatInfo && gs.combatInfo.inCombat) {
            const ci = gs.combatInfo
            combatInfo.push(<h2>combat!</h2>)
            combatInfo.push(<p class={style.invItem}>in combat: {ci.inCombat.toString()}</p>)
            combatInfo.push(<p class={style.invItem}>waiting: {ci.waiting.toString()}</p>)
            combatInfo.push(<p class={style.invItem}>turn: {ci.turn}</p>)
            combatInfo.push(<p class={style.invItem}>combatants:</p>)
            ci.combatants.forEach((c, i) => {
                const actor = c.isPlayer ?  gs.players.get(c.id) : gs.npcs.get(c.id)
                if (!actor) return
                combatInfo.push(<p class={style.invItem}>({i === ci.current ? '+' : ' '}) {actor.name} - {c.timer}</p>)
            })
        }

        return (
            <div>
                <h2 class={style.heading}>player: {game.user.username}</h2>
                <p>level {level} player</p>
                {health}
                <ToggleSection title="stats">{stats}</ToggleSection>
                <ToggleSection title="equipped" open={true}>{equipped}</ToggleSection>
                <ToggleSection title="bag">{bag}</ToggleSection>
                <ToggleSection title="skills">{skills}</ToggleSection>
                {combatInfo}
            </div>
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
        const classes = []
        if (!isNaN(item.quality) && item.quality >= 1 && item.quality <= 6) {
            classes.push(style['quality' + Math.floor(item.quality)])
        }

        const stats = [<li>quality: {item.quality}</li>, <li>value: {item.price || '0'}g</li>]
        if (item.stats && Object.keys(item.stats).length > 0) {
            stats.push(<li><em>- stats -</em></li>)
            for (const stat in item.stats) {
                stats.push(<li>&nbsp;&nbsp;{stat}: {item.stats[stat]}</li>)
            }
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
                {item.type !== 'empty' && this.statsVisible ? <ul class={style.stats}>{stats}</ul> : null}
                <p>
                    {item.key ? `${item.key}: ` : ''}
                    <ItemLabel item={item} />
                </p>
                {actions}
            </div>
        )
    }
}
