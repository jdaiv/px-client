import { Component, h } from 'preact'
import DefSelect from './DefSelect';
import style from './style.css'

export default class EditField extends Component<{ label: string, name: string, type: string, value: string }> {

    public render({ label, name, type, value }) {
        let inner: any
        switch (type) {
            case 'string':
                inner = (
                    <input
                        autocomplete="off"
                        name={name}
                        value={value}
                    />
                )
                break
            case 'int':
            case 'number':
                inner = (
                    <input
                        type="number"
                        autocomplete="off"
                        name={name}
                        value={value}
                    />
                )
                break
            case 'zone':
            case 'npc':
            case 'entity':
            case 'item':
            case 'item_mod':
            case 'slot':
                inner = <DefSelect name={name} type={type} value={value} />
                break
        }
        return (
            <div class={style.input}>
                <label>{label}:</label>
                {inner}
            </div>
        )
    }
}
