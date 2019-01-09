import Volume from '../Volume'

let _platform = new Volume()
// _platform.box(-118, -300, 0, 236, 298, 36, 1, [1, 1, 1, 1, 1, 0]).outline(-2).outline(-1)
_platform.box(-128, -4, 0, 256, 4, 40, 1).outline(-2).outline(-1)
_platform.box(-128, -1, 40, 256, 1, 1, 2)
_platform.box(-45, 0, -30, 90, 42, 40, 1).outline(-2).outline(-1)
_platform.box(-45, 41, 10, 90, 1, 4, 1, [0, 1, 1, 1, 1, 1]).outline(-2).outline(-1)

const size = 5
const gap = 16
const depth = 30
const count = 1024 / (size + gap)

for (let i = 0; i < count; i++) {
    const x = -512 + i * (size + gap)
    _platform.box(x + size, -32, 48, gap - 3, 1, 1, 2).outline(-1)
    _platform.box(x + size, -32, 40 + depth, gap - 3, 1, 1, 2).outline(-1)
    _platform.box(x, -32, 44, size, 2, depth, 2).outline(-1)
}

_platform.finalize()

let _train = new Volume()
_train.box(-100, 32, -16, 200, 4, 32).outline(-2).outline(-1)
// _train.box(-96, 96, -16, 192, 4, 32).outline(-2).outline(-1)
_train.box(-98, 3, -depth / 2 + 2, 196, 32, 2).outline(-2).outline(-1)
_train.box(-98, 3, depth / 2 - 4, 196, 32, 2).outline(-2).outline(-1)
_train.finalize()

export const platform = _platform
export const train = _train