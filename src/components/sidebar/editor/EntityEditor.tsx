import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import Button from '../../shared/Button'
import baseStyle from '../style.css'
import style from './style.css'

@inject('game')
@observer
export default class EntityEditor extends Component<{ game?: GameStore }> {

    private setEnt = (evt: Event) => {
        this.props.game.editor.activeEntity = (evt.currentTarget as HTMLInputElement).value
    }

    private saveEnt = (evt: Event) => {
        evt.preventDefault()
        const form = evt.currentTarget as HTMLFormElement
        const values = {};
        [].forEach.call(form.querySelectorAll('input'), el => {
            const num = parseInt(el.value, 10)
            values[el.name] = isNaN(num) ? el.value : num
        })
        GameManager.instance.editAction({
            type: 'entity_edit',
            ent: this.props.game.editor.selectedEntity,
            ...values
        })
    }

    private deleteEnt = (evt: Event) => {
        evt.preventDefault()
        GameManager.instance.editAction({
            type: 'entity_delete',
            ent: this.props.game.editor.selectedEntity,
        })
    }

    public render({ game }) {
        let inner: any

        if (game.state.entities.has(game.editor.selectedEntity)) {
            const ent = game.state.entities.get(game.editor.selectedEntity)
            const type = game.state.definitions.Entities[ent.type]
            const fields = []
            if (type.Fields && Array.isArray(type.Fields)) {
                fields.push(<h3>fields</h3>)
                type.Fields.forEach(f => {
                    fields.push((
                        <div class={style.input}>
                            <label>{f.Name}:</label>
                            <input autocomplete="off" name={`f_${f.Name}`} value={ent.fields[f.Name]} />
                        </div>
                    ))
                })
            }
            inner = (
                <form onSubmit={this.saveEnt}>
                    <p>id: {ent.id}</p>
                    <p>type: {ent.type}</p>
                    <div class={style.input}>
                        <label>name:</label>
                        <input autocomplete="off" name="name" value={ent.name} />
                    </div>
                    <div class={style.input}>
                        <label>x:</label>
                        <input autocomplete="off" name="x" value={ent.x} />
                    </div>
                    <div class={style.input}>
                        <label>y:</label>
                        <input autocomplete="off" name="y" value={ent.y} />
                    </div>
                    {fields}
                    <hr class={baseStyle.hr} />
                    <Button label="save" submit={true} large={true} />
                    <Button label="delete" submit={false} large={true} onClick={this.deleteEnt} />
                </form>
            )
        } else {
            const types = []
            for (const key in game.state.definitions.Entities) {
                types.push(<option>{key}</option>)
            }
            inner = (
                <select onChange={this.setEnt}>
                    {types}
                </select>
            )
        }

        return (
            <div>
                <h3>entity</h3>
                {inner}
            </div>
        )
    }

}
