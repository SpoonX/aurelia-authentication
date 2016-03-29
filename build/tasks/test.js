var gulp        = require('gulp');
var KarmaServer = require('karma').Server;

/**
 * Run test once and exit
 */
gulp.task('test', ['lint'], function(done) {
  var karmaServer = new KarmaServer({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true
  }, function() {
    done();

    process.exit();
  });

  karmaServer.start();
});
