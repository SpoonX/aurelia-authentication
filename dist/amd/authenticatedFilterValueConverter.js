define(['exports', 'aurelia-dependency-injection', './aurelia-authentication'], function (exports, _aureliaDependencyInjection, _aureliaAuthentication) {
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
      var isAuthenticated = arguments.length <= 1 || arguments[1] === undefined ? this.authService.authenticated : arguments[1];

      return routes.filter(function (route) {
        return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
      });
    };

    return AuthenticatedFilterValueConverter;
  }()) || _class);
});