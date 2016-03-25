define(['exports', 'aurelia-dependency-injection', './baseConfig'], function (exports, _aureliaDependencyInjection, _baseConfig) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Storage = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Storage = exports.Storage = (_dec = (0, _aureliaDependencyInjection.inject)(_baseConfig.BaseConfig), _dec(_class = function () {
    function Storage(config) {
      _classCallCheck(this, Storage);

      this.config = config.current;
    }

    Storage.prototype.get = function get(key) {
      var storageKey = this.config.storage;

      if (window[storageKey]) {
        return window[storageKey].getItem(key);
      }
    };

    Storage.prototype.set = function set(key, value) {
      var storageKey = this.config.storage;

      if (window[storageKey]) {
        return window[storageKey].setItem(key, value);
      }
    };

    Storage.prototype.remove = function remove(key) {
      var storageKey = this.config.storage;

      if (window[storageKey]) {
        return window[storageKey].removeItem(key);
      }
    };

    return Storage;
  }()) || _class);
});