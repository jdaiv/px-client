import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import UIStore from '../../stores/UIStore'

import Button from '../shared/Button';
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

@inject('ui')
@observer
class UseBtn extends Component<{ ui?: UIStore; slot: string }> {
    public setSlot = () => {
        this.props.ui.activeUseSlot = this.props.slot
    }

    public render({ ui, slot }) {
        return (
            <Button
                onClick={this.setSlot}
                class={'button ' + (ui.activeUseSlot === slot ? 'active' : '')}
                label={slot} />
        )
    }
}

@inject('ui')
@observer
class SkillBtn extends Component<{ ui?: UIStore; skill: string }> {
    public render({ ui, skill }) {
        return (
            <Button label={skill} />
        )
    }
}
