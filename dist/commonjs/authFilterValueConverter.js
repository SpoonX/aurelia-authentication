'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthFilterValueConverter = undefined;

var _aureliaRouter = require('aurelia-router');



var AuthFilterValueConverter = exports.AuthFilterValueConverter = function () {
  function AuthFilterValueConverter() {
    
  }

  AuthFilterValueConverter.prototype.toView = function toView(routes, isAuthenticated) {
    return routes.filter(function (route) {
      return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
    });
  };

  return AuthFilterValueConverter;
}();