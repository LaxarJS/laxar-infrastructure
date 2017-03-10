/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import path from 'path';
import { DUMMY_PATH } from './dummy';
import { NormalModuleReplacementPlugin } from 'webpack';

export function webpack( options = {} ) {
   const context = path.resolve( options.context || process.cwd() );
   const pkg = options.package || require( `${context}/package.json` );
   const name = pkg.name || path.basename( context );
   const main = path.relative( context, pkg.main || `${name}.js` );
   const browser = path.resolve( context, pkg.browser || `dist/${name}.js` );
   const rules = options.rules || [];
   const alias = options.alias || {};

   const externalNames = []
      .concat( Object.keys( pkg.dependencies || {} ) )
      .concat( Object.keys( pkg.peerDependencies || {} ) );
   const externals = externalNames.reduce( (externals, name) => {
      const key = `${name}$`;
      const value = alias[ key ] || alias[ name ] || name;

      externals[ name ] = externals[ value ] = value;

      return externals;
   }, options.externals || {} );
   const plugins = options.plugins || [];
   const devtool = options.devtool || '#source-map';

   const useMain = new NormalModuleReplacementPlugin(
      new RegExp( path.basename( browser ) + '$' ),
      result => {
         if( result.resource === browser ) {
            console.log( result.resource );
            result.resource = path.resolve( context, main );
         }
      } );

   const config = {
      context,
      output: {
         path: path.dirname( browser ),
         publicPath: `/${path.relative( context, path.dirname( browser ) )}`
      },
      resolve: {
         alias
      },
      module: {
         rules
      },
      plugins,
      devtool
   };

   return {
      get name() { return name; },
      get version() { return pkg.version; },
      get externals() { return Object.keys( externals ); },
      library() {
         return this.config( {
            entry: {
               [ name ]: `./${main}`
            },
            output: {
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
               [ `${name}.vendor` ]: Object.keys( externals )
            },
            output: {
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
               filename: path.basename( browser ).replace( name, '[name]' )
            }
         } );
      },
      karmaSpec( specs ) {
         const files = specs.map( spec => path.resolve( context, spec ) );

         return this.config( {
            module: {
               rules: [ {
                  test: DUMMY_PATH,
                  loader: require.resolve('./entry-loader'),
                  query: {
                     files
                  }
               } ]
            },
            plugins: [
               useMain
            ]
         } );
      },
      browserSpec( specs, jasmineHtmlRunnerOptions ) {
         const WebpackJasmineHtmlRunnerPlugin = require( 'webpack-jasmine-html-runner-plugin' );

         return this.config( {
            entry: specs.reduce( (entry, spec) => ( {
               ...entry,
               [ spec.replace( /\.[a-z0-9]+$/, '' ) ]: path.resolve( context, spec )
            } ), {} ),
            output: {
               filename: '[name].bundle.js'
            },
            plugins: [
               new WebpackJasmineHtmlRunnerPlugin( jasmineHtmlRunnerOptions ),
               useMain
            ]
         } );
      },
      config( options ) {
         return mergeConfig( {}, config, options );
      }
   };
}

function mergeConfig( config, ...configs ) {

   configs.forEach( source => {
      Object.keys( source ).forEach( key => {
         let value = source[ key ];

         if( Array.isArray( value ) ) {
            config[ key ] = config[ key ] || [];
            config[ key ].push( ...value );
            return;
         }

         if( typeof value === 'object' ) {
            config[ key ] = mergeConfig( config[ key ] || {}, value );
            return;
         }

         config[ key ] = value;
      } );
   } );

   return config;
}
