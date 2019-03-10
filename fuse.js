const { src, task, context, watch } = require("fuse-box/sparky");
const { FuseBox, JSONPlugin, QuantumPlugin, CSSModulesPlugin, CSSPlugin, WebIndexPlugin } = require("fuse-box");

const resources = "./**/*.+(obj|png|fs|vs|ico)";

task("default", async context => {
    await context.clean();
    await context.watchResources();
    await context.development();
});

task("dist", async context => {
    await context.clean();
    await context.copyResources();
    await context.dist();
});

context(
    class {
        getConfig() {
            return FuseBox.init({
                homeDir: "src",
                target: "browser@es6",
                hash: this.isProduction,
                output: "public/$name.js",
                plugins: [
                    [CSSModulesPlugin(), CSSPlugin()],
                    JSONPlugin(),
                    WebIndexPlugin({
                        template: "static/index.html"
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
            await src(resources, { base: './static' })
                .dest("public/")
                .exec();
        }

        async watchResources() {
            await watch(resources,  { base: './static' })
                .dest("public/")
                .exec();
        }

        async clean() {
            await src("./public")
                .clean("public/")
                .exec();
        }

        dist() {
            this.isProduction = true;
            const fuse = this.getConfig();
            fuse
                .bundle("px")
                .instructions(">index.tsx");
            return fuse.run();
        }

        development() {
            const fuse = this.getConfig();
            fuse.dev({ port: 8080, fallback: "index.html" });
            fuse
                .bundle("px")
                .sourceMaps({
                    inline: true,
                    project: true,
                    vendor: true
                })
                .hmr()
                .instructions(">index.tsx")
                .watch();
            return fuse.run();
        }
    }
);