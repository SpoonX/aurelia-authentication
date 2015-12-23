System.register(['./baseConfig', './authService', './authorizeStep', './app.fetch-httpClient.config'], function (_export) {
  'use strict';

  var BaseConfig;

  _export('configure', configure);

  function configure(aurelia, config) {
    aurelia.globalResources('./authFilter');

    var baseConfig = aurelia.container.get(BaseConfig);
    if (typeof config === 'function') {
      config(baseConfig);
    } else if (typeof config === 'object') {
      baseConfig.configure(config);
    }
  }

  return {
    setters: [function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_authService) {
      _export('AuthService', _authService.AuthService);
    }, function (_authorizeStep) {
      _export('AuthorizeStep', _authorizeStep.AuthorizeStep);
    }, function (_appFetchHttpClientConfig) {
      _export('FetchConfig', _appFetchHttpClientConfig.FetchConfig);
    }],
    execute: function () {}
  };
});