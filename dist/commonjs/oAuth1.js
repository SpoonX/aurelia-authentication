'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OAuth1 = undefined;

var _dec, _class;

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _authUtils = require('./authUtils');

var _storage = require('./storage');

var _popup = require('./popup');

var _baseConfig = require('./baseConfig');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OAuth1 = exports.OAuth1 = (_dec = (0, _aureliaDependencyInjection.inject)(_storage.Storage, _popup.Popup, _baseConfig.BaseConfig), _dec(_class = function () {
  function OAuth1(storage, popup, config) {
    _classCallCheck(this, OAuth1);

    this.storage = storage;
    this.config = config.current;
    this.popup = popup;
    this.client = this.config.client;
    this.defaults = {
      url: null,
      name: null,
      popupOptions: null,
      redirectUri: null,
      authorizationEndpoint: null
    };
  }

  OAuth1.prototype.open = function open(options, userData) {
    var _this = this;

    var current = _authUtils.authUtils.extend({}, this.defaults, options);

    var serverUrl = this.config.baseUrl ? _authUtils.authUtils.joinUrl(this.config.baseUrl, current.url) : current.url;

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', current.name, current.popupOptions, current.redirectUri);
    }

    return this.client.post(serverUrl).then(function (response) {
      if (_this.config.platform === 'mobile') {
        _this.popup = _this.popup.open([current.authorizationEndpoint, _this.buildQueryString(response)].join('?'), current.name, current.popupOptions, current.redirectUri);
      } else {
        _this.popup.popupWindow.location = [current.authorizationEndpoint, _this.buildQueryString(response)].join('?');
      }

      var popupListener = _this.config.platform === 'mobile' ? _this.popup.eventListener(current.redirectUri) : _this.popup.pollPopup();

      return popupListener.then(function (result) {
        return _this.exchangeForToken(result, userData, current);
      });
    });
  };

  OAuth1.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, current) {
    var data = _authUtils.authUtils.extend({}, userData, oauthData);
    var exchangeForTokenUrl = this.config.baseUrl ? _authUtils.authUtils.joinUrl(this.config.baseUrl, current.url) : current.url;
    var credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.client.post(exchangeForTokenUrl, data, { credentials: credentials });
  };

  OAuth1.prototype.buildQueryString = function buildQueryString(obj) {
    var str = [];

    _authUtils.authUtils.forEach(obj, function (value, key) {
      return str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });

    return str.join('&');
  };

  return OAuth1;
}()) || _class);