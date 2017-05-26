const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'source-map',
    target: 'web',

    entry: [
        path.resolve(__dirname, 'src/setPublicPath.ts'),
        path.resolve(__dirname, 'src/index.ts')
    ],

    output: {
        filename: 'tkoWebPart.js',
        library: 'tkoWebPart',
        libraryTarget: 'var',
        path: 'Z:/tkoWebPart',
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

    plugins: [
    ],

    externals: {
    },
};
