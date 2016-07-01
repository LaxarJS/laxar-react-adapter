/* eslint-env node */

module.exports = {
   entry: {
   },
   resolve: {
   },
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
