'use strict';

System.register(['aurelia-dependency-injection', './aurelia-authentication'], function (_export, _context) {
  "use strict";

  var inject, AuthService, _dec, _class, AuthenticatedFilterValueConverter;

  

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_aureliaAuthentication) {
      AuthService = _aureliaAuthentication.AuthService;
    }],
    execute: function () {
      _export('AuthenticatedFilterValueConverter', AuthenticatedFilterValueConverter = (_dec = inject(AuthService), _dec(_class = function () {
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
      }()) || _class));

      _export('AuthenticatedFilterValueConverter', AuthenticatedFilterValueConverter);
    }
  };
});