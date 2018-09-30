import { h, Component } from 'preact'

import style from './style'

let RAINBOWS = (d) => {

    let self = this
    self.name = 'RAINBOWS'
    self.d = d

    let t = 0
    let _dt = 0
    self.loop = (dt) => {
        t += dt * 1000
        color_increment(dt * 1000)
        _dt = dt
    }

    self.draw = () => {
        let width = d.width
        let height = d.height
        let width_2 = width / 2
        let height_2 = height / 2

        // d.clear()

        let steps = 10
        let __dt = _dt / steps
        let _t = t
        for (let i = 0; i < steps; i++) {
            t += __dt
            let x_offset = Math.sin(_t / 200) * 20
            let y_offset = Math.cos(_t / 400) * 20
            // let scale = 1 - (0.012 + Math.cos(_t / 1000) * 0.01) / steps
            let scale = 1 - (0.05 / steps)
            let rotation =  Math.sin(_t / 400) * (0.1 / steps)
            d.ctx.save()
            d.ctx.translate(width_2 + x_offset, height_2 + y_offset)
            d.ctx.rotate(rotation)
            d.ctx.scale(scale, scale)
            d.ctx.drawImage(d.canvas, -width_2 - x_offset, -height_2 - y_offset)
            d.ctx.restore()
        }

        let x_pos = 0
        let box_size = 2

        color_set_fill(1, 0.5)
        d.ctx.fillRect(x_pos, 0, width, box_size)
        d.ctx.fillRect(0, x_pos, box_size, height)
        color_set_fill_i(1, 0.5)
        d.ctx.fillRect(x_pos, height - box_size, width, box_size)
        d.ctx.fillRect(width - box_size , x_pos, box_size, height)

        // d.text_color('#000')
        // let text_x = Math.round(Math.sin(t / 800) * width_2 / 2) + width_2 - 32
        // let text_y = height - Math.round(Math.abs(Math.sin(t / 260)) * 50)
        // d.text('RAINBOWS', text_x - 1, text_y - 16)
        // d.text('RAINBOWS', text_x + 1, text_y - 16)
        // d.text('RAINBOWS', text_x, text_y - 17)
        // d.text('RAINBOWS', text_x, text_y - 15)
        // d.text_color(color_str((color_current) % 360, 1, 0.5))
        // d.text('RAINBOWS', text_x, text_y - 16)
    }

    let color_current = 0

    let color_increment = (dt) => {
        color_current = (color_current + dt / 10) % 360
    }

    let color_str = (h, s, l) => {
        return 'hsl(' + Math.floor(h) + ',' + s * 100 + '%,' + l * 100 + '%)'
    }

    let color_set_fill = (s, l) => {
        d.ctx.fillStyle = color_str(color_current, s, l)
    }

    let color_set_fill_i = (s, l) => {
        d.ctx.fillStyle = color_str((color_current + 180) % 360, s, l)
    }

    return self
}

export default class ContentPortal extends Component {

    state = {
        active: true
    }

    loop = (t) => {
        // this.raf = window.requestAnimationFrame(this.loop)
        // if (this.time < 0) {
        //     this.time = t
        //     return
        // }

        // this.dt = (t - this.time) / 1000
        // this.time = t
        // this.rainbows.loop(this.dt)
        // this.rainbows.draw()
    }

    componentDidMount() {
        // this.canvas = document.createElement('canvas')
        // this.base.appendChild(this.canvas)

        // const box = this.base.getBoundingClientRect()
        // this.width = this.canvas.width = Math.floor(box.width / 4)
        // this.height = this.canvas.height = Math.floor(box.height / 4)

        // this.ctx = this.canvas.getContext('2d')
        // this.rainbows = new RAINBOWS(this)
        // this.time = -1
        // this.raf = window.requestAnimationFrame(this.loop)
    }

    shouldComponentUpdate() {
        return false
    }

    componentWillUnmount() {
        // window.cancelAnimationFrame(this.raf)
    }

    render() {
        return (
            <div class={style.portal} />
        )
    }

}