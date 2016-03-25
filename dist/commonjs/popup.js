'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = undefined;

var _dec, _class;

var _authUtils = require('./authUtils');

var _baseConfig = require('./baseConfig');

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Popup = exports.Popup = (_dec = (0, _aureliaDependencyInjection.inject)(_baseConfig.BaseConfig), _dec(_class = function () {
  function Popup(config) {
    _classCallCheck(this, Popup);

    this.config = config.current;
    this.popupWindow = null;
    this.polling = null;
    this.url = '';
  }

  Popup.prototype.open = function open(url, windowName, options, redirectUri) {
    this.url = url;
    var optionsString = this.stringifyOptions(this.prepareOptions(options || {}));

    this.popupWindow = window.open(url, windowName, optionsString);

    if (this.popupWindow && this.popupWindow.focus) {
      this.popupWindow.focus();
    }

    return this;
  };

  Popup.prototype.eventListener = function eventListener(redirectUri) {
    var _this = this;

    var promise = new Promise(function (resolve, reject) {
      _this.popupWindow.addEventListener('loadstart', function (event) {
        if (event.url.indexOf(redirectUri) !== 0) {
          return;
        }

        var parser = document.createElement('a');
        parser.href = event.url;

        if (parser.search || parser.hash) {
          var queryParams = parser.search.substring(1).replace(/\/$/, '');
          var hashParams = parser.hash.substring(1).replace(/\/$/, '');
          var hash = _authUtils.authUtils.parseQueryString(hashParams);
          var qs = _authUtils.authUtils.parseQueryString(queryParams);

          _authUtils.authUtils.extend(qs, hash);

          if (qs.error) {
            reject({
              error: qs.error
            });
          } else {
            resolve(qs);
          }

          _this.popupWindow.close();
        }
      });

      _this.popupWindow.addEventListener('exit', function () {
        reject({
          data: 'Provider Popup was closed'
        });
      });

      _this.popupWindow.addEventListener('loaderror', function () {
        deferred.reject({
          data: 'Authorization Failed'
        });
      });
    });

    return promise;
  };

  Popup.prototype.pollPopup = function pollPopup() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _this2.polling = setInterval(function () {
        var errorData = void 0;

        try {
          var documentOrigin = document.location.host;
          var popupWindowOrigin = _this2.popupWindow.location.host;

          if (popupWindowOrigin === documentOrigin && (_this2.popupWindow.location.search || _this2.popupWindow.location.hash)) {
            var queryParams = _this2.popupWindow.location.search.substring(1).replace(/\/$/, '');
            var hashParams = _this2.popupWindow.location.hash.substring(1).replace(/[\/$]/, '');
            var hash = _authUtils.authUtils.parseQueryString(hashParams);
            var qs = _authUtils.authUtils.parseQueryString(queryParams);

            _authUtils.authUtils.extend(qs, hash);

            if (qs.error) {
              reject({
                error: qs.error
              });
            } else {
              resolve(qs);
            }

            _this2.popupWindow.close();
            clearInterval(_this2.polling);
          }
        } catch (error) {
          errorData = error;
        }

        if (!_this2.popupWindow) {
          clearInterval(_this2.polling);
          reject({
            error: errorData,
            data: 'Provider Popup Blocked'
          });
        } else if (_this2.popupWindow.closed) {
          clearInterval(_this2.polling);
          reject({
            error: errorData,
            data: 'Problem poll popup'
          });
        }
      }, 35);
    });
  };

  Popup.prototype.prepareOptions = function prepareOptions(options) {
    var width = options.width || 500;
    var height = options.height || 500;

    return _authUtils.authUtils.extend({
      width: width,
      height: height,
      left: window.screenX + (window.outerWidth - width) / 2,
      top: window.screenY + (window.outerHeight - height) / 2.5
    }, options);
  };

  Popup.prototype.stringifyOptions = function stringifyOptions(options) {
    var parts = [];
    _authUtils.authUtils.forEach(options, function (value, key) {
      return parts.push(key + '=' + value);
    });
    return parts.join(',');
  };

  return Popup;
}()) || _class);