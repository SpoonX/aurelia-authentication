define(['exports', 'aurelia-fetch-client', './authentication', './baseConfig', 'aurelia-dependency-injection', 'spoonx/aurelia-api'], function (exports, _aureliaFetchClient, _authentication, _baseConfig, _aureliaDependencyInjection, _aureliaApi) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.FetchConfig = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _dec, _class;

  var FetchConfig = exports.FetchConfig = (_dec = (0, _aureliaDependencyInjection.inject)(_aureliaFetchClient.HttpClient, _aureliaApi.Config, _authentication.Authentication, _baseConfig.BaseConfig), _dec(_class = function () {
    function FetchConfig(httpClient, clientConfig, authentication, config) {
      _classCallCheck(this, FetchConfig);

      this.httpClient = httpClient;
      this.clientConfig = clientConfig;
      this.auth = authentication;
      this.config = config.current;
    }

    FetchConfig.prototype.configure = function configure(client) {
      var _this = this;

      if (Array.isArray(client)) {
        var _ret = function () {
          var configuredClients = [];
          client.forEach(function (toConfigure) {
            configuredClients.push(_this.configure(toConfigure));
          });

          return {
            v: configuredClients
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      if (typeof client === 'string') {
        client = this.clientConfig.getEndpoint(client).client;
      } else if (client instanceof _aureliaApi.Rest) {
        client = client.client;
      } else if (!(client instanceof _aureliaFetchClient.HttpClient)) {
        client = this.httpClient;
      }

      client.interceptors.push(this.interceptor);

      return client;
    };

    _createClass(FetchConfig, [{
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

    return FetchConfig;
  }()) || _class);
});