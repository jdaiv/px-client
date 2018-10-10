export default class Canvas {
    constructor (el) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        setTimeout(() => {
            const box = el.getBoundingClientRect()
            this.width = this.el.width = Math.floor(box.width)
            this.height = this.el.height = Math.floor(box.height)
        }, 100)

        this.ctx = this.el.getContext('2d')
    }
}