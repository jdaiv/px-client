export default (config, env, helpers) => {
    let { rule } = helpers.getLoadersByName(config, 'babel-loader')[0]
    let babelConfig = rule.options
    babelConfig.plugins.push('babel-plugin-transform-decorators-legacy')
}