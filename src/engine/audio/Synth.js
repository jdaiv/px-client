import { NOTES_ARR } from './Notes'

const WAVEFORMS = [
    'sine',
    'sawtooth',
    'triangle',
    'square',
]


export default class Synth {

    constructor () {
        this.ctx = new AudioContext()
        this.channel = []
        this.channel[0] = new Channel(this.ctx, 0)
        this.channel[1] = new Channel(this.ctx, 0)
        this.channel[2] = new Channel(this.ctx, 0)
        this.channel[3] = new Channel(this.ctx, 0)
        this.channel[4] = new Channel(this.ctx, 0)
        this.channel[5] = new Channel(this.ctx, 0)
        this.channel[6] = new Channel(this.ctx, 0)
        this.channel[7] = new Channel(this.ctx, 0)
    }

    i = 0

    tick (dt) {
        // this.channel.playNote(NOTES_ARR[Math.floor(this.i)])
        // this.i = (this.i + dt * 10) % NOTES_ARR.length
    }

}

class Channel {

    set gain (v) {
        this.gainNode.gain.value = v
    }

    get gain () {
        return this.gainNode.gain.value
    }

    constructor (ctx, type = 1) {
        this.ctx = ctx
        this.gainNode = ctx.createGain()
        this.gainNode.connect(ctx.destination)
        this.gainNode.gain.value = 0

        this.oscNode = ctx.createOscillator()
        this.oscNode.connect(this.gainNode)
        this.oscNode.type = WAVEFORMS[type]
        this.oscNode.start(0)
    }

    playNote (freq) {
        this.gainNode.gain.setValueCurveAtTime([0.0, 0.4, 0.2, 0.1, 0.1, 0.1, 0], this.ctx.currentTime, 0.7)
        this.oscNode.frequency.setValueAtTime(freq, 0)
    }

}