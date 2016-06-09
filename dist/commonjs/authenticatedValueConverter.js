'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticatedValueConverter = undefined;

var _dec, _class;

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaAuthentication = require('./aurelia-authentication');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthenticatedValueConverter = exports.AuthenticatedValueConverter = (_dec = (0, _aureliaDependencyInjection.inject)(_aureliaAuthentication.AuthService), _dec(_class = function () {
  function AuthenticatedValueConverter(authService) {
    _classCallCheck(this, AuthenticatedValueConverter);

    this.authService = authService;
  }

  AuthenticatedValueConverter.prototype.toView = function toView() {
    return this.authService.authenticated;
  };

  return AuthenticatedValueConverter;
}()) || _class);