//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'web',

  // the entry point, 📖 -> https://webpack.js.org/configuration/entry-context/
  entry: {
    "main": './src/main.ts',
		"editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
		"json.worker": 'monaco-editor/esm/vs/language/json/json.worker',
		"css.worker": 'monaco-editor/esm/vs/language/css/css.worker',
		"html.worker": 'monaco-editor/esm/vs/language/html/html.worker',
    "ts.worker": 'monaco-editor/esm/vs/language/typescript/ts.worker'
  },
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    globalObject: 'self',
    //libraryTarget: 'commonjs2',
    //devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js', '.css']
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
