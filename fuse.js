const { src, task, context, watch } = require('fuse-box/sparky');
const { FuseBox, JSONPlugin, RawPlugin, ImageBase64Plugin, QuantumPlugin,
    CSSResourcePlugin, CSSModulesPlugin, CSSPlugin, WebIndexPlugin } = require('fuse-box');
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const blender = process.env.BLENDER_PATH
const aseprite = process.env.ASEPRITE_PATH

const modelPath = 'models'

const baseExportPath = 'src/assets/'
const modelExportPath = baseExportPath + modelPath
const texDataExportPath = 'src/config/sprites'
const dataExportFile = 'src/config/resources.ts'

const modelSources = './resources/**/*.blend';
const texSources = './resources/**/*.+(aseprite|ase)';

const resourceSources = [modelSources, texSources];

task('default', async context => {
    await context.clean();
    await context.development();
});

task('dist', async context => {
    await context.clean();
    await context.dist();
});

task('resource_build', async context => {
    // await context.cleanBuilt();
    context.makeResDirs();
    await context.copyResources();
});

task('resource_watch', async context => {
    context.makeResDirs();
    await context.watchResources();
});

task('resource_clean', async context => {
    await context.cleanBuilt();
});

context(
    class {
        getConfig() {
            return FuseBox.init({
                homeDir: 'src',
                target: 'browser@es6',
                hash: this.isProduction,
                output: 'public/$name.js',
                plugins: [
                    [CSSResourcePlugin({
                        inline: true
                    }), CSSModulesPlugin(), CSSPlugin()],
                    JSONPlugin(),
                    RawPlugin(['.vs', '.fs']),
                    ImageBase64Plugin({
                        useDefault: false // setting this to true actually breaks defaults?
                    }),
                    WebIndexPlugin({
                        template: 'static/index.html'
                    }),
                    this.isProduction &&
                        QuantumPlugin({
                            css: true,
                            uglify: true
                        })
                ]
            });
        }

        async copyResources() {
            await src(resourceSources)
                .file('*.blend', this.buildModel)
                .file('*.ase', this.buildSprite)
                .file('*.aseprite', this.buildSprite)
                .completed(this.buildResourceJSON)
                .exec();
        }

        async watchResources() {
            await watch(resourceSources)
                .file('*.blend', this.buildModel)
                .file('*.ase', this.buildSprite)
                .file('*.aseprite', this.buildSprite)
                .completed(this.buildResourceJSON)
                .exec();
        }

        async clean() {
            await src('./public')
                .clean('public/')
                .exec();
        }

        async cleanBuilt() {
            await src('./static')
                .clean(modelExportPath)
                .clean(spriteExportPath)
                .exec();
        }

        makeResDirs() {
            try {
                fs.mkdirSync(baseExportPath, { recursive: true })
            } catch (e) {}
        }

        buildModel(f) {
            const name = f.name.split('.')[0]
            process.env.MODEL_EXPORT_PATH = `${modelExportPath}/${name}.gltf`
            execSync(`${blender} -b "${f.filepath}" --python convert_to_gltf.py`)
            fs.renameSync(process.env.MODEL_EXPORT_PATH, process.env.MODEL_EXPORT_PATH + '.json')
        }

        buildSprite(f) {
            const texPath = path.dirname(f.filepath)
            try {
                fs.mkdirSync(texPath, { recursive: true })
            } catch (e) {}
            const subdir  = path.basename(texPath)
            const name = f.name.split('.')[0]
            execSync(`${aseprite} -b "${f.filepath}" --sheet "${baseExportPath}${subdir}/${name}.png" --data "${texDataExportPath}/${name}.json"`)
        }

        buildShader(f) {
            return f.copy(`${shaderExportPath}/$name`)
        }

        buildResourceJSON(files) {
            const getName = n => {
                const withExt = path.basename(n)
                const full = path.basename(n, path.extname(n))
                return { withExt, full, clean: full.replace(/[^A-Za-z0-9]/g, '') }
            }
            const modelNames = fs.readdirSync(modelExportPath).map(getName)
            const spriteNames = fs.readdirSync(`${baseExportPath}/sprites`).map(getName)
            const texNames = fs.readdirSync(`${baseExportPath}/textures`).map(getName)

            const imports =
                spriteNames.map(n =>
                    `import * as sprite${n.clean}Data from './sprites/${n.full}.json'\n` +
                    `import sprite${n.clean} from '../assets/sprites/${n.withExt}'`
                )
                .concat(
                    texNames.map(n =>
                        `import * as tex${n.clean}Data from './sprites/${n.full}.json'\n` +
                        `import tex${n.clean} from '../assets/textures/${n.withExt}'`
                    )
                )
                .concat(
                    modelNames.map(n => `import model${n.clean}Data from '../assets/models/${n.withExt}'`)
                )

            const models = modelNames.map(n =>
                `'${n.full}': model${n.clean}Data,`)
            const sprites = spriteNames.map(n =>
                `'${n.full}': { file: sprite${n.clean}, data: sprite${n.clean}Data },`)
            const textures = texNames.map(n =>
                `'${n.full}': { file: tex${n.clean}, data: tex${n.clean}Data },`)

            fs.writeFileSync(dataExportFile, `// AUTOMATICALLY GENERATED FILE
${imports.join('\n')}

export const MODELS = {
    ${models.join('\n    ')}
}
export const SPRITES = {
    ${sprites.join('\n    ')}
}
export const TEXTURES = {
    ${textures.join('\n    ')}
}
`)
        }

        dist() {
            this.isProduction = true;
            const fuse = this.getConfig();
            fuse
                .bundle('px')
                .instructions('>index.tsx');
            return fuse.run();
        }

        development() {
            const fuse = this.getConfig();
            fuse.dev({ port: 8080, fallback: 'index.html' });
            fuse
                .bundle('px')
                .sourceMaps({
                    inline: true,
                    project: true,
                    vendor: true
                })
                .hmr()
                .instructions('>index.tsx')
                .watch();
            return fuse.run();
        }
    }
);