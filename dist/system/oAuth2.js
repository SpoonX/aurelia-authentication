'use strict';

System.register(['aurelia-dependency-injection', './authUtils', './storage', './popup', './baseConfig'], function (_export, _context) {
  var inject, authUtils, Storage, Popup, BaseConfig, _dec, _class, OAuth2;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_authUtils) {
      authUtils = _authUtils.authUtils;
    }, function (_storage) {
      Storage = _storage.Storage;
    }, function (_popup) {
      Popup = _popup.Popup;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }],
    execute: function () {
      _export('OAuth2', OAuth2 = (_dec = inject(Storage, Popup, BaseConfig), _dec(_class = function () {
        function OAuth2(storage, popup, config) {
          _classCallCheck(this, OAuth2);

          this.storage = storage;
          this.config = config.current;
          this.client = this.config.client;
          this.popup = popup;
          this.defaults = {
            url: null,
            name: null,
            state: null,
            scope: null,
            scopeDelimiter: null,
            redirectUri: null,
            popupOptions: null,
            authorizationEndpoint: null,
            responseParams: null,
            requiredUrlParams: null,
            optionalUrlParams: null,
            defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
            responseType: 'code'
          };
        }

        OAuth2.prototype.open = function open(options, userData) {
          var _this = this;

          var current = authUtils.extend({}, this.defaults, options);
          var stateName = current.name + '_state';

          if (authUtils.isFunction(current.state)) {
            this.storage.set(stateName, current.state());
          } else if (authUtils.isString(current.state)) {
            this.storage.set(stateName, current.state);
          }

          var url = current.authorizationEndpoint + '?' + this.buildQueryString(current);

          var openPopup = void 0;
          if (this.config.platform === 'mobile') {
            openPopup = this.popup.open(url, current.name, current.popupOptions, current.redirectUri).eventListener(current.redirectUri);
          } else {
            openPopup = this.popup.open(url, current.name, current.popupOptions, current.redirectUri).pollPopup();
          }

          return openPopup.then(function (oauthData) {
            if (current.responseType === 'token' || current.responseType === 'id_token%20token' || current.responseType === 'token%20id_token') {
              return oauthData;
            }
            if (oauthData.state && oauthData.state !== _this.storage.get(stateName)) {
              return Promise.reject('OAuth 2.0 state parameter mismatch.');
            }
            return _this.exchangeForToken(oauthData, userData, current);
          });
        };

        OAuth2.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, current) {
          var data = authUtils.extend({}, userData, {
            code: oauthData.code,
            clientId: current.clientId,
            redirectUri: current.redirectUri
          });

          if (oauthData.state) {
            data.state = oauthData.state;
          }

          authUtils.forEach(current.responseParams, function (param) {
            return data[param] = oauthData[param];
          });

          var exchangeForTokenUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, current.url) : current.url;
          var credentials = this.config.withCredentials ? 'include' : 'same-origin';

          return this.client.post(exchangeForTokenUrl, data, { credentials: credentials });
        };

        OAuth2.prototype.buildQueryString = function buildQueryString(current) {
          var _this2 = this;

          var keyValuePairs = [];
          var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

          authUtils.forEach(urlParams, function (params) {
            authUtils.forEach(current[params], function (paramName) {
              var camelizedName = authUtils.camelCase(paramName);
              var paramValue = authUtils.isFunction(current[paramName]) ? current[paramName]() : current[camelizedName];

              if (paramName === 'state') {
                var stateName = current.name + '_state';
                paramValue = encodeURIComponent(_this2.storage.get(stateName));
              }

              if (paramName === 'scope' && Array.isArray(paramValue)) {
                paramValue = paramValue.join(current.scopeDelimiter);

                if (current.scopePrefix) {
                  paramValue = [current.scopePrefix, paramValue].join(current.scopeDelimiter);
                }
              }

              keyValuePairs.push([paramName, paramValue]);
            });
          });

          return keyValuePairs.map(function (pair) {
            return pair.join('=');
          }).join('&');
        };

        return OAuth2;
      }()) || _class));

      _export('OAuth2', OAuth2);
    }
  };
});