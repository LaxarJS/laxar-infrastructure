/**
 * Copyright 2020 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import path from 'path';
import { webpack } from './webpack';

export function karma( specs, options ) {
   const browsers = [];
   const reporters = [ 'progress' ];
   const isSauceAvailable = !!(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY);

   if( process.env.BROWSER ) {
      const launcherName = isSauceAvailable ? {
         'chrome': 'SauceLabs Chrome',
         'firefox': 'SauceLabs Firefox',
         'internet explorer': 'SauceLabs IE',
         'safari': 'SauceLabs Safari'
      } : {
         'chrome': process.env.TRAVIS ? 'Chrome TravisCi' : 'Chrome',
         'firefox': 'Firefox',
         'internet explorer': 'IE',
         'safari': 'Safari'
      };

      process.env.BROWSER.split( ',' ).forEach( browser => {
         browsers.push( launcherName[ browser ] );
      } );
   }

   if( process.env.TRAVIS && isSauceAvailable ) {
      reporters.push( 'saucelabs' );
   }

   const polyfills = path.resolve( options.context, 'node_modules/laxar/dist/polyfills.js' );
   const entry = require.resolve( './dummy.js' );
   const files = [
      polyfills,
      { pattern: `${polyfills}.map`, included: false },
      entry
   ];
   const preprocessors = {
      [ entry ]: [ 'webpack', 'sourcemap' ]
   };
   const proxies = {};

   return {
      browsers,
      files,
      preprocessors,
      proxies,
      reporters,
      frameworks: [ 'jasmine' ],
      webpack: webpack( options ).karmaSpec( specs ),
      webpackMiddleware: {
         noInfo: true
      },
      customLaunchers: {
         'Chrome TravisCi': {
            base: 'Chrome',
            flags: [ '--no-sandbox' ]
         },
         'SauceLabs Chrome': {
            base: 'SauceLabs',
            browserName: 'chrome'
         },
         'SauceLabs Firefox': {
            base: 'SauceLabs',
            browserName: 'firefox'
         },
         'SauceLabs IE': {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            platform: 'Windows 10'
         },
         'SauceLabs Safari': {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'macOS 10.12'
         }
      },
      sauceLabs: {
         testName: webpack( options ).name
      },
      browserNoActivityTimeout: 5000,
      singleRun: true,
      autoWatch: false
   };
}
