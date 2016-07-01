/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/* eslint-env node */
/* eslint no-var:0 */
module.exports = function (grunt) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );
   var polyfillPath = require.resolve( 'laxar/dist/polyfills' );
   var preprocessors = {};
   preprocessors[ polyfillPath ] = [ 'webpack', 'sourcemap' ];
   preprocessors[ '**/spec/spec-runner.js' ] = [ 'webpack', 'sourcemap' ];

   grunt.initConfig( {
      pkg: pkg,
      pkgFile: 'package.json',
      karma: {
         options: {
            configFile: 'karma.config.js',
            preprocessors: preprocessors
         },
         adapter: {
            options: {
               files: [ polyfillPath, 'spec/spec-runner.js' ]
            }
         }
      }
   } );

   grunt.loadNpmTasks('grunt-karma');
   grunt.registerTask( 'default', [ 'karma' ] );
   grunt.registerTask( 'test', [ 'karma' ] );
};
