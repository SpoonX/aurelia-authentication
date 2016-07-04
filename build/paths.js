var path = require('path');
var fs = require('fs');

// hide warning //
var emitter = require('events');
emitter.defaultMaxListeners = 20;

var appRoot = 'src/';
var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

var paths = {
  root: appRoot,
  source: appRoot + '**/*.js',
  resources: '*ValueConverter.*',  // relative to root, resources can not that easily be bundled into a single file (due to naming conventions)
  html: appRoot + '**/*.html',
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
  importsToIgnoreForDts: ['extend', 'jwt-decode'],
  sort: false
};

paths.files = [
  paths.source,
  '!' + paths.root + paths.resources
];

module.exports = paths;
