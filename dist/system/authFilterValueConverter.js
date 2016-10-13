'use strict';

System.register(['aurelia-router'], function (_export, _context) {
  "use strict";

  var RouteConfig, AuthFilterValueConverter;

  

  return {
    setters: [function (_aureliaRouter) {
      RouteConfig = _aureliaRouter.RouteConfig;
    }],
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