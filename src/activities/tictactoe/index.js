import Activity from '../Activity'
import Services from '../../services'

const BOX_SIZE = 60
const MARGINS = 4
const WIN_CONDITIONS = [
    0, 1, 2,
    3, 4, 5,
    6, 7, 8,
    0, 3, 6,
    1, 4, 7,
    2, 5, 8,
    0, 4, 8,
    2, 4, 6,
]

export default class Tictactoe extends Activity {

    prevBoard = new Array(9)
    winner = 0
    winnerTimer = 0
    state = {}
    clickableAreas = []
    board = new Array(9)

    constructor (el, room) {
        super(el)

        this.room = room
        this.particles.particleSize = 4
        this.particles.gravity = 40
        this.canvas.el.onmousemove = this.mouseMove
        this.canvas.el.onclick = this.click
    }

    mouseMove = (evt) => {
        this.mouseX = evt.offsetX
        this.mouseY = evt.offsetY
    }

    click = (evt) => {
        this.clickableAreas.forEach(box => {
            if (this.hitTest(box, this.mouseX, this.mouseY)) {
                Services.socket.send('activity', 'move', this.room.id, {
                    x: box._x, y: box._y
                })
            }
        })
    }

    tick (dt) {
        super.tick(dt)
        this.state.board.forEach((b, i) => {
            if (b != this.prevBoard[i]) {
                this.board[i] = {
                    type: b,
                    timer: 0,
                }
            }
            this.prevBoard[i] = b
        })

        if (this.winner != this.state.winner) {
            this.winnerTimer = 0
            this.winner = this.state.winner
        }

        this.board.forEach(b => {
            if (b.timer < 1) {
                b.timer += dt
            } else {
                b.timer = 1
            }
        })

        if (this.winnerTimer < 1) {
            this.winnerTimer += dt
        } else {
            this.winnerTimer = 1
        }
    }

