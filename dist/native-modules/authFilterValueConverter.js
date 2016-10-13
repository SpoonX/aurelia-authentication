

import { RouteConfig } from 'aurelia-router';

export var AuthFilterValueConverter = function () {
  function AuthFilterValueConverter() {
    
  }

  AuthFilterValueConverter.prototype.toView = function toView(routes, isAuthenticated) {
    return routes.filter(function (route) {
      return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
    });
  };

  return AuthFilterValueConverter;
}();