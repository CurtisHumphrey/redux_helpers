module.exports = {
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(bower_components|node_modules)/,
      loader: 'babel',
    }],
  },
  output: {
    libraryTarget: 'umd',
  },
  externals: [
    'lodash',
    'redux-actions',
  ],
  resolve: {
    extensions: [
      '',
      '.js',
    ],
  },
}
