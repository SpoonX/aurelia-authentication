define(['exports', 'aurelia-dependency-injection', './aurelia-authentication'], function (exports, _aureliaDependencyInjection, _aureliaAuthentication) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AuthenticatedValueConverter = undefined;

  

  var _dec, _class;

  var AuthenticatedValueConverter = exports.AuthenticatedValueConverter = (_dec = (0, _aureliaDependencyInjection.inject)(_aureliaAuthentication.AuthService), _dec(_class = function () {
    function AuthenticatedValueConverter(authService) {
      

      this.authService = authService;
    }

    AuthenticatedValueConverter.prototype.toView = function toView() {
      return this.authService.authenticated;
    };

    return AuthenticatedValueConverter;
  }()) || _class);
});