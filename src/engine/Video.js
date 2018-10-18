export default class Video {

    constructor (el) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        setTimeout(this.resize, 100)
        window.addEventListener('resize', this.resize)

        this.ctx = this.el.getContext('2d')
        // this.ctx.imageSmoothingEnabled = false
        this.queue = []
        console.log('[engine/video] initialised')
    }

    resize = () => {
        const box = this.el.getBoundingClientRect()
        this.width = this.el.width = Math.floor(box.width / 2)
        this.height = this.el.height = Math.floor(box.height / 2)
    }

    destroy () {
        window.removeEventListener('resize', this.resize)
        this.el.remove()
        console.log('[engine/video] destroyed')
    }

    clear () {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    fillBox (color, x, y, w, h) {
        this.queue.push(['2d', 'rect', x, y, w, h, color])
    }

    drawImage (img, x, y, z, frame = 0) {
        this.queue.push(['3d', 'img', x, y, z, img, frame])
    }

    run () {
        this.queue.filter(q => q[0] == '3d').sort((a, b) => {
            if (a[3] > b[3]) return 1
            if (a[3] < b[3]) return -1

            if (a[3] == b[3]) {

                if (a[2] < b[2]) return 1
                if (a[2] > b[2]) return -1

                if (a[4] > b[4]) return 1
                if (a[4] < b[4]) return -1

            } else {

                if (a[4] > b[4]) return 1
                if (a[4] < b[4]) return -1

                if (a[2] < b[2]) return 1
                if (a[2] > b[2]) return -1

            }

            return 0
        }).forEach(q => {
            const img = q[5]
            const d = q[4] - img.dim.d / 2
            const x = Math.round(q[2] - img.dim.w / 2 + d)
            const y = Math.round((0 - q[3]) - img.dim.h + d)
            const frame = q[6]
            if (img.frames > 1) {
                this.ctx.drawImage(
                    img.el,
                    frame * img.width, 0, img.width, img.height,
                    x, y, img.width, img.height
                )
            } else {
                this.ctx.drawImage(img.el, x, y)
            }
        })

        this.queue.filter(q => q[0] == '2d').forEach(q => {
            switch (q[1]) {
            case 'rect':
                this.ctx.fillStyle = q[6]
                this.ctx.fillRect(q[2], q[3], q[4], q[5])
                break
            }
        })

        this.queue = []
    }

}