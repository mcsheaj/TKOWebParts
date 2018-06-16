const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    target: 'web',

    entry: [
        path.resolve(__dirname, 'src/setPublicPath.ts'),
        path.resolve(__dirname, 'src/app.ts')
    ],

    output: {
        filename: 'tkoWebPart.js',
        library: 'tkoWebPart',
        libraryTarget: 'var',
        path: path.resolve('z:', 'tkoWebPart'),
        publicPath: ''
    },

    resolve: {
        extensions: ['.ts', '.js', '.json']
    },

    module: {
        rules: [
            { enforce: 'pre', test: /\.ts$/, exclude: /node_modules/, loader: 'tslint-loader'},
            { test: /\.ts$/, exclude: /node_modules/, loader: 'awesome-typescript-loader' },
            { test: /\.scss$/, exclude: /node_modules/, loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] },
            { test: /\.(png|jpg)$/, exclude: /node_modules/, loaders: ['url-loader?limit=10000'] }
        ]
    },

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: true,
                    ecma: 6,
                    mangle: true,
                    output: {
                        comments: false
                    },
                    compress: {
                        dead_code: true,
                        drop_console: true
                    }
                },
                sourceMap: true
            })
        ]
    },

    externals: {
    },
};