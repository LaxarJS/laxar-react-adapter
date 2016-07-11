/* eslint-env node */

module.exports = {
   entry:  {
      'laxar-react-adapter': './laxar-react-adapter.js'
   },
   resolve: {},
   module: {
      loaders: [
         {
            test: /\.js$/,
            exclude: /node_modules\/(?!laxar.*)/,
            loader: 'babel-loader'
         }
      ]
   }
};
