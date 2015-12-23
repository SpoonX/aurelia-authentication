'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.configure = configure;

var _baseConfig = require('./baseConfig');

var _authService = require('./authService');

Object.defineProperty(exports, 'AuthService', {
  enumerable: true,
  get: function get() {
    return _authService.AuthService;
  }
});

var _authorizeStep = require('./authorizeStep');

Object.defineProperty(exports, 'AuthorizeStep', {
  enumerable: true,
  get: function get() {
    return _authorizeStep.AuthorizeStep;
  }
});

var _appFetchHttpClientConfig = require('./app.fetch-httpClient.config');

Object.defineProperty(exports, 'FetchConfig', {
  enumerable: true,
  get: function get() {
    return _appFetchHttpClientConfig.FetchConfig;
  }
});

function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  var baseConfig = aurelia.container.get(_baseConfig.BaseConfig);
  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }
}