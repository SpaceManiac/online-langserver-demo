//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'web',

  // the entry point, 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: {
    "main": './src/main.ts',
    "dmls.worker": './src/dmls.worker.ts',
    "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
  },
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    globalObject: 'self',
    //libraryTarget: 'commonjs2',
    //devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  node: {
    net: 'empty',
    fs: 'empty'
  },
  devtool: 'source-map',
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js', '.css'],
    alias: {
      vscode: require.resolve('monaco-languageclient/lib/vscode-compatibility')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
module.exports = config;
