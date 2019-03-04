import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import style from './style'

@inject('ui')
@observer
export default class ActionBar extends Component {

    render ({ ui }) {
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

@inject('ui')
@observer
class UseBtn extends Component {
    setSlot = () => {
        this.props.ui.activeUseSlot = this.props.slot
    }

    render({ ui, slot }) {
        return (
            <button onClick={this.setSlot} class={'button ' + (ui.activeUseSlot == slot ? 'active' : '')}>{ slot }</button>
        )
    }
}

@inject('ui')
@observer
class SkillBtn extends Component {
    render({ ui, skill }) {
        return (
            <button class="button">{ skill }</button>
        )
    }
}