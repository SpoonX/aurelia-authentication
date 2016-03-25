'use strict';

System.register(['aurelia-fetch-client', 'spoonx/aurelia-api', './authService', './authorizeStep', './baseConfig', './app.fetch-httpClient.config', './authUtils'], function (_export, _context) {
  var HttpClient, Config, Rest, AuthService, AuthorizeStep, BaseConfig, FetchConfig, authUtils, _typeof;

  function configure(aurelia, config) {
    aurelia.globalResources('./authFilter');

    var baseConfig = aurelia.container.get(BaseConfig);

    if (typeof config === 'function') {
      config(baseConfig);
    } else if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
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
    setters: [function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }, function (_spoonxAureliaApi) {
      Config = _spoonxAureliaApi.Config;
      Rest = _spoonxAureliaApi.Rest;
    }, function (_authService) {
      AuthService = _authService.AuthService;
    }, function (_authorizeStep) {
      AuthorizeStep = _authorizeStep.AuthorizeStep;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_appFetchHttpClientConfig) {
      FetchConfig = _appFetchHttpClientConfig.FetchConfig;
    }, function (_authUtils) {
      authUtils = _authUtils.authUtils;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

      _export('configure', configure);

      _export('FetchConfig', FetchConfig);

      _export('AuthService', AuthService);

      _export('AuthorizeStep', AuthorizeStep);

      _export('authUtils', authUtils);
    }
  };
});