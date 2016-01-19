'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.configure = configure;

var _baseConfig = require('./baseConfig');

var _appFetchHttpClientConfig = require('./app.fetch-httpClient.config');

var _spoonxAureliaApi = require('spoonx/aurelia-api');

var _aureliaFetchClient = require('aurelia-fetch-client');

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
Object.defineProperty(exports, 'FetchConfig', {
  enumerable: true,
  get: function get() {
    return _appFetchHttpClientConfig.FetchConfig;
  }
});

function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  var baseConfig = aurelia.container.get(_baseConfig.BaseConfig);
  var fetchConfig = aurelia.container.get(_appFetchHttpClientConfig.FetchConfig);
  var clientConfig = aurelia.container.get(_spoonxAureliaApi.Config);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }

  if (Array.isArray(baseConfig.current.configureEndpoints)) {
    baseConfig.current.configureEndpoints.forEach(function (endpointToPatch) {
      fetchConfig.configure(endpointToPatch);
    });
  }

  var client = clientConfig.getEndpoint(baseConfig.current.endpoint);

  if (!(client instanceof _spoonxAureliaApi.Rest)) {
    client = new _spoonxAureliaApi.Rest(aurelia.container.get(_aureliaFetchClient.HttpClient));
  }

  baseConfig.current.client = client;
}