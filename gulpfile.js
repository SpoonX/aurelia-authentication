// all default gulp tasks are located in the ./node_modules/spoonx-tools/build-plugin/tasks directory
// gulp default configuration is in files in ./node_modules/spoonx-tools/build-plugin directory
require('require-dir')('node_modules/spoonx-tools/build-plugin/tasks');

// 'gulp help' lists the available default tasks
// you can add additional tasks here
// the testing express server can be imported and routes added
var app = require('./node_modules/spoonx-tools/build-plugin/tasks/server').app;


// default: all routes, all methods
app.all('*', function(req, res) {
  res.send({
    path         : req.path,
    query        : req.query,
    body         : req.body,
    method       : req.method,
    contentType  : req.header('content-type'),
    Authorization: req.header('Authorization'),
    access_token : req.body.access_token,
    refresh_token: req.body.refresh_token
  });
});
