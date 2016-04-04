'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Authentication = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class;

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _baseConfig = require('./baseConfig');

var _storage = require('./storage');

var _authUtils = require('./authUtils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Authentication = exports.Authentication = (_dec = (0, _aureliaDependencyInjection.inject)(_storage.Storage, _baseConfig.BaseConfig), _dec(_class = function () {
  function Authentication(storage, config) {
    _classCallCheck(this, Authentication);

    this.storage = storage;
    this.config = config;
  }

  Authentication.prototype.getLoginRoute = function getLoginRoute() {
    return this.config.current.loginRoute;
  };

  Authentication.prototype.getLoginRedirect = function getLoginRedirect() {
    return this.config.current.loginRedirect;
  };

  Authentication.prototype.getLoginUrl = function getLoginUrl() {
    return this.config.current.baseUrl ? _authUtils.authUtils.joinUrl(this.config.current.baseUrl, this.config.current.loginUrl) : this.config.current.loginUrl;
  };

  Authentication.prototype.getSignupUrl = function getSignupUrl() {
    return this.config.current.baseUrl ? _authUtils.authUtils.joinUrl(this.config.current.baseUrl, this.config.current.signupUrl) : this.config.current.signupUrl;
  };

  Authentication.prototype.getProfileUrl = function getProfileUrl() {
    return this.config.current.baseUrl ? _authUtils.authUtils.joinUrl(this.config.current.baseUrl, this.config.current.profileUrl) : this.config.current.profileUrl;
  };

  Authentication.prototype.getToken = function getToken() {
    return this.storage.get(this.tokenName);
  };

  Authentication.prototype.getRefreshToken = function getRefreshToken() {
    return this.storage.get(this.refreshTokenName);
  };

  Authentication.prototype.getPayload = function getPayload() {
    var token = this.storage.get(this.tokenName);

    if (token && token.split('.').length === 3) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      try {
        return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
      } catch (error) {
        return null;
      }
    }
  };

  Authentication.prototype.setTokenFromResponse = function setTokenFromResponse(response, redirect) {
    var tokenName = this.tokenName;
    var accessToken = response && response[this.config.current.responseTokenProp];
    var token = void 0;

    if (accessToken) {
      if (_authUtils.authUtils.isObject(accessToken) && _authUtils.authUtils.isObject(accessToken.data)) {
        response = accessToken;
      } else if (_authUtils.authUtils.isString(accessToken)) {
        token = accessToken;
      }
    }

    if (!token && response) {
      token = this.config.current.tokenRoot && response[this.config.current.tokenRoot] ? response[this.config.current.tokenRoot][this.config.current.tokenName] : response[this.config.current.tokenName];
    }

    if (!token) {
      var tokenPath = this.config.current.tokenRoot ? this.config.current.tokenRoot + '.' + this.config.current.tokenName : this.config.current.tokenName;

      throw new Error('Expecting a token named "' + tokenPath + '" but instead got: ' + JSON.stringify(response));
    }

    this.storage.set(tokenName, token);

    if (this.config.current.loginRedirect && !redirect) {
      window.location.href = this.config.current.loginRedirect;
    } else if (redirect && _authUtils.authUtils.isString(redirect)) {
      window.location.href = window.encodeURI(redirect);
    }
  };

  Authentication.prototype.setRefreshTokenFromResponse = function setRefreshTokenFromResponse(response) {
    var refreshTokenName = this.refreshTokenName;
    var refreshToken = response && response.refresh_token;
    var refreshTokenPath = void 0;
    var token = void 0;

    if (refreshToken) {
      if (_authUtils.authUtils.isObject(refreshToken) && _authUtils.authUtils.isObject(refreshToken.data)) {
        response = refreshToken;
      } else if (_authUtils.authUtils.isString(refreshToken)) {
        token = refreshToken;
      }
    }

    if (!token && response) {
      token = this.config.current.refreshTokenRoot && response[this.config.current.refreshTokenRoot] ? response[this.config.current.refreshTokenRoot][this.config.current.refreshTokenName] : response[this.config.current.refreshTokenName];
    }
    if (!token) {
      refreshTokenPath = this.config.current.refreshTokenRoot ? this.config.current.refreshTokenRoot + '.' + this.config.current.refreshTokenName : this.config.current.refreshTokenName;

      throw new Error('Expecting a refresh token named "' + refreshTokenPath + '" but instead got: ' + JSON.stringify(response.content));
    }

    this.storage.set(refreshTokenName, token);
  };

  Authentication.prototype.removeToken = function removeToken() {
    this.storage.remove(this.tokenName);
  };

  Authentication.prototype.removeRefreshToken = function removeRefreshToken() {
    this.storage.remove(this.refreshTokenName);
  };

  Authentication.prototype.isAuthenticated = function isAuthenticated() {
    var token = this.storage.get(this.tokenName);

    if (!token) {
      return false;
    }

    if (token.split('.').length !== 3) {
      return true;
    }

    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var exp = void 0;

    try {
      exp = JSON.parse(window.atob(base64)).exp;
    } catch (error) {
      return false;
    }

    if (exp) {
      return Math.round(new Date().getTime() / 1000) <= exp;
    }

    return true;
  };

  Authentication.prototype.isTokenExpired = function isTokenExpired() {
    var payload = this.getPayload();
    var exp = payload ? payload.exp : null;
    if (exp) {
      return Math.round(new Date().getTime() / 1000) > exp;
    }

    return undefined;
  };

  Authentication.prototype.logout = function logout(redirect) {
    var _this = this;

    return new Promise(function (resolve) {
      _this.storage.remove(_this.tokenName);
      _this.storage.remove(_this.refreshTokenName);

      if (_this.config.current.logoutRedirect && !redirect) {
        window.location.href = _this.config.current.logoutRedirect;
      } else if (_authUtils.authUtils.isString(redirect)) {
        window.location.href = redirect;
      }

      resolve();
    });
  };

  _createClass(Authentication, [{
    key: 'refreshTokenName',
    get: function get() {
      return this.config.current.refreshTokenPrefix ? this.config.current.refreshTokenPrefix + '_' + this.config.current.refreshTokenName : this.config.current.refreshTokenName;
    }
  }, {
    key: 'tokenName',
    get: function get() {
      return this.config.current.tokenPrefix ? this.config.current.tokenPrefix + '_' + this.config.current.tokenName : this.config.current.tokenName;
    }
  }]);

  return Authentication;
}()) || _class);