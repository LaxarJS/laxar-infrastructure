# LaxarJS Infrastructure

> base webpack/karma configuration for LaxarJS core modules

This is mainly intended for _internal_ use by LaxarJS artifacts, to avoid duplicating webpack and karma configuration across projects.

## Usage

The basic steps

- `yarn add --dev laxar-infrastructure`


- `webpack.config.js`: generate configuration using:

  + `require( 'laxar-infrastructure' ).webpack( { context: __dirnamne } ).library()` and/or
  + `require( 'laxar-infrastructure' ).webpack( { context: __dirnamne } ).browserSpec( filePatterns )`


- `karma.config.js`: generate configuration using:

  + `require( 'laxar-infrastructure' ).karma( filePatterns, webpackConfig )`

    here you may want to load the `webpackConfig` from the `webpack.config.js`
