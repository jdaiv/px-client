const fs = require('fs')
const { execSync } = require('child_process')

const blender = process.env.BLENDER_PATH
const aseprite = process.env.ASEPRITE_PATH
const modelPath = 'resources/models'
const spritePath = 'resources/sprites'
const spriteExportPath = 'static/resources/sprites'
const spriteDataExportPath = 'src/config/sprites'
const shaderPath = 'resources/shaders'
const shaderExportPath = 'static/resources/shaders'
const dataExportFile = 'src/config/resources.ts'

const models = fs.readdirSync(modelPath)
let modelNames = []
models.forEach(f => {
    const name = f.split('.')[0]
    console.log(`converting model ${modelPath}/${f}`)
    process.env.MODEL_NAME = name
    execSync(`${blender} -b "${modelPath}/${f}" --python convert_to_obj.py`)
    modelNames.push(name)
})

const sprites = fs.readdirSync(spritePath)
let spriteNames = []
sprites.forEach(f => {
    const name = f.split('.')[0]
    console.log(`converting sprite ${spritePath}/${f}`)
    execSync(`${aseprite} -b "${spritePath}/${f}" --sheet "${spriteExportPath}/${name}.png" --data "${spriteDataExportPath}/${name}.json"`)
    spriteNames.push(name)
})

const shaders = fs.readdirSync(shaderPath)
let shaderNames = []
shaders.forEach(f => {
    console.log(`copying shader ${shaderPath}/${f}`)
    fs.copyFileSync(`${shaderPath}/${f}`, `${shaderExportPath}/${f}`)
    shaderNames.push(f)
})

let dataFile = []
spriteNames.forEach(n => dataFile.push(`import * as sprite${n.replace(/[^A-Za-z0-9]/g, '')} from './sprites/${n}.json'`))
dataFile.push('\nexport const MODELS = {')
modelNames.forEach(n => dataFile.push(`    '${n}': '${modelPath}/${n}.obj',`))
dataFile.push('}')
dataFile.push('\nexport const SPRITES = {')
spriteNames.forEach(n => dataFile.push(`    '${n}': { file: '${spritePath}/${n}.png', data: sprite${n.replace(/[^A-Za-z0-9]/g, '')} },`))
dataFile.push('}')
dataFile.push('\nexport const SHADERS = {')
shaderNames.forEach(n => dataFile.push(`    '${n}': '${shaderPath}/${n}',`))
dataFile.push('}')
fs.writeFileSync(dataExportFile, dataFile.join('\n'))
