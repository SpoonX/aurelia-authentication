var path = require('path');
var fs = require('fs');

// hide warning //
var emitter = require('events');
emitter.defaultMaxListeners = 5;

var appRoot = 'src/';
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

var paths = {
  root: appRoot,
  mainSource: [appRoot + '*.js', '!' + appRoot + '*ValueConverter.js'], // all main js which can be concated
  style: 'styles/**/*.css',
  output: 'dist/',
  doc:'./doc',
  test: 'test/**/*.js',
  exampleSource: 'doc/example/',
  exampleOutput: 'doc/example-dist/',
  packageName: pkg.name,
  ignore: [],
  useTypeScriptForDTS: false,
  importsToAdd: [],
  importsToIgnoreForDts: ['extend', 'jwt-decode'], // imports that are only used internally. no need to d.ts export them
  jsResources: [appRoot + '*ValueConverter.js'], // js files that should not be concated, but keep their path
  resources: appRoot + '{**/*.css,**/*.html}',
  sort: true,
  concat: true
};

module.exports = paths;
