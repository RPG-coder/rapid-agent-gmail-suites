const path = require('path');
const GasPlugin = require('gas-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './sidebar-ui/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new GasPlugin(),
  ],
  optimization: {
    minimize: false, // Apps Script prefers readable bundles or specific minification
  },
};
