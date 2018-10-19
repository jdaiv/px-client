import Volume from '../Volume'

let _platform = new Volume(256, 32, 64)
_platform.box(1, 1, 1, 254, 30, 62).box(1, 1, 1, 252, 29, 61, 2).outline()

export const platform = _platform