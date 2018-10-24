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
        this.channel[0] = new Channel(this.ctx)
        this.channel[1] = new Channel(this.ctx)
        this.channel[2] = new Channel(this.ctx)
        this.channel[3] = new Channel(this.ctx)
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

    constructor (ctx) {
        this.ctx = ctx
        this.gainNode = ctx.createGain()
        this.gainNode.connect(ctx.destination)
        this.gainNode.gain.value = 0

        this.oscNode = ctx.createOscillator()
        this.oscNode.connect(this.gainNode)
        this.oscNode.type = WAVEFORMS[3]
        this.oscNode.start(0)
    }

    playNote (freq) {
        this.gainNode.gain.setValueCurveAtTime([0, 0.3, 0.3, 0.1, 0], this.ctx.currentTime, 0.1)
        this.oscNode.frequency.setValueAtTime(freq, 0)
    }

}