define(['exports', 'aurelia-dependency-injection', './aurelia-authentication', 'aurelia-router'], function (exports, _aureliaDependencyInjection, _aureliaAuthentication, _aureliaRouter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AuthenticatedFilterValueConverter = undefined;

  

  var _dec, _class;

  var AuthenticatedFilterValueConverter = exports.AuthenticatedFilterValueConverter = (_dec = (0, _aureliaDependencyInjection.inject)(_aureliaAuthentication.AuthService), _dec(_class = function () {
    function AuthenticatedFilterValueConverter(authService) {
      

      this.authService = authService;
    }

    AuthenticatedFilterValueConverter.prototype.toView = function toView(routes) {
      var isAuthenticated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.authService.authenticated;

      return routes.filter(function (route) {
        return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
      });
    };

    return AuthenticatedFilterValueConverter;
  }()) || _class);
});