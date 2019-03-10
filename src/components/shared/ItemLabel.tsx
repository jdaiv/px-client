import { Component, h } from 'preact'

import style from './style.css'

export default class ItemLabel extends Component<{ item: any }> {

    public render({ ui, item }) {
        const classes = []
        if (!isNaN(item.quality) && item.quality >= 1 && item.quality <= 6) {
            classes.push(style['quality' + Math.floor(item.quality)])
        }

        let qty = ''
        if (item.qty) {
            qty = `(${item.qty}) `
        }

        return (<span>
            { qty }<span class={classes.join(' ')}>{ item.name ? `${item.name}` : 'empty' }</span>
        </span>)
    }
}
