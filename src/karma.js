/**
 * Copyright 2017 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { webpack } from './webpack';

export function karma( options ) {
   const browsers = [];
   const reporters = [ 'progress' ];
   const isSauceAvailable = !!(process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY);

   if( process.env.BROWSER ) {
      const launcherName = isSauceAvailable ? {
         'chrome': 'SauceLabs Chrome',
         'firefox': 'SauceLabs Firefox',
         'internet explorer': 'SauceLabs IE',
         'safari': 'SauceLabs Safari',
         'phantomjs': 'PhantomJS'
      } : {
         'chrome': process.env.TRAVIS ? 'Chrome TravisCi' : 'Chrome',
         'firefox': 'Firefox',
         'internet explorer': 'IE',
         'safari': 'Safari',
         'phantomjs': 'PhantomJS'
      };

      process.env.BROWSER.split( ',' ).forEach( browser => {
         browsers.push( launcherName[ browser ] );
      } );
   }
   else {
      browsers.push( 'PhantomJS' );
   }

   if( process.env.TRAVIS && isSauceAvailable ) {
      reporters.push( 'saucelabs' );
   }

   return {
      browsers,
      frameworks: [ 'jasmine' ],
      preprocessors: {
      },
      proxies: {},
      reporters,
      webpack: webpack( options ).config(),
      webpackMiddleware: {
         noInfo: true,
         quiet: true
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
      browserNoActivityTimeout: 5000,
      singleRun: true,
      autoWatch: false
   };
}
