'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuth2 = undefined;

var _dec, _class;

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _authUtils = require('./authUtils');

var _storage = require('./storage');

var _popup = require('./popup');

var _baseConfig = require('./baseConfig');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OAuth2 = exports.OAuth2 = (_dec = (0, _aureliaDependencyInjection.inject)(_storage.Storage, _popup.Popup, _baseConfig.BaseConfig), _dec(_class = function () {
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

    var current = _authUtils.authUtils.extend({}, this.defaults, options);
    var stateName = current.name + '_state';

    if (_authUtils.authUtils.isFunction(current.state)) {
      this.storage.set(stateName, current.state());
    } else if (_authUtils.authUtils.isString(current.state)) {
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
    var data = _authUtils.authUtils.extend({}, userData, {
      code: oauthData.code,
      clientId: current.clientId,
      redirectUri: current.redirectUri
    });

    if (oauthData.state) {
      data.state = oauthData.state;
    }

    _authUtils.authUtils.forEach(current.responseParams, function (param) {
      return data[param] = oauthData[param];
    });

    var exchangeForTokenUrl = this.config.baseUrl ? _authUtils.authUtils.joinUrl(this.config.baseUrl, current.url) : current.url;
    var credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.client.post(exchangeForTokenUrl, data, { credentials: credentials });
  };

  OAuth2.prototype.buildQueryString = function buildQueryString(current) {
    var _this2 = this;

    var keyValuePairs = [];
    var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

    _authUtils.authUtils.forEach(urlParams, function (params) {
      _authUtils.authUtils.forEach(current[params], function (paramName) {
        var camelizedName = _authUtils.authUtils.camelCase(paramName);
        var paramValue = _authUtils.authUtils.isFunction(current[paramName]) ? current[paramName]() : current[camelizedName];

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
}()) || _class);