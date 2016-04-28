define(['exports', 'extend', 'aurelia-logging', 'aurelia-path', 'aurelia-dependency-injection', 'aurelia-metadata', 'aurelia-router', 'aurelia-fetch-client', 'aurelia-api', './authFilter'], function (exports, _extend, _aureliaLogging, _aureliaPath, _aureliaDependencyInjection, _aureliaMetadata, _aureliaRouter, _aureliaFetchClient, _aureliaApi) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = exports.FetchConfig = exports.AuthorizeStep = exports.AuthService = exports.Authentication = exports.OAuth2 = exports.OAuth1 = exports.Storage = exports.BaseConfig = exports.Popup = undefined;

  var _extend2 = _interopRequireDefault(_extend);

  var LogManager = _interopRequireWildcard(_aureliaLogging);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  var _dec, _class2, _dec2, _class3, _dec3, _class4, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class5, _desc, _value, _class6, _dec11, _dec12, _class7, _desc2, _value2, _class8, _dec13, _class9, _dec14, _class10;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Popup = exports.Popup = function () {
    function Popup() {
      _classCallCheck(this, Popup);

      this.popupWindow = null;
      this.polling = null;
      this.url = '';
    }

    Popup.prototype.open = function open(url, windowName, options, redirectUri) {
      this.url = url;
      var optionsString = buildPopupWindowOptions(options || {});

      this.popupWindow = window.open(url, windowName, optionsString);

      if (this.popupWindow && this.popupWindow.focus) {
        this.popupWindow.focus();
      }

      return this;
    };

    Popup.prototype.eventListener = function eventListener(redirectUri) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.popupWindow.addEventListener('loadstart', function (event) {
          if (event.url.indexOf(redirectUri) !== 0) {
            return;
          }

          var parser = document.createElement('a');
          parser.href = event.url;

          if (parser.search || parser.hash) {
            var qs = parseUrl(parser);

            if (qs.error) {
              reject({ error: qs.error });
            } else {
              resolve(qs);
            }

            _this.popupWindow.close();
          }
        });

        _this.popupWindow.addEventListener('exit', function () {
          reject({ data: 'Provider Popup was closed' });
        });

        _this.popupWindow.addEventListener('loaderror', function () {
          reject({ data: 'Authorization Failed' });
        });
      });
    };

    Popup.prototype.pollPopup = function pollPopup() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.polling = setInterval(function () {
          var errorData = void 0;

          try {
            if (_this2.popupWindow.location.host === document.location.host && (_this2.popupWindow.location.search || _this2.popupWindow.location.hash)) {
              var qs = parseUrl(_this2.popupWindow.location);

              if (qs.error) {
                reject({ error: qs.error });
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

    return Popup;
  }();

  var buildPopupWindowOptions = function buildPopupWindowOptions(options) {
    var width = options.width || 500;
    var height = options.height || 500;

    var extended = (0, _extend2.default)({
      width: width,
      height: height,
      left: window.screenX + (window.outerWidth - width) / 2,
      top: window.screenY + (window.outerHeight - height) / 2.5
    }, options);

    var parts = [];
    Object.keys(extended).map(function (key) {
      return parts.push(key + '=' + extended[key]);
    });

    return parts.join(',');
  };

  var parseUrl = function parseUrl(url) {
    return (0, _extend2.default)(true, {}, (0, _aureliaPath.parseQueryString)(url.search), (0, _aureliaPath.parseQueryString)(url.hash));
  };

  var BaseConfig = exports.BaseConfig = function () {
    function BaseConfig() {
      _classCallCheck(this, BaseConfig);

      this.client = null;
      this.endpoint = null;
      this.configureEndpoints = null;
      this.loginRedirect = '#/customer';
      this.logoutRedirect = '#/';
      this.loginRoute = '/login';
      this.loginOnSignup = true;
      this.signupRedirect = '#/login';
      this.baseUrl = '';
      this.loginUrl = '/auth/login';
      this.signupUrl = '/auth/signup';
      this.profileUrl = '/auth/me';
      this.unlinkUrl = '/auth/unlink/';
      this.unlinkMethod = 'get';
      this.authHeader = 'Authorization';
      this.authTokenType = 'Bearer';
      this.accessTokenProp = 'access_token';
      this.accessTokenName = 'token';
      this.accessTokenRoot = false;
      this.useRefreshToken = false;
      this.autoUpdateToken = true;
      this.clientId = false;
      this.refreshTokenProp = 'refresh_token';
      this.refreshTokenName = 'token';
      this.refreshTokenRoot = false;
      this.httpInterceptor = true;
      this.withCredentials = true;
      this.platform = 'browser';
      this.storage = 'localStorage';
      this.storageKey = 'aurelia_authentication';
      this.providers = {
        google: {
          name: 'google',
          url: '/auth/google',
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
          redirectUri: encodeURI(window.location.origin || window.location.protocol + '//' + window.location.host),
          scope: ['profile', 'email'],
          scopePrefix: 'openid',
          scopeDelimiter: ' ',
          requiredUrlParams: ['scope'],
          optionalUrlParams: ['display'],
          display: 'popup',
          type: '2.0',
          popupOptions: {
            width: 452,
            height: 633
          }
        },
        facebook: {
          name: 'facebook',
          url: '/auth/facebook',
          authorizationEndpoint: 'https://www.facebook.com/v2.3/dialog/oauth',
          redirectUri: encodeURI(window.location.origin + '/' || window.location.protocol + '//' + window.location.host + '/'),
          scope: ['email'],
          scopeDelimiter: ',',
          nonce: function nonce() {
            return Math.random();
          },
          requiredUrlParams: ['nonce', 'display', 'scope'],
          display: 'popup',
          type: '2.0',
          popupOptions: {
            width: 580,
            height: 400
          }
        },
        linkedin: {
          name: 'linkedin',
          url: '/auth/linkedin',
          authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
          redirectUri: encodeURI(window.location.origin || window.location.protocol + '//' + window.location.host),
          requiredUrlParams: ['state'],
          scope: ['r_emailaddress'],
          scopeDelimiter: ' ',
          state: 'STATE',
          type: '2.0',
          popupOptions: {
            width: 527,
            height: 582
          }
        },
        github: {
          name: 'github',
          url: '/auth/github',
          authorizationEndpoint: 'https://github.com/login/oauth/authorize',
          redirectUri: encodeURI(window.location.origin || window.location.protocol + '//' + window.location.host),
          optionalUrlParams: ['scope'],
          scope: ['user:email'],
          scopeDelimiter: ' ',
          type: '2.0',
          popupOptions: {
            width: 1020,
            height: 618
          }
        },
        yahoo: {
          name: 'yahoo',
          url: '/auth/yahoo',
          authorizationEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
          redirectUri: encodeURI(window.location.origin || window.location.protocol + '//' + window.location.host),
          scope: [],
          scopeDelimiter: ',',
          type: '2.0',
          popupOptions: {
            width: 559,
            height: 519
          }
        },
        twitter: {
          name: 'twitter',
          url: '/auth/twitter',
          authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
          type: '1.0',
          popupOptions: {
            width: 495,
            height: 645
          }
        },
        live: {
          name: 'live',
          url: '/auth/live',
          authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
          redirectUri: encodeURI(window.location.origin || window.location.protocol + '//' + window.location.host),
          scope: ['wl.emails'],
          scopeDelimiter: ' ',
          requiredUrlParams: ['display', 'scope'],
          display: 'popup',
          type: '2.0',
          popupOptions: {
            width: 500,
            height: 560
          }
        },
        instagram: {
          name: 'instagram',
          url: '/auth/instagram',
          authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
          redirectUri: encodeURI(window.location.origin || window.location.protocol + '//' + window.location.host),
          requiredUrlParams: ['scope'],
          scope: ['basic'],
          scopeDelimiter: '+',
          display: 'popup',
          type: '2.0',
          popupOptions: {
            width: 550,
            height: 369
          }
        }
      };
      this._authToken = 'Bearer';
      this._responseTokenProp = 'access_token';
      this._tokenName = 'token';
      this._tokenRoot = false;
      this._tokenPrefix = 'aurelia';
    }

    BaseConfig.prototype.withBase = function withBase(url) {
      return (0, _aureliaPath.join)(this.baseUrl, url);
    };

    BaseConfig.prototype.configure = function configure(incomming) {
      for (var key in incomming) {
        var value = incomming[key];
        if (value !== undefined) {
          if (Array.isArray(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null) {
            this[key] = value;
          } else {
            (0, _extend2.default)(true, this[key], value);
          }
        }
      }
    };

    _createClass(BaseConfig, [{
      key: 'current',
      get: function get() {
        LogManager.getLogger('authentication').warn('BaseConfig.current() is deprecated. Use BaseConfig directly instead.');
        return this;
      }
    }, {
      key: 'authToken',
      set: function set(authToken) {
        LogManager.getLogger('authentication').warn('BaseConfig.authToken is deprecated. Use BaseConfig.authTokenType instead.');
        this._authTokenType = authToken;
        this.authTokenType = authToken;
        return authToken;
      },
      get: function get() {
        return this._authTokenType;
      }
    }, {
      key: 'responseTokenProp',
      set: function set(responseTokenProp) {
        LogManager.getLogger('authentication').warn('BaseConfig.responseTokenProp is deprecated. Use BaseConfig.accessTokenProp instead.');
        this._responseTokenProp = responseTokenProp;
        this.accessTokenProp = responseTokenProp;
        return responseTokenProp;
      },
      get: function get() {
        return this._responseTokenProp;
      }
    }, {
      key: 'tokenRoot',
      set: function set(tokenRoot) {
        LogManager.getLogger('authentication').warn('BaseConfig.tokenRoot is deprecated. Use BaseConfig.accessTokenRoot instead.');
        this._tokenRoot = tokenRoot;
        this.accessTokenRoot = tokenRoot;
        return tokenRoot;
      },
      get: function get() {
        return this._tokenRoot;
      }
    }, {
      key: 'tokenName',
      set: function set(tokenName) {
        LogManager.getLogger('authentication').warn('BaseConfig.tokenName is deprecated. Use BaseConfig.accessTokenName instead.');
        this._tokenName = tokenName;
        this.accessTokenName = tokenName;
        return tokenName;
      },
      get: function get() {
        return this._tokenName;
      }
    }, {
      key: 'tokenPrefix',
      set: function set(tokenPrefix) {
        LogManager.getLogger('authentication').warn('BaseConfig.tokenPrefix is obsolete. Use BaseConfig.storageKey instead.');
        this._tokenPrefix = tokenPrefix;
        return tokenPrefix;
      },
      get: function get() {
        return this._tokenPrefix || 'aurelia';
      }
    }]);

    return BaseConfig;
  }();

  var Storage = exports.Storage = (_dec = (0, _aureliaDependencyInjection.inject)(BaseConfig), _dec(_class2 = function () {
    function Storage(config) {
      _classCallCheck(this, Storage);

      this.config = config;
    }

    Storage.prototype.get = function get(key) {
      if (window[this.config.storage]) {
        return window[this.config.storage].getItem(key);
      }
    };

    Storage.prototype.set = function set(key, value) {
      if (window[this.config.storage]) {
        return window[this.config.storage].setItem(key, value);
      }
    };

    Storage.prototype.remove = function remove(key) {
      if (window[this.config.storage]) {
        return window[this.config.storage].removeItem(key);
      }
    };

    return Storage;
  }()) || _class2);
  var OAuth1 = exports.OAuth1 = (_dec2 = (0, _aureliaDependencyInjection.inject)(Storage, Popup, BaseConfig), _dec2(_class3 = function () {
    function OAuth1(storage, popup, config) {
      _classCallCheck(this, OAuth1);

      this.storage = storage;
      this.config = config;
      this.popup = popup;
      this.defaults = {
        url: null,
        name: null,
        popupOptions: null,
        redirectUri: null,
        authorizationEndpoint: null
      };
    }

    OAuth1.prototype.open = function open(options, userData) {
      var _this3 = this;

      var provider = (0, _extend2.default)(true, {}, this.defaults, options);
      var serverUrl = this.config.withBase(provider.url);

      if (this.config.platform !== 'mobile') {
        this.popup = this.popup.open('', provider.name, provider.popupOptions, provider.redirectUri);
      }

      return this.config.client.post(serverUrl).then(function (response) {
        var url = provider.authorizationEndpoint + '?' + (0, _aureliaPath.buildQueryString)(response);

        if (_this3.config.platform === 'mobile') {
          _this3.popup = _this3.popup.open(url, provider.name, provider.popupOptions, provider.redirectUri);
        } else {
          _this3.popup.popupWindow.location = url;
        }

        var popupListener = _this3.config.platform === 'mobile' ? _this3.popup.eventListener(provider.redirectUri) : _this3.popup.pollPopup();

        return popupListener.then(function (result) {
          return _this3.exchangeForToken(result, userData, provider);
        });
      });
    };

    OAuth1.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, provider) {
      var data = (0, _extend2.default)(true, {}, userData, oauthData);
      var serverUrl = this.config.withBase(provider.url);
      var credentials = this.config.withCredentials ? 'include' : 'same-origin';

      return this.config.client.post(serverUrl, data, { credentials: credentials });
    };

    return OAuth1;
  }()) || _class3);
  var OAuth2 = exports.OAuth2 = (_dec3 = (0, _aureliaDependencyInjection.inject)(Storage, Popup, BaseConfig), _dec3(_class4 = function () {
    function OAuth2(storage, popup, config) {
      _classCallCheck(this, OAuth2);

      this.storage = storage;
      this.config = config;
      this.popup = popup;
      this.defaults = {
        url: null,
        name: null,
        state: null,
        scope: null,
        scopeDelimiter: null,
        redirectUri: null,
        popupOptions: null,
        authorizationEndpoint: null,
        responseParams: null,
        requiredUrlParams: null,
        optionalUrlParams: null,
        defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
        responseType: 'code'
      };
    }

    OAuth2.prototype.open = function open(options, userData) {
      var _this4 = this;

      var provider = (0, _extend2.default)(true, {}, this.defaults, options);
      var stateName = provider.name + '_state';

      if (typeof provider.state === 'function') {
        this.storage.set(stateName, provider.state());
      } else if (typeof provider.state === 'string') {
        this.storage.set(stateName, provider.state);
      }

      var url = provider.authorizationEndpoint + '?' + (0, _aureliaPath.buildQueryString)(this.buildQuery(provider));
      var popup = this.popup.open(url, provider.name, provider.popupOptions, provider.redirectUri);
      var openPopup = this.config.platform === 'mobile' ? popup.eventListener(provider.redirectUri) : popup.pollPopup();

      return openPopup.then(function (oauthData) {
        if (provider.responseType === 'token' || provider.responseType === 'id_token%20token' || provider.responseType === 'token%20id_token') {
          return oauthData;
        }
        if (oauthData.state && oauthData.state !== _this4.storage.get(stateName)) {
          return Promise.reject('OAuth 2.0 state parameter mismatch.');
        }
        return _this4.exchangeForToken(oauthData, userData, provider);
      });
    };

    OAuth2.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, provider) {
      var data = (0, _extend2.default)(true, {}, userData, {
        clientId: provider.clientId,
        redirectUri: provider.redirectUri
      }, oauthData);

      var serverUrl = this.config.withBase(provider.url);
      var credentials = this.config.withCredentials ? 'include' : 'same-origin';

      return this.config.client.post(serverUrl, data, { credentials: credentials });
    };

    OAuth2.prototype.buildQuery = function buildQuery(provider) {
      var _this5 = this;

      var query = {};
      var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

      urlParams.forEach(function (params) {
        (provider[params] || []).forEach(function (paramName) {
          var camelizedName = camelCase(paramName);
          var paramValue = typeof provider[paramName] === 'function' ? provider[paramName]() : provider[camelizedName];

          if (paramName === 'state') {
            paramValue = encodeURIComponent(_this5.storage.get(provider.name + '_state'));
          }

          if (paramName === 'scope' && Array.isArray(paramValue)) {
            paramValue = paramValue.join(provider.scopeDelimiter);

            if (provider.scopePrefix) {
              paramValue = provider.scopePrefix + provider.scopeDelimiter + paramValue;
            }
          }

          query[paramName] = paramValue;
        });
      });
      return query;
    };

    return OAuth2;
  }()) || _class4);


  var camelCase = function camelCase(name) {
    return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    });
  };

  var Authentication = exports.Authentication = (_dec4 = (0, _aureliaDependencyInjection.inject)(Storage, BaseConfig, OAuth1, OAuth2), _dec5 = (0, _aureliaMetadata.deprecated)({ message: 'Use baseConfig.loginRoute instead.' }), _dec6 = (0, _aureliaMetadata.deprecated)({ message: 'Use baseConfig.loginRedirect instead.' }), _dec7 = (0, _aureliaMetadata.deprecated)({ message: 'Use baseConfig.withBase(baseConfig.loginUrl) instead.' }), _dec8 = (0, _aureliaMetadata.deprecated)({ message: 'Use baseConfig.withBase(baseConfig.signupUrl) instead.' }), _dec9 = (0, _aureliaMetadata.deprecated)({ message: 'Use baseConfig.withBase(baseConfig.profileUrl) instead.' }), _dec10 = (0, _aureliaMetadata.deprecated)({ message: 'Use .getAccessToken() instead.' }), _dec4(_class5 = (_class6 = function () {
    function Authentication(storage, config, oAuth1, oAuth2) {
      _classCallCheck(this, Authentication);

      this.storage = storage;
      this.config = config;
      this.oAuth1 = oAuth1;
      this.oAuth2 = oAuth2;
      this.updateTokenCallstack = [];
      this.accessToken = null;
      this.refreshToken = null;
      this.payload = null;
      this.exp = null;
      this.hasDataStored = false;

      var oldStorageKey = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : this.tokenName;
      var oldToken = storage.get(oldStorageKey);

      if (oldToken) {
        LogManager.getLogger('authentication').info('Found token with deprecated format in storage. Converting it to new format. No further action required.');
        var fakeOldResponse = {};
        fakeOldResponse[config.accessTokenProp] = oldToken;
        this.responseObject = fakeOldResponse;
        storage.remove(oldStorageKey);
      }
    }

    Authentication.prototype.getLoginRoute = function getLoginRoute() {
      return this.config.loginRoute;
    };

    Authentication.prototype.getLoginRedirect = function getLoginRedirect() {
      return this.config.loginRedirect;
    };

    Authentication.prototype.getLoginUrl = function getLoginUrl() {
      return this.config.withBase(this.config.loginUrl);
    };

    Authentication.prototype.getSignupUrl = function getSignupUrl() {
      return this.config.withBase(this.config.signupUrl);
    };

    Authentication.prototype.getProfileUrl = function getProfileUrl() {
      return this.config.withBase(this.config.profileUrl);
    };

    Authentication.prototype.getToken = function getToken() {
      return this.getAccessToken();
    };

    Authentication.prototype.getAccessToken = function getAccessToken() {
      if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
      return this.accessToken;
    };

    Authentication.prototype.getRefreshToken = function getRefreshToken() {
      if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
      return this.refreshToken;
    };

    Authentication.prototype.getPayload = function getPayload() {
      if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
      return this.payload;
    };

    Authentication.prototype.getExp = function getExp() {
      if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
      return this.exp;
    };

    Authentication.prototype.getTtl = function getTtl() {
      var exp = this.getExp();
      return Number.isNaN(exp) ? NaN : exp - Math.round(new Date().getTime() / 1000);
    };

    Authentication.prototype.isTokenExpired = function isTokenExpired() {
      var timeLeft = this.getTtl();
      return Number.isNaN(timeLeft) ? undefined : timeLeft < 0;
    };

    Authentication.prototype.isAuthenticated = function isAuthenticated() {
      var isTokenExpired = this.isTokenExpired();
      if (isTokenExpired === undefined) return this.accessToken ? true : false;
      return !isTokenExpired;
    };

    Authentication.prototype.getDataFromResponse = function getDataFromResponse(response) {
      var config = this.config;

      this.accessToken = this.getTokenFromResponse(response, config.accessTokenProp, config.accessTokenName, config.accessTokenRoot);

      this.refreshToken = null;
      if (config.useRefreshToken) {
        try {
          this.refreshToken = this.getTokenFromResponse(response, config.refreshTokenProp, config.refreshTokenName, config.refreshTokenRoot);
        } catch (e) {
          this.refreshToken = null;
        }
      }

      var payload = null;

      if (this.accessToken && this.accessToken.split('.').length === 3) {
        try {
          var base64 = this.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        } catch (e) {
          payload = null;
        }
      }

      this.payload = payload;
      this.exp = payload ? parseInt(payload.exp, 10) : NaN;

      this.hasDataStored = true;

      return {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        payload: this.payload,
        exp: this.exp
      };
    };

    Authentication.prototype.deleteData = function deleteData() {
      this.accessToken = null;
      this.refreshToken = null;
      this.payload = null;
      this.exp = null;

      this.hasDataStored = false;
    };

    Authentication.prototype.getTokenFromResponse = function getTokenFromResponse(response, tokenProp, tokenName, tokenRoot) {
      if (!response) return undefined;

      var responseTokenProp = response[tokenProp];

      if (typeof responseTokenProp === 'string') {
        return responseTokenProp;
      }

      if ((typeof responseTokenProp === 'undefined' ? 'undefined' : _typeof(responseTokenProp)) === 'object') {
        var tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function (o, x) {
          return o[x];
        }, responseTokenProp);
        return tokenRootData ? tokenRootData[tokenName] : responseTokenProp[tokenName];
      }

      var token = response[tokenName] === undefined ? null : response[tokenName];

      if (!token) throw new Error('Token not found in response');

      return token;
    };

    Authentication.prototype.toUpdateTokenCallstack = function toUpdateTokenCallstack() {
      var _this6 = this;

      return new Promise(function (resolve) {
        return _this6.updateTokenCallstack.push(resolve);
      });
    };

    Authentication.prototype.resolveUpdateTokenCallstack = function resolveUpdateTokenCallstack(response) {
      this.updateTokenCallstack.map(function (resolve) {
        return resolve(response);
      });
      this.updateTokenCallstack = [];
    };

    Authentication.prototype.authenticate = function authenticate(name) {
      var userData = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var provider = this.config.providers[name].type === '1.0' ? this.oAuth1 : this.oAuth2;

      return provider.open(this.config.providers[name], userData);
    };

    Authentication.prototype.redirect = function redirect(redirectUrl, defaultRedirectUrl) {
      if (redirectUrl === true) {
        LogManager.getLogger('authentication').warn('DEPRECATED: Setting redirectUrl === true to actually *not redirect* is deprecated. Set redirectUrl === 0 instead.');
        return;
      }

      if (redirectUrl === false) {
        LogManager.getLogger('authentication').warn('BREAKING CHANGE: Setting redirectUrl === false to actually *do redirect* is deprecated. Set redirectUrl to undefined or null to use the defaultRedirectUrl if so desired.');
      }

      if (redirectUrl === 0) {
        return;
      }
      if (typeof redirectUrl === 'string') {
        window.location.href = window.encodeURI(redirectUrl);
      } else if (defaultRedirectUrl) {
        window.location.href = defaultRedirectUrl;
      }
    };

    _createClass(Authentication, [{
      key: 'responseObject',
      get: function get() {
        return JSON.parse(this.storage.get(this.config.storageKey || {}));
      },
      set: function set(response) {
        if (response) {
          this.getDataFromResponse(response);
          return this.storage.set(this.config.storageKey, JSON.stringify(response));
        }
        this.deleteData();
        return this.storage.remove(this.config.storageKey);
      }
    }]);

    return Authentication;
  }(), (_applyDecoratedDescriptor(_class6.prototype, 'getLoginRoute', [_dec5], Object.getOwnPropertyDescriptor(_class6.prototype, 'getLoginRoute'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getLoginRedirect', [_dec6], Object.getOwnPropertyDescriptor(_class6.prototype, 'getLoginRedirect'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getLoginUrl', [_dec7], Object.getOwnPropertyDescriptor(_class6.prototype, 'getLoginUrl'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getSignupUrl', [_dec8], Object.getOwnPropertyDescriptor(_class6.prototype, 'getSignupUrl'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getProfileUrl', [_dec9], Object.getOwnPropertyDescriptor(_class6.prototype, 'getProfileUrl'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getToken', [_dec10], Object.getOwnPropertyDescriptor(_class6.prototype, 'getToken'), _class6.prototype)), _class6)) || _class5);
  var AuthService = exports.AuthService = (_dec11 = (0, _aureliaDependencyInjection.inject)(Authentication, BaseConfig), _dec12 = (0, _aureliaMetadata.deprecated)({ message: 'Use .getAccessToken() instead.' }), _dec11(_class7 = (_class8 = function () {
    function AuthService(authentication, config) {
      _classCallCheck(this, AuthService);

      this.authentication = authentication;
      this.config = config;
    }

    AuthService.prototype.getMe = function getMe(criteria) {
      if (typeof criteria === 'string' || typeof criteria === 'number') {
        criteria = { id: criteria };
      }
      return this.client.find(this.config.withBase(this.config.profileUrl), criteria);
    };

    AuthService.prototype.updateMe = function updateMe(body, criteria) {
      if (typeof criteria === 'string' || typeof criteria === 'number') {
        criteria = { id: criteria };
      }
      return this.client.update(this.config.withBase(this.config.profileUrl), criteria, body);
    };

    AuthService.prototype.getAccessToken = function getAccessToken() {
      return this.authentication.getAccessToken();
    };

    AuthService.prototype.getCurrentToken = function getCurrentToken() {
      return this.getAccessToken();
    };

    AuthService.prototype.getRefreshToken = function getRefreshToken() {
      return this.authentication.getRefreshToken();
    };

    AuthService.prototype.isAuthenticated = function isAuthenticated() {
      var authenticated = this.authentication.isAuthenticated();

      if (!authenticated && this.config.autoUpdateToken && this.authentication.getAccessToken() && this.authentication.getRefreshToken()) {
        this.updateToken();
        authenticated = true;
      }

      return authenticated;
    };

    AuthService.prototype.getTtl = function getTtl() {
      return this.authentication.getTtl();
    };

    AuthService.prototype.isTokenExpired = function isTokenExpired() {
      return this.authentication.isTokenExpired();
    };

    AuthService.prototype.getTokenPayload = function getTokenPayload() {
      return this.authentication.getPayload();
    };

    AuthService.prototype.updateToken = function updateToken() {
      var _this7 = this;

      if (!this.authentication.getRefreshToken()) {
        return Promise.reject(new Error('refreshToken not set'));
      }

      if (this.authentication.updateTokenCallstack.length === 0) {
        var content = {
          grant_type: 'refresh_token',
          refresh_token: this.authentication.getRefreshToken(),
          client_id: this.config.clientId ? this.config.clientId : undefined
        };

        this.client.post(this.config.withBase(this.config.loginUrl), content).then(function (response) {
          _this7.authentication.responseObject = response;
          _this7.authentication.resolveUpdateTokenCallstack(_this7.authentication.isAuthenticated());
        }).catch(function (err) {
          _this7.authentication.responseObject = null;
          _this7.authentication.resolveUpdateTokenCallstack(Promise.reject(err));
        });
      }

      return this.authentication.toUpdateTokenCallstack();
    };

    AuthService.prototype.signup = function signup(displayName, email, password, options, redirectUri) {
      var _this8 = this;

      var content = void 0;

      if (_typeof(arguments[0]) === 'object') {
        content = arguments[0];
        options = arguments[1];
        redirectUri = arguments[2];
      } else {
        content = {
          'displayName': displayName,
          'email': email,
          'password': password
        };
      }
      return this.client.post(this.config.withBase(this.config.signupUrl), content, options).then(function (response) {
        if (_this8.config.loginOnSignup) {
          _this8.authentication.responseObject = response;
        }
        _this8.authentication.redirect(redirectUri, _this8.config.signupRedirect);

        return response;
      });
    };

    AuthService.prototype.login = function login(email, password, options, redirectUri) {
      var _this9 = this;

      var content = void 0;

      if (_typeof(arguments[0]) === 'object') {
        content = arguments[0];
        options = arguments[1];
        redirectUri = arguments[2];
      } else {
        content = {
          'email': email,
          'password': password
        };
        options = options;
      }

      if (this.config.clientId) {
        data.client_id = this.config.clientId;
      }

      return this.client.post(this.config.withBase(this.config.loginUrl), content, options).then(function (response) {
        _this9.authentication.responseObject = response;

        _this9.authentication.redirect(redirectUri, _this9.config.loginRedirect);

        return response;
      });
    };

    AuthService.prototype.logout = function logout(redirectUri) {
      var _this10 = this;

      return new Promise(function (resolve) {
        _this10.authentication.responseObject = null;

        _this10.authentication.redirect(redirectUri, _this10.config.logoutRedirect);

        resolve();
      });
    };

    AuthService.prototype.authenticate = function authenticate(name, redirectUri) {
      var _this11 = this;

      var userData = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return this.authentication.authenticate(name, userData).then(function (response) {
        _this11.authentication.responseObject = response;

        _this11.authentication.redirect(redirectUri, _this11.config.loginRedirect);

        return response;
      });
    };

    AuthService.prototype.unlink = function unlink(name, redirectUri) {
      var _this12 = this;

      var unlinkUrl = this.config.withBase(this.config.unlinkUrl) + name;
      return this.client.request(this.config.unlinkMethod, unlinkUrl).then(function (response) {
        _this12.authentication.redirect(redirectUri);

        return response;
      });
    };

    _createClass(AuthService, [{
      key: 'client',
      get: function get() {
        return this.config.client;
      }
    }, {
      key: 'auth',
      get: function get() {
        LogManager.getLogger('authentication').warn('AuthService.auth is deprecated. Use .authentication instead.');
        return this.authentication;
      }
    }]);

    return AuthService;
  }(), (_applyDecoratedDescriptor(_class8.prototype, 'getCurrentToken', [_dec12], Object.getOwnPropertyDescriptor(_class8.prototype, 'getCurrentToken'), _class8.prototype)), _class8)) || _class7);
  var AuthorizeStep = exports.AuthorizeStep = (_dec13 = (0, _aureliaDependencyInjection.inject)(Authentication), _dec13(_class9 = function () {
    function AuthorizeStep(authentication) {
      _classCallCheck(this, AuthorizeStep);

      this.authentication = authentication;
    }

    AuthorizeStep.prototype.run = function run(routingContext, next) {
      var isLoggedIn = this.authentication.isAuthenticated();
      var loginRoute = this.authentication.config.loginRoute;

      if (routingContext.getAllInstructions().some(function (i) {
        return i.config.auth;
      })) {
        if (!isLoggedIn) {
          return next.cancel(new _aureliaRouter.Redirect(loginRoute));
        }
      } else if (isLoggedIn && routingContext.getAllInstructions().some(function (i) {
        return i.fragment === loginRoute;
      })) {
        return next.cancel(new _aureliaRouter.Redirect(this.authentication.config.loginRedirect));
      }

      return next();
    };

    return AuthorizeStep;
  }()) || _class9);
  var FetchConfig = exports.FetchConfig = (_dec14 = (0, _aureliaDependencyInjection.inject)(_aureliaFetchClient.HttpClient, _aureliaApi.Config, AuthService, BaseConfig), _dec14(_class10 = function () {
    function FetchConfig(httpClient, clientConfig, authService, config) {
      _classCallCheck(this, FetchConfig);

      this.httpClient = httpClient;
      this.clientConfig = clientConfig;
      this.authService = authService;
      this.config = config;
    }

    FetchConfig.prototype.configure = function configure(client) {
      var _this13 = this;

      if (Array.isArray(client)) {
        var _ret = function () {
          var configuredClients = [];
          client.forEach(function (toConfigure) {
            configuredClients.push(_this13.configure(toConfigure));
          });

          return {
            v: configuredClients
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      if (typeof client === 'string') {
        var endpoint = this.clientConfig.getEndpoint(client);
        if (!endpoint) {
          throw new Error('There is no \'' + (client || 'default') + '\' endpoint registered.');
        }
        client = endpoint.client;
      } else if (client instanceof _aureliaApi.Rest) {
        client = client.client;
      } else if (!(client instanceof _aureliaFetchClient.HttpClient)) {
        client = this.httpClient;
      }

      client.interceptors.push(this.interceptor);

      return client;
    };

    _createClass(FetchConfig, [{
      key: 'interceptor',
      get: function get() {
        var _this14 = this;

        return {
          request: function request(_request) {
            if (!_this14.config.httpInterceptor || !_this14.authService.isAuthenticated()) {
              return _request;
            }
            var token = _this14.authService.getAccessToken();

            if (_this14.config.authTokenType) {
              token = _this14.config.authTokenType + ' ' + token;
            }

            _request.headers.set(_this14.config.authHeader, token);

            return _request;
          },
          response: function response(_response, request) {
            return new Promise(function (resolve, reject) {
              if (_response.ok) {
                return resolve(_response);
              }
              if (_response.status !== 401) {
                return resolve(_response);
              }
              if (!_this14.config.httpInterceptor || !_this14.authService.isTokenExpired()) {
                return resolve(_response);
              }
              if (!_this14.config.useRefreshToken || !_this14.authService.getRefreshToken()) {
                return resolve(_response);
              }

              _this14.authService.updateToken().then(function () {
                var token = _this14.authService.getAccessToken();

                if (_this14.config.authTokenType) {
                  token = _this14.config.authTokenType + ' ' + token;
                }

                request.headers.set(_this14.config.authHeader, token);

                return _this14.client.fetch(request).then(resolve);
              });
            });
          }
        };
      }
    }]);

    return FetchConfig;
  }()) || _class10);

  function configure(aurelia, config) {
    aurelia.globalResources('./authFilter');

    var baseConfig = aurelia.container.get(BaseConfig);

    if (typeof config === 'function') {
      config(baseConfig);
    } else if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
      baseConfig.configure(config);
    }

    var fetchConfig = aurelia.container.get(FetchConfig);
    var clientConfig = aurelia.container.get(_aureliaApi.Config);

    if (Array.isArray(baseConfig.configureEndpoints)) {
      baseConfig.configureEndpoints.forEach(function (endpointToPatch) {
        fetchConfig.configure(endpointToPatch);
      });
    }

    var client = void 0;

    if (baseConfig.endpoint !== null) {
      if (typeof baseConfig.endpoint === 'string') {
        var endpoint = clientConfig.getEndpoint(baseConfig.endpoint);
        if (!endpoint) {
          throw new Error('There is no \'' + (baseConfig.endpoint || 'default') + '\' endpoint registered.');
        }
        client = endpoint;
      } else if (baseConfig.endpoint instanceof _aureliaFetchClient.HttpClient) {
        client = new _aureliaApi.Rest(baseConfig.endpoint);
      }
    }

    if (!(client instanceof _aureliaApi.Rest)) {
      client = new _aureliaApi.Rest(aurelia.container.get(_aureliaFetchClient.HttpClient));
    }

    baseConfig.client = client;
  }

  exports.configure = configure;
  exports.FetchConfig = FetchConfig;
  exports.AuthService = AuthService;
  exports.AuthorizeStep = AuthorizeStep;
});