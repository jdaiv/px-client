import CopyWebpackPlugin from 'copy-webpack-plugin'

export default (config, env, helpers) => {
    let { rule } = helpers.getLoadersByName(config, 'babel-loader')[0]
    let babelConfig = rule.options
    babelConfig.plugins.push('babel-plugin-transform-decorators-legacy')

    config.plugins.push(
        new CopyWebpackPlugin([
            { context: `${__dirname}/resources`, from: '**/*.*', to: 'resources/' }
        ],
        { ignore: ['*.ase'] })
    )
}