const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = require('path').resolve
const webpackValidator = require('webpack-validator')
const getIfUtils = require('webpack-config-utils').getIfUtils
const removeEmpty = require('webpack-config-utils').removeEmpty
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const ModernizrWebpackPlugin = require('modernizr-webpack-plugin');


module.exports = env => {
    const ifProd = getIfUtils(env).ifProd
    const ifNotProd = getIfUtils(env).ifNotProd
    const config = webpackValidator({
        context: resolve('src'),
        entry: './app.js',
        output: {
            filename: ifProd('bundle.[name].[chunkhash].js', 'bundle.[name].js'),
            path: resolve('dist'),

            pathinfo: ifNotProd(),
        },
        devtool: ifProd('source-map', 'eval'),
        module: {
            loaders: [
                {test: /\.js$/, loaders: ['babel'], exclude: /node_modules/},
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_componenets)/,
                    loader: 'babel'
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: ['css-loader'],
                    })
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: 'file-loader?name=public/fonts/[name].[ext]'
                },
                { test: require.resolve("jquery"), loader: "expose?$!expose?jQuery" },
                {test: /\.json$/, loaders: ['json']},
                {test: /modernizr/, loader: 'imports?this=>window,html5=>window.html5!exports?window.Modernizr'},
                {test: /\.(jpe?g|png|gif|svg)$/i,
                    loaders: [
                        'file-loader',
                        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]},
            ],
        },
        plugins: removeEmpty([
            new ModernizrWebpackPlugin(),
            new ProgressBarPlugin(),
            ifProd(new InlineManifestWebpackPlugin()),
            ifProd(new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest'],
            })),
            new ExtractTextPlugin(ifProd('styles.[name].[chunkhash].css', 'styles.[name].css')),
            new HtmlWebpackPlugin({
                template: './index.html',
                inject: 'body',
                favicon: 'favicon.ico'
            }),
        ]),
        externals: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery",
                jquery: "jquery"
            })
        ],
    })
    if (env.debug) {
        console.log(config)
        debugger // eslint-disable-line
    }
    return config
}
