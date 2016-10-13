'use strict';

System.register(['aurelia-dependency-injection', './aurelia-authentication', 'aurelia-router'], function (_export, _context) {
  "use strict";

  var inject, AuthService, RouteConfig, _dec, _class, AuthenticatedFilterValueConverter;

  

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_aureliaAuthentication) {
      AuthService = _aureliaAuthentication.AuthService;
    }, function (_aureliaRouter) {
      RouteConfig = _aureliaRouter.RouteConfig;
    }],
    execute: function () {
      _export('AuthenticatedFilterValueConverter', AuthenticatedFilterValueConverter = (_dec = inject(AuthService), _dec(_class = function () {
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
      }()) || _class));

      _export('AuthenticatedFilterValueConverter', AuthenticatedFilterValueConverter);
    }
  };
});