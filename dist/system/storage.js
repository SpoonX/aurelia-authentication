'use strict';

System.register(['aurelia-dependency-injection', './baseConfig'], function (_export, _context) {
  var inject, BaseConfig, _dec, _class, Storage;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }],
    execute: function () {
      _export('Storage', Storage = (_dec = inject(BaseConfig), _dec(_class = function () {
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
      }()) || _class));

      _export('Storage', Storage);
    }
  };
});