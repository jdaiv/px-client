import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../shared/GameStore'
import Button from '../shared/Button'
import style from './style.css'

// import style from './style.css'

@observer
export default class ActionBar extends Component {

    public render() {
        return (
            <div class={style.bar}>
                use:&nbsp;
                <UseBtn slot="empty" />
                <UseBtn slot="rhand" />
                <UseBtn slot="lhand" />
                &nbsp;skills:&nbsp;
                <SkillBtn skill="empty" />
                <SkillBtn skill="empty" />
                <SkillBtn skill="empty" />
            </div>
        )
    }

}

@inject('game')
@observer
class UseBtn extends Component<{ game?: GameStore; slot: string }> {
    public setSlot = () => {
        this.props.game.activeUseSlot = this.props.slot
    }

    public render({ game, slot }) {
        return (
            <Button
                onClick={this.setSlot}
                class={'button ' + (game.activeUseSlot === slot ? 'active' : '')}
                label={slot} />
        )
    }
}

@observer
class SkillBtn extends Component<{ skill: string }> {
    public render({ skill }) {
        return (
            <Button label={skill} />
        )
    }
}
