System.register(['aurelia-fetch-client', './authentication', './baseConfig', 'aurelia-dependency-injection', 'spoonx/aurelia-api'], function (_export) {
  'use strict';

  var HttpClient, Authentication, BaseConfig, inject, Config, Rest, FetchConfig;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }, function (_authentication) {
      Authentication = _authentication.Authentication;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_spoonxAureliaApi) {
      Config = _spoonxAureliaApi.Config;
      Rest = _spoonxAureliaApi.Rest;
    }],
    execute: function () {
      FetchConfig = (function () {
        function FetchConfig(httpClient, clientConfig, authentication, config) {
          _classCallCheck(this, _FetchConfig);

          this.httpClient = httpClient;
          this.clientConfig = clientConfig;
          this.auth = authentication;
          this.config = config.current;
        }

        _createClass(FetchConfig, [{
          key: 'configure',
          value: function configure(client) {
            var _this = this;

            if (Array.isArray(client)) {
              var _ret = (function () {
                var configuredClients = [];
                client.forEach(function (toConfigure) {
                  configuredClients.push(_this.configure(toConfigure));
                });

                return {
                  v: configuredClients
                };
              })();

              if (typeof _ret === 'object') return _ret.v;
            }

            if (typeof client === 'string') {
              client = this.clientConfig.getEndpoint(client).client;
            } else if (client instanceof Rest) {
              client = client.client;
            } else if (!(client instanceof HttpClient)) {
              client = this.httpClient;
            }

            client.interceptors.push(this.interceptor);

            return client;
          }
        }, {
          key: 'interceptor',
          get: function get() {
            var auth = this.auth;
            var config = this.config;

            return {
              request: function request(_request) {
                if (!auth.isAuthenticated() || !config.httpInterceptor) {
                  return _request;
                }

                var token = auth.getToken();

                if (config.authHeader && config.authToken) {
                  token = config.authToken + ' ' + token;
                }

                _request.headers.append(config.authHeader, token);

                return _request;
              }
            };
          }
        }]);

        var _FetchConfig = FetchConfig;
        FetchConfig = inject(HttpClient, Config, Authentication, BaseConfig)(FetchConfig) || FetchConfig;
        return FetchConfig;
      })();

      _export('FetchConfig', FetchConfig);
    }
  };
});