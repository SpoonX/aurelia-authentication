'use strict';

System.register(['aurelia-dependency-injection', './aurelia-authentication'], function (_export, _context) {
  "use strict";

  var inject, AuthService, _dec, _class, AuthenticatedValueConverter;

  

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_aureliaAuthentication) {
      AuthService = _aureliaAuthentication.AuthService;
    }],
    execute: function () {
      _export('AuthenticatedValueConverter', AuthenticatedValueConverter = (_dec = inject(AuthService), _dec(_class = function () {
        function AuthenticatedValueConverter(authService) {
          

          this.authService = authService;
        }

        AuthenticatedValueConverter.prototype.toView = function toView() {
          return this.authService.authenticated;
        };

        return AuthenticatedValueConverter;
      }()) || _class));

      _export('AuthenticatedValueConverter', AuthenticatedValueConverter);
    }
  };
});