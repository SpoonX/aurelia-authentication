'use strict';

System.register([], function (_export, _context) {
  "use strict";

  var AuthFilterValueConverter;

  

  return {
    setters: [],
    execute: function () {
      _export('AuthFilterValueConverter', AuthFilterValueConverter = function () {
        function AuthFilterValueConverter() {
          
        }

        AuthFilterValueConverter.prototype.toView = function toView(routes, isAuthenticated) {
          return routes.filter(function (route) {
            return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
          });
        };

        return AuthFilterValueConverter;
      }());

      _export('AuthFilterValueConverter', AuthFilterValueConverter);
    }
  };
});