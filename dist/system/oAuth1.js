System.register(['aurelia-framework', './authUtils', './storage', './popup', './baseConfig', 'spoonx/aurelia-api'], function (_export) {
  'use strict';

  var inject, authUtils, Storage, Popup, BaseConfig, Rest, OAuth1;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_aureliaFramework) {
      inject = _aureliaFramework.inject;
    }, function (_authUtils) {
      authUtils = _authUtils['default'];
    }, function (_storage) {
      Storage = _storage.Storage;
    }, function (_popup) {
      Popup = _popup.Popup;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_spoonxAureliaApi) {
      Rest = _spoonxAureliaApi.Rest;
    }],
    execute: function () {
      OAuth1 = (function () {
        function OAuth1(storage, popup, rest, config) {
          _classCallCheck(this, _OAuth1);

          this.storage = storage;
          this.config = config.current;
          this.popup = popup;
          this.rest = rest;
          this.defaults = {
            url: null,
            name: null,
            popupOptions: null,
            redirectUri: null,
            authorizationEndpoint: null
          };
        }

        _createClass(OAuth1, [{
          key: 'open',
          value: function open(options, userData) {
            authUtils.extend(this.defaults, options);

            var serverUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.defaults.url) : this.defaults.url;

            if (this.config.platform !== 'mobile') {
              this.popup = this.popup.open('', this.defaults.name, this.defaults.popupOptions, this.defaults.redirectUri);
            }
            var self = this;
            return this.rest.post(serverUrl).then(function (response) {
              if (self.config.platform === 'mobile') {
                self.popup = self.popup.open([self.defaults.authorizationEndpoint, self.buildQueryString(response)].join('?'), self.defaults.name, self.defaults.popupOptions, self.defaults.redirectUri);
              } else {
                self.popup.popupWindow.location = [self.defaults.authorizationEndpoint, self.buildQueryString(response)].join('?');
              }

              var popupListener = self.config.platform === 'mobile' ? self.popup.eventListener(self.defaults.redirectUri) : self.popup.pollPopup();

              return popupListener.then(function (result) {
                return self.exchangeForToken(result, userData);
              });
            });
          }
        }, {
          key: 'exchangeForToken',
          value: function exchangeForToken(oauthData, userData) {
            var data = authUtils.extend({}, userData, oauthData);
            var exchangeForTokenUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.defaults.url) : this.defaults.url;
            var credentials = this.config.withCredentials ? 'include' : 'same-origin';

            return this.rest.post(exchangeForTokenUrl, data, { credentials: credentials });
          }
        }, {
          key: 'buildQueryString',
          value: function buildQueryString(obj) {
            var str = [];

            authUtils.forEach(obj, function (value, key) {
              str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            });

            return str.join('&');
          }
        }]);

        var _OAuth1 = OAuth1;
        OAuth1 = inject(Storage, Popup, Rest, BaseConfig)(OAuth1) || OAuth1;
        return OAuth1;
      })();

      _export('OAuth1', OAuth1);
    }
  };
});