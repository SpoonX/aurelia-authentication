'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aureliaAuthentication = require('./aurelia-authentication');

Object.keys(_aureliaAuthentication).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaAuthentication[key];
    }
  });
});