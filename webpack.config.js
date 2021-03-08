const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');


/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled TerserPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/terser-webpack-plugin
 *
 */

const TerserPlugin = require('terser-webpack-plugin');
const myBanner = "Author: simomosi\nRepository: https://github.com/simomosi/dynamic-forms\nDocumentation: https://simomosi.github.io/dynamic-forms/";

let commonConfiguration = {
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            include: [path.resolve(__dirname, 'src')],
            loader: 'babel-loader'
        }]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        library: 'dynamicForms'
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.BannerPlugin({
            banner: myBanner,
        })
    ]
}

let developmentConfiguration = {
    mode: 'development',
    name: 'dev-config',
    output: {
        filename: 'dynamicforms.js'
    },
    devtool: 'eval-source-map',
    performance: {
        hints: 'warning',
    }
}

let productionConfiguration = {
    mode: 'production',
    name: 'prod-config',
    output: {
        filename: 'dynamicforms.min.js'
    },
    devtool: 'source-map', // Recommended by webpack
    optimization: {
        minimizer: [new TerserPlugin({extractComments: false})],
        minimize: true,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/
                }
            },
            chunks: 'async',
            minChunks: 1,
            minSize: 30000,
            name: false
        }
    },
    performance: {
        hints: 'error',
    }
}

module.exports = (env, argv) => {



    console.log("\n", env);
    switch(env.this_env) { // env.this_env set by me in package.json
        case 'development':
            return merge(commonConfiguration, developmentConfiguration);
        case 'production':
            return merge(commonConfiguration, productionConfiguration);
        default:
            throw new Error('No matching configuration was found!');
    }
}
