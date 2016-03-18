System.register(['./baseConfig', './app.fetch-httpClient.config', 'spoonx/aurelia-api', 'aurelia-fetch-client', './authFilter', './authService', './authorizeStep'], function (_export) {
  'use strict';

  var BaseConfig, FetchConfig, Config, Rest, HttpClient;

  _export('configure', configure);

  function configure(aurelia, config) {
    aurelia.globalResources('./authFilter');

    var baseConfig = aurelia.container.get(BaseConfig);

    if (typeof config === 'function') {
      config(baseConfig);
    } else if (typeof config === 'object') {
      baseConfig.configure(config);
    }

    var fetchConfig = aurelia.container.get(FetchConfig);
    var clientConfig = aurelia.container.get(Config);

    if (Array.isArray(baseConfig.current.configureEndpoints)) {
      baseConfig.current.configureEndpoints.forEach(function (endpointToPatch) {
        fetchConfig.configure(endpointToPatch);
      });
    }

    var client = clientConfig.getEndpoint(baseConfig.current.endpoint);

    if (!(client instanceof Rest)) {
      client = new Rest(aurelia.container.get(HttpClient));
    }

    baseConfig.current.client = client;
  }

  return {
    setters: [function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_appFetchHttpClientConfig) {
      FetchConfig = _appFetchHttpClientConfig.FetchConfig;

      _export('FetchConfig', _appFetchHttpClientConfig.FetchConfig);
    }, function (_spoonxAureliaApi) {
      Config = _spoonxAureliaApi.Config;
      Rest = _spoonxAureliaApi.Rest;
    }, function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }, function (_authFilter) {}, function (_authService) {
      _export('AuthService', _authService.AuthService);
    }, function (_authorizeStep) {
      _export('AuthorizeStep', _authorizeStep.AuthorizeStep);
    }],
    execute: function () {}
  };
});