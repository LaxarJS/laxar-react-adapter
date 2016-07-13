/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */

const path = require( 'path' );
const webpack = require( 'webpack' );

const baseConfig = require( './webpack.base.config' );

module.exports = [
   distConfig(),
   distMinConfig()
];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distConfig() {

   const config = Object.assign( {}, baseConfig );

   config.output = {
      path: path.resolve( __dirname ),
      filename: 'dist/laxar-react-adapter.js',
      library: 'laxar',
      libraryTarget: 'umd',
      umdNamedDefine: true
   };

   config.externals = {
      'laxar': 'laxar',
      'react-dom': 'react-dom'
   };

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/laxar-react-adapter.js.map'
      } )
   ];

   return config;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function distMinConfig() {

   const config = Object.assign( {}, distConfig() );

   config.output = Object.assign( {}, config.output, {
      filename: 'dist/laxar-react-adapter.min.js'
   } );

   config.plugins = [
      new webpack.SourceMapDevToolPlugin( {
         filename: 'dist/laxar-react-adapter.min.js.map'
      } ),
      new webpack.optimize.UglifyJsPlugin( {
         compress: {
            warnings: true
         },
         sourceMap: true
      } )
   ];

   return config;
}
