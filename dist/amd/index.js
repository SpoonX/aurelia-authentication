define(['exports', './baseConfig', './app.fetch-httpClient.config', 'spoonx/aurelia-api', 'aurelia-fetch-client', './authFilter', './authService', './authorizeStep'], function (exports, _baseConfig, _appFetchHttpClientConfig, _spoonxAureliaApi, _aureliaFetchClient, _authFilter, _authService, _authorizeStep) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.configure = configure;
  Object.defineProperty(exports, 'AuthService', {
    enumerable: true,
    get: function get() {
      return _authService.AuthService;
    }
  });
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

    if (typeof config === 'function') {
      config(baseConfig);
    } else if (typeof config === 'object') {
      baseConfig.configure(config);
    }

    var fetchConfig = aurelia.container.get(_appFetchHttpClientConfig.FetchConfig);
    var clientConfig = aurelia.container.get(_spoonxAureliaApi.Config);

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
});