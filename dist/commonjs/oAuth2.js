'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aureliaFramework = require('aurelia-framework');

var _authUtils = require('./authUtils');

var _authUtils2 = _interopRequireDefault(_authUtils);

var _storage = require('./storage');

var _popup = require('./popup');

var _baseConfig = require('./baseConfig');

var OAuth2 = (function () {
  function OAuth2(storage, popup, config) {
    _classCallCheck(this, _OAuth2);

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
    this.current = {};
  }

  _createClass(OAuth2, [{
    key: 'open',
    value: function open(options, userData) {
      var _this = this;

      this.current = _authUtils2['default'].extend({}, this.defaults, options);
      var stateName = this.current.name + '_state';

      if (_authUtils2['default'].isFunction(this.current.state)) {
        this.storage.set(stateName, this.current.state());
      } else if (_authUtils2['default'].isString(this.current.state)) {
        this.storage.set(stateName, this.current.state);
      }

      var url = this.current.authorizationEndpoint + '?' + this.buildQueryString();

      var openPopup = undefined;
      if (this.config.platform === 'mobile') {
        openPopup = this.popup.open(url, this.current.name, this.current.popupOptions, this.current.redirectUri).eventListener(this.current.redirectUri);
      } else {
        openPopup = this.popup.open(url, this.current.name, this.current.popupOptions, this.current.redirectUri).pollPopup();
      }

      return openPopup.then(function (oauthData) {
        if (_this.current.responseType === 'token' || _this.current.responseType === 'id_token%20token' || _this.current.responseType === 'token%20id_token') {
          return oauthData;
        }
        if (oauthData.state && oauthData.state !== _this.storage.get(stateName)) {
          return Promise.reject('OAuth 2.0 state parameter mismatch.');
        }
        return _this.exchangeForToken(oauthData, userData);
      });
    }
  }, {
    key: 'exchangeForToken',
    value: function exchangeForToken(oauthData, userData) {
      var data = _authUtils2['default'].extend({}, userData, {
        code: oauthData.code,
        clientId: this.current.clientId,
        redirectUri: this.current.redirectUri
      });

      if (oauthData.state) {
        data.state = oauthData.state;
      }

      _authUtils2['default'].forEach(this.current.responseParams, function (param) {
        return data[param] = oauthData[param];
      });

      var exchangeForTokenUrl = this.config.baseUrl ? _authUtils2['default'].joinUrl(this.config.baseUrl, this.current.url) : this.current.url;
      var credentials = this.config.withCredentials ? 'include' : 'same-origin';

      return this.client.post(exchangeForTokenUrl, data, { credentials: credentials });
    }
  }, {
    key: 'buildQueryString',
    value: function buildQueryString() {
      var _this2 = this;

      var keyValuePairs = [];
      var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

      _authUtils2['default'].forEach(urlParams, function (params) {
        _authUtils2['default'].forEach(_this2.current[params], function (paramName) {
          var camelizedName = _authUtils2['default'].camelCase(paramName);
          var paramValue = _authUtils2['default'].isFunction(_this2.current[paramName]) ? _this2.current[paramName]() : _this2.current[camelizedName];

          if (paramName === 'state') {
            var stateName = _this2.current.name + '_state';
            paramValue = encodeURIComponent(_this2.storage.get(stateName));
          }

          if (paramName === 'scope' && Array.isArray(paramValue)) {
            paramValue = paramValue.join(_this2.current.scopeDelimiter);

            if (_this2.current.scopePrefix) {
              paramValue = [_this2.current.scopePrefix, paramValue].join(_this2.current.scopeDelimiter);
            }
          }

          keyValuePairs.push([paramName, paramValue]);
        });
      });

      return keyValuePairs.map(function (pair) {
        return pair.join('=');
      }).join('&');
    }
  }]);

  var _OAuth2 = OAuth2;
  OAuth2 = (0, _aureliaFramework.inject)(_storage.Storage, _popup.Popup, _baseConfig.BaseConfig)(OAuth2) || OAuth2;
  return OAuth2;
})();

exports.OAuth2 = OAuth2;