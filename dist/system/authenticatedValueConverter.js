'use strict';

System.register(['aurelia-dependency-injection', './aurelia-authentication'], function (_export, _context) {
  var inject, AuthService, _dec, _class, AuthenticatedValueConverter;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_aureliaAuthentication) {
      AuthService = _aureliaAuthentication.AuthService;
    }],
    execute: function () {
      _export('AuthenticatedValueConverter', AuthenticatedValueConverter = (_dec = inject(AuthService), _dec(_class = function () {
        function AuthenticatedValueConverter(authService) {
          _classCallCheck(this, AuthenticatedValueConverter);

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