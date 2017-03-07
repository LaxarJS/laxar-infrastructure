/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import path from 'path';

export function webpack( options = {} ) {
   const context = path.resolve( options.context || process.cwd() );
   const pkg = options.package || require( `${context}/package.json` );
   const name = pkg.name || path.basename( context );
   const main = path.relative( context, pkg.main || `${name}.js` );
   const browser = path.relative( context, pkg.browser || `dist/${name}.js` );
   const rules = options.rules || [];
   const alias = options.alias || {};
   const externals = Object.keys( pkg.peerDependencies ).reduce( (externals, name) => {
      const key = `${name}$`;
      const value = alias[ key ] || alias[ name ] || name;

      externals[ name ] = externals[ value ] = value;

      return externals;
   }, options.externals || {} );
   const devtool = options.devtool || '#source-map';

   const config = {
      context,
      resolve: {
         alias
      },
      module: {
         rules
      },
      devtool
   };

   return {
      library() {
         return this.config( {
            entry: {
               [ name ]: `./${main}`
            },
            output: {
               path: path.dirname( browser ),
               filename: path.basename( browser ).replace( name, '[name]' ),
               library: '[name]',
               libraryTarget: 'umd'
            },
            externals
         } );
      },
      vendor() {
         return this.config( {
            entry: {
               [ `${name}-vendor` ]: Object.keys( externals )
            },
            output: {
               path: path.dirname( browser ),
               filename: '[name].js'
            },
            resolve: {
               alias: externals
            }
         } );
      },
      bundle() {
         return this.config( {
            entry: {
               [ name ]: `./${main}`
            },
            output: {
               path: path.dirname( browser ),
               filename: path.basename( browser ).replace( name, '[name]' )
            }
         } );
      },
      browserSpec() {
         const WebpackJasmineHtmlRunnerPlugin = require( 'webpack-jasmine-html-runner-plugin' );
         return this.config( {
            entry: WebpackJasmineHtmlRunnerPlugin.entry.apply( WebpackJasmineHtmlRunnerPlugin, arguments ),
            plugins: [ new WebpackJasmineHtmlRunnerPlugin() ],
            output: {
               path: path.join( context, 'spec-output' ),
               publicPath: '/',
               filename: '[name].bundle.js'
            }
         } );
      },
      config( options ) {
         return Object.assign( {}, config, options );
      }
   };
}
