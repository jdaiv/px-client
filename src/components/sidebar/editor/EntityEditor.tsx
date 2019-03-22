import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import Button from '../../shared/Button'
import baseStyle from '../style.css'
import EditField from './EditField'
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
        [].forEach.call(form.querySelectorAll('input, select'), el => {
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
            const ent = game.state.zoneDebug.entities[game.editor.selectedEntity]
            const type = game.state.definitions.Entities[ent.type]
            const fields = []
            if (type.Fields && Array.isArray(type.Fields)) {
                fields.push(<h3>fields</h3>)
                type.Fields.forEach(f => {
                    fields.push((
                        <EditField
                            label={f.Name}
                            name={`f_${f.Name}`}
                            type={f.Type}
                            value={ent.fields[f.Name]}
                        />
                    ))
                })
            }
            inner = (
                <form onSubmit={this.saveEnt}>
                    <p>id: {ent.id}</p>
                    <p>type: {ent.type}</p>
                    <EditField label="name" name="name" type="string" value={ent.name} />
                    <EditField label="x" name="x" type="int" value={ent.x} />
                    <EditField label="y" name="y" type="int" value={ent.y} />
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