    draw (dt) {
        super.draw()

        this.ctx.fillStyle = '#006600'
        this.ctx.strokeStyle = '#006600'

        this.offsetX = this.canvas.width / 2 - BOX_SIZE * 1.5 - MARGINS
        this.offsetY = this.canvas.height / 2 - BOX_SIZE * 1.5 - MARGINS

        const max = 3 * BOX_SIZE + 2 * MARGINS
        const radius = BOX_SIZE / 2 - 8

        this.ctx.save()
        this.ctx.translate(this.offsetX, this.offsetY)
        this.ctx.fillRect(
            BOX_SIZE, 0,
            MARGINS, max)
        this.ctx.fillRect(
            BOX_SIZE * 2 + MARGINS, 0,
            MARGINS, max)
        this.ctx.fillRect(
            0, BOX_SIZE,
            max, MARGINS)
        this.ctx.fillRect(
            0, BOX_SIZE * 2 + MARGINS,
            max, MARGINS)

        this.ctx.lineWidth = 4
        this.ctx.fillStyle = '#0f0'
        this.ctx.strokeStyle = '#0f0'

        this.clickableAreas = []
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                const tile = this.calculateTile(x, y)
                if (this.board[tile.i] && this.board[tile.i].type !== 0) {
                    const b = this.board[tile.i]
                    this.ctx.beginPath()
                    if (b.type == 1) {

                        this.line(tile.x0 + 8, tile.y0 + 8,
                            tile.x1 - 8, tile.y1 - 8,
                            b.timer, b.timer < 1)

                        this.line(tile.x1 - 8, tile.y0 + 8,
                            tile.x0 + 8, tile.y1 - 8,
                            b.timer, b.timer < 1)

                    } else if (b.type == 2) {
                        const angle = Math.PI * 2 * b.timer - Math.PI * 0.5
                        this.ctx.ellipse(
                            tile.centerX, tile.centerY,
                            radius, radius,
                            0, 0 - Math.PI * 0.5, angle
                        )
                        if (b.timer < 1) {
                            this.tileParticle(
                                Math.cos(angle) * radius + tile.centerX,
                                Math.sin(angle) * radius + tile.centerY,
                                Math.cos(angle + 1) * radius + tile.centerX,
                                Math.sin(angle + 1) * radius + tile.centerY)
                        }
                    }
                    this.ctx.stroke()
                }
                // this.ctx.strokeRect(
                //     x * (BOX_SIZE + MARGINS),
                //     y * (BOX_SIZE + MARGINS),
                //     BOX_SIZE,
                //     BOX_SIZE
                // )
                this.clickableAreas.push({
                    _x: x,
                    _y: y,
                    x: this.offsetX + tile.x0,
                    y: this.offsetY + tile.y0,
                    w: BOX_SIZE,
                    h: BOX_SIZE
                })
            }
        }

        this.ctx.font = '16px monospace'

        let text = ''
        if (this.state.loggedIn) {
            if (this.state.winner > 0) {
                if (this.state.winner == 1) {
                    text = this.state.isOwner ? 'win!' : 'lose!'
                } else if (this.state.winner == 2) {
                    text = this.state.isOwner ? 'lose!' : 'win!'
                } else {
                    text = 'draw!'
                }
            } else if (this.state.isMyTurn) {
                text = 'my turn'
            } else {
                text = 'waiting for player'
            }
        } else {
            text = 'spectating'
        }
        this.ctx.fillText(text, 0, max + 18)

        if (this.state.winner > 0) {
            for (let i = 0; i < WIN_CONDITIONS.length; i += 3) {
                let x = WIN_CONDITIONS[i+0]
                let y = WIN_CONDITIONS[i+1]
                let z = WIN_CONDITIONS[i+2]
                if (this.board[x].type + this.board[y].type + this.board[z].type == 0) {
                    continue
                }
                if (this.board[x].type == this.board[y].type &&
                    this.board[y].type == this.board[z].type) {
                    const tile0 = this.calculateTile(x % 3, Math.floor(x / 3))
                    const tile1 = this.calculateTile(z % 3, Math.floor(z / 3))
                    this.line(
                        tile0.centerX, tile0.centerY,
                        tile1.centerX, tile1.centerY,
                        this.winnerTimer, this.winnerTimer < 1
                    )
                    for (let j = 0; j < 20; j++) {
                        this.randomParticle({
                            x: tile0.x0 + this.offsetX,
                            y: tile0.y0 + this.offsetY,
                            w: tile1.x1 - tile0.x0,
                            h: tile1.y1 - tile0.y0,
                        })
                    }
                    break
                }
            }
        }

        this.ctx.restore()

        if (this.state.winner <= 0 && this.state.isMyTurn && this.state.loggedIn) {
            this.clickableAreas.forEach(box => {
                if (this.hitTest(box, this.mouseX, this.mouseY)) {
                    for (let i = 0; i < 4; i++) this.randomParticle(box)
                }
            })
        }

        this.particles.draw()
    }

    calculateTile (x, y) {
        const _x = x * (BOX_SIZE + MARGINS)
        const _y = y * (BOX_SIZE + MARGINS)
        return {
            i: y * 3 + x,
            x0: _x,
            y0: _y,
            x1: _x + BOX_SIZE,
            y1: _y + BOX_SIZE,
            centerX: _x + BOX_SIZE / 2,
            centerY: _y + BOX_SIZE / 2,
        }
    }

    line (fromX, fromY, toX, toY, t, particle) {
        let { x, y } = this.lerp(fromX, fromY, toX, toY, t)
        this.ctx.beginPath()
        this.ctx.moveTo(fromX, fromY)
        this.ctx.lineTo(x, y)
        if (particle) {
            this.tileParticle(x, y, toX, toY)
        }
        this.ctx.stroke()
    }

    lerp (x0, y0, x1, y1, t) {
        return {
            x: (x0 + t * (x1 - x0)),
            y: (y0 + t * (y1 - y0))
        }
    }

    hitTest (box, x, y) {
        return (
            x >= box.x &&
            y >= box.y &&
            x <= box.x + box.w &&
            y <= box.y + box.h
        )
    }

    tileParticle (fromX, fromY, toX, toY) {
        const vx = toX - fromX
        const vy = toY - fromY
        const length = Math.sqrt(vx * vx + vy * vy)

        this.particles.add2(
            this.offsetX + fromX - 2,
            this.offsetY + fromY - 2,
            (Math.random() * 20 + 20)* (vx / length),
            (Math.random() * 20 + 20) * (vy / length),
            0.5,
            '#0f0',
            0
        )
    }

    randomParticle (box) {
        let x, y
        if (Math.random() > 0.495) {
            const length = Math.random() * box.w
            if (Math.random() > 0.495) {
                x = box.x + length
                y = box.y
            } else {
                x = box.x + length
                y = box.y + box.h
            }
        } else {
            const length = Math.random() * box.h
            if (Math.random() > 0.495) {
                x = box.x
                y = box.y + length
            } else {
                x = box.x + box.w
                y = box.y + length
            }
        }

        this.particles.add2(x - 2, y - 2,
            Math.random() * 6 - 3, Math.random() * 20 - 10,
            0.2 + Math.random() / 8, '#00ff00', -2)
    }

}