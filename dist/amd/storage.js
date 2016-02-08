define(['exports', 'aurelia-dependency-injection', './baseConfig'], function (exports, _aureliaDependencyInjection, _baseConfig) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Storage = (function () {
    function Storage(config) {
      _classCallCheck(this, _Storage);

      this.config = config.current;
    }

    _createClass(Storage, [{
      key: 'get',
      value: function get(key) {
        var storageKey = this.config.storage;

        if (window[storageKey]) {
          return window[storageKey].getItem(key);
        }
      }
    }, {
      key: 'set',
      value: function set(key, value) {
        var storageKey = this.config.storage;

        if (window[storageKey]) {
          return window[storageKey].setItem(key, value);
        }
      }
    }, {
      key: 'remove',
      value: function remove(key) {
        var storageKey = this.config.storage;

        if (window[storageKey]) {
          return window[storageKey].removeItem(key);
        }
      }
    }]);

    var _Storage = Storage;
    Storage = (0, _aureliaDependencyInjection.inject)(_baseConfig.BaseConfig)(Storage) || Storage;
    return Storage;
  })();

  exports.Storage = Storage;
});