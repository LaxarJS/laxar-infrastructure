import loaderUtils from 'loader-utils';

module.exports = function () {
   const { files } = loaderUtils.getOptions(this);
   return files.map( file => `require( '${file}' )` ).join('\n');
};
