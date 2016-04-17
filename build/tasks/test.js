var gulp        = require('gulp');
var KarmaServer = require('karma').Server;
var server      = require('./server');

/**
 * Run test once and exit
 */
gulp.task('test', ['lint'], function(done) {
  server.start(function() {
    var karmaServer = new KarmaServer({
      configFile: __dirname + '/../../karma.conf.js',
      singleRun: true
    }, function(exitCode) {
      server.stop(function() {
        done();

        process.exit(exitCode);
      });
    });

    karmaServer.start();
  });
});

/**
 * Run live test
 */
gulp.task('tdd',  function(done) {
  server.start(function() {
    var karmaServer = new KarmaServer({
      configFile: __dirname + '/../../karma.conf.js',
      singleRun: false,
      browsers: ['Chrome']
    }, function(exitCode) {
      server.stop(function() {
        done();

        process.exit(exitCode);
      });
    });

    karmaServer.start();
  });
});
