var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _dec2, _class2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class3, _desc, _value, _class4, _dec10, _class5, _dec11, _dec12, _class6, _desc2, _value2, _class7, _dec13, _class10, _dec14, _class11, _dec15, _class12, _dec16, _class13;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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



import * as LogManager from 'aurelia-logging';
import extend from 'extend';
import jwtDecode from 'jwt-decode';
import { PLATFORM, DOM } from 'aurelia-pal';
import { HttpClient } from 'aurelia-fetch-client';
import { Config, Rest } from 'aurelia-api';
import { inject } from 'aurelia-dependency-injection';
import { Redirect } from 'aurelia-router';
import { deprecated } from 'aurelia-metadata';
import { join, buildQueryString, parseQueryString } from 'aurelia-path';

import './authFilterValueConverter';

export function configure(aurelia, config) {
  if (!PLATFORM.location.origin) {
    PLATFORM.location.origin = PLATFORM.location.protocol + '//' + PLATFORM.location.hostname + (PLATFORM.location.port ? ':' + PLATFORM.location.port : '');
  }

  var baseConfig = aurelia.container.get(BaseConfig);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
    baseConfig.configure(config);
  }

  for (var _iterator = baseConfig.globalValueConverters, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var converter = _ref;

    aurelia.globalResources('./' + converter);
    LogManager.getLogger('authentication').info('Add globalResources value-converter: ' + converter);
  }
  var fetchConfig = aurelia.container.get(FetchConfig);
  var clientConfig = aurelia.container.get(Config);

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
    } else if (baseConfig.endpoint instanceof HttpClient) {
      client = new Rest(baseConfig.endpoint);
    }
  }

  if (!(client instanceof Rest)) {
    client = new Rest(aurelia.container.get(HttpClient));
  }

  baseConfig.client = client;
}

export var Auth0Lock = (_dec = inject(Storage, BaseConfig), _dec(_class = function () {
  function Auth0Lock(storage, config) {
    _classCallCheck(this, Auth0Lock);

    this.storage = storage;
    this.config = config;
    this.defaults = {
      name: null,
      state: null,
      scope: null,
      scopeDelimiter: null,
      redirectUri: null,
      clientId: null,
      clientDomain: null,
      display: 'popup',
      lockOptions: {
        popup: true
      },
      popupOptions: null,
      responseType: 'token'
    };
  }

  Auth0Lock.prototype.open = function open(options, userData) {
    var _this = this;

    if (typeof PLATFORM.global.Auth0Lock !== 'function') {
      throw new Error('Auth0Lock was not found in global scope. Please load it before using this provider.');
    }
    var provider = extend(true, {}, this.defaults, options);
    var stateName = provider.name + '_state';

    if (typeof provider.state === 'function') {
      this.storage.set(stateName, provider.state());
    } else if (typeof provider.state === 'string') {
      this.storage.set(stateName, provider.state);
    }

    this.lock = this.lock || new PLATFORM.global.Auth0Lock(provider.clientId, provider.clientDomain);

    var openPopup = new Promise(function (resolve, reject) {
      var opts = provider.lockOptions;
      opts.popupOptions = provider.popupOptions;
      opts.responseType = provider.responseType;
      opts.callbackURL = provider.redirectUri;
      opts.authParams = opts.authParams || {};
      if (provider.scope) opts.authParams.scope = provider.scope;
      if (provider.state) opts.authParams.state = _this.storage.get(provider.name + '_state');

      _this.lock.show(provider.lockOptions, function (err, profile, tokenOrCode) {
        if (err) {
          reject(err);
        } else {
          resolve({
            access_token: tokenOrCode
          });
        }
      });
    });

    return openPopup.then(function (lockResponse) {
      if (provider.responseType === 'token' || provider.responseType === 'id_token%20token' || provider.responseType === 'token%20id_token') {
        return lockResponse;
      }

      throw new Error('Only `token` responseType is supported');
    });
  };

  return Auth0Lock;
}()) || _class);

export var AuthenticateStep = (_dec2 = inject(AuthService), _dec2(_class2 = function () {
  function AuthenticateStep(authService) {
    

    this.authService = authService;
  }

  AuthenticateStep.prototype.run = function run(routingContext, next) {
    var isLoggedIn = this.authService.authenticated;
    var loginRoute = this.authService.config.loginRoute;

    if (routingContext.getAllInstructions().some(function (route) {
      return route.config.auth === true;
    })) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(function (route) {
      return route.fragment === loginRoute;
    })) {
      return next.cancel(new Redirect(this.authService.config.loginRedirect));
    }

    return next();
  };

  return AuthenticateStep;
}()) || _class2);

export var Authentication = (_dec3 = inject(Storage, BaseConfig, OAuth1, OAuth2, Auth0Lock), _dec4 = deprecated({ message: 'Use baseConfig.loginRoute instead.' }), _dec5 = deprecated({ message: 'Use baseConfig.loginRedirect instead.' }), _dec6 = deprecated({ message: 'Use baseConfig.joinBase(baseConfig.loginUrl) instead.' }), _dec7 = deprecated({ message: 'Use baseConfig.joinBase(baseConfig.signupUrl) instead.' }), _dec8 = deprecated({ message: 'Use baseConfig.joinBase(baseConfig.profileUrl) instead.' }), _dec9 = deprecated({ message: 'Use .getAccessToken() instead.' }), _dec3(_class3 = (_class4 = function () {
  function Authentication(storage, config, oAuth1, oAuth2, auth0Lock) {
    

    this.storage = storage;
    this.config = config;
    this.oAuth1 = oAuth1;
    this.oAuth2 = oAuth2;
    this.auth0Lock = auth0Lock;
    this.updateTokenCallstack = [];
    this.accessToken = null;
    this.refreshToken = null;
    this.payload = null;
    this.exp = null;
    this.hasDataStored = false;
  }

  Authentication.prototype.getLoginRoute = function getLoginRoute() {
    return this.config.loginRoute;
  };

  Authentication.prototype.getLoginRedirect = function getLoginRedirect() {
    return this.config.loginRedirect;
  };

  Authentication.prototype.getLoginUrl = function getLoginUrl() {
    return this.Config.joinBase(this.config.loginUrl);
  };

  Authentication.prototype.getSignupUrl = function getSignupUrl() {
    return this.Config.joinBase(this.config.signupUrl);
  };

  Authentication.prototype.getProfileUrl = function getProfileUrl() {
    return this.Config.joinBase(this.config.profileUrl);
  };

  Authentication.prototype.getToken = function getToken() {
    return this.getAccessToken();
  };

  Authentication.prototype.getResponseObject = function getResponseObject() {
    return JSON.parse(this.storage.get(this.config.storageKey));
  };

  Authentication.prototype.setResponseObject = function setResponseObject(response) {
    if (response) {
      this.getDataFromResponse(response);
      this.storage.set(this.config.storageKey, JSON.stringify(response));
      return;
    }
    this.accessToken = null;
    this.refreshToken = null;
    this.payload = null;
    this.exp = null;

    this.hasDataStored = false;

    this.storage.remove(this.config.storageKey);
  };

  Authentication.prototype.getAccessToken = function getAccessToken() {
    if (!this.hasDataStored) this.getDataFromResponse(this.getResponseObject());
    return this.accessToken;
  };

  Authentication.prototype.getRefreshToken = function getRefreshToken() {
    if (!this.hasDataStored) this.getDataFromResponse(this.getResponseObject());
    return this.refreshToken;
  };

  Authentication.prototype.getPayload = function getPayload() {
    if (!this.hasDataStored) this.getDataFromResponse(this.getResponseObject());
    return this.payload;
  };

  Authentication.prototype.getExp = function getExp() {
    if (!this.hasDataStored) this.getDataFromResponse(this.getResponseObject());
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

    this.payload = null;

    try {
      this.payload = this.accessToken ? jwtDecode(this.accessToken) : null;
    } catch (_) {
      _;
    }

    this.exp = this.payload ? parseInt(this.payload.exp, 10) : NaN;

    this.hasDataStored = true;

    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      payload: this.payload,
      exp: this.exp
    };
  };

  Authentication.prototype.getTokenFromResponse = function getTokenFromResponse(response, tokenProp, tokenName, tokenRoot) {
    if (!response) return undefined;

    var responseTokenProp = tokenProp.split('.').reduce(function (o, x) {
      return o[x];
    }, response);

    if (typeof responseTokenProp === 'string') {
      return responseTokenProp;
    }

    if ((typeof responseTokenProp === 'undefined' ? 'undefined' : _typeof(responseTokenProp)) === 'object') {
      var tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function (o, x) {
        return o[x];
      }, responseTokenProp);
      var _token = tokenRootData ? tokenRootData[tokenName] : responseTokenProp[tokenName];

      if (!_token) throw new Error('Token not found in response');

      return _token;
    }

    var token = response[tokenName] === undefined ? null : response[tokenName];

    if (!token) throw new Error('Token not found in response');

    return token;
  };

  Authentication.prototype.toUpdateTokenCallstack = function toUpdateTokenCallstack() {
    var _this2 = this;

    return new Promise(function (resolve) {
      return _this2.updateTokenCallstack.push(resolve);
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

    var oauthType = this.config.providers[name].type;

    if (oauthType) {
      LogManager.getLogger('authentication').warn('DEPRECATED: Setting provider.type is deprecated and replaced by provider.oauthType');
    } else {
      oauthType = this.config.providers[name].oauthType;
    }

    var providerLogin = void 0;
    if (oauthType === 'auth0-lock') {
      providerLogin = this.auth0Lock;
    } else {
      providerLogin = oauthType === '1.0' ? this.oAuth1 : this.oAuth2;
    }

    return providerLogin.open(this.config.providers[name], userData);
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
      PLATFORM.location.href = encodeURI(redirectUrl);
    } else if (defaultRedirectUrl) {
      PLATFORM.location.href = defaultRedirectUrl;
    }
  };

  _createClass(Authentication, [{
    key: 'responseObject',
    get: function get() {
      LogManager.getLogger('authentication').warn('Getter Authentication.responseObject is deprecated. Use Authentication.getResponseObject() instead.');
      return this.getResponseObject();
    },
    set: function set(response) {
      LogManager.getLogger('authentication').warn('Setter Authentication.responseObject is deprecated. Use AuthServive.setResponseObject(response) instead.');
      this.setResponseObject(response);
    }
  }]);

  return Authentication;
}(), (_applyDecoratedDescriptor(_class4.prototype, 'getLoginRoute', [_dec4], Object.getOwnPropertyDescriptor(_class4.prototype, 'getLoginRoute'), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, 'getLoginRedirect', [_dec5], Object.getOwnPropertyDescriptor(_class4.prototype, 'getLoginRedirect'), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, 'getLoginUrl', [_dec6], Object.getOwnPropertyDescriptor(_class4.prototype, 'getLoginUrl'), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, 'getSignupUrl', [_dec7], Object.getOwnPropertyDescriptor(_class4.prototype, 'getSignupUrl'), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, 'getProfileUrl', [_dec8], Object.getOwnPropertyDescriptor(_class4.prototype, 'getProfileUrl'), _class4.prototype), _applyDecoratedDescriptor(_class4.prototype, 'getToken', [_dec9], Object.getOwnPropertyDescriptor(_class4.prototype, 'getToken'), _class4.prototype)), _class4)) || _class3);

export var AuthorizeStep = (_dec10 = inject(AuthService), _dec10(_class5 = function () {
  function AuthorizeStep(authService) {
    

    LogManager.getLogger('authentication').warn('AuthorizeStep is deprecated. Use AuthenticationStep instead.');

    this.authService = authService;
  }

  AuthorizeStep.prototype.run = function run(routingContext, next) {
    var isLoggedIn = this.authService.isAuthenticated();
    var loginRoute = this.authService.config.loginRoute;

    if (routingContext.getAllInstructions().some(function (route) {
      return route.config.auth;
    })) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(function (route) {
      return route.fragment === loginRoute;
    })) {
      return next.cancel(new Redirect(this.authService.config.loginRedirect));
    }

    return next();
  };

  return AuthorizeStep;
}()) || _class5);

export var AuthService = (_dec11 = inject(Authentication, BaseConfig), _dec12 = deprecated({ message: 'Use .getAccessToken() instead.' }), _dec11(_class6 = (_class7 = function () {
  function AuthService(authentication, config) {
    

    this.authenticated = false;
    this.timeoutID = 0;

    this.authentication = authentication;
    this.config = config;

    var oldStorageKey = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;
    var oldToken = authentication.storage.get(oldStorageKey);

    if (oldToken) {
      LogManager.getLogger('authentication').info('Found token with deprecated format in storage. Converting it to new format. No further action required.');
      var fakeOldResponse = {};
      fakeOldResponse[config.accessTokenProp] = oldToken;
      this.setResponseObject(fakeOldResponse);
      authentication.storage.remove(oldStorageKey);
    }

    this.setResponseObject(this.authentication.getResponseObject());
  }

  AuthService.prototype.setTimeout = function setTimeout(ttl) {
    var _this3 = this;

    this.clearTimeout();

    this.timeoutID = PLATFORM.global.setTimeout(function () {
      if (_this3.config.autoUpdateToken && _this3.authentication.getAccessToken() && _this3.authentication.getRefreshToken()) {
        _this3.updateToken();
      } else {
        _this3.logout(_this3.config.expiredRedirect);
      }
    }, ttl);
  };

  AuthService.prototype.clearTimeout = function clearTimeout() {
    if (this.timeoutID) {
      PLATFORM.global.clearTimeout(this.timeoutID);
    }
    this.timeoutID = 0;
  };

  AuthService.prototype.setResponseObject = function setResponseObject(response) {
    this.clearTimeout();

    this.authentication.setResponseObject(response);

    this.authenticated = this.authentication.isAuthenticated();
    if (this.authenticated && !Number.isNaN(this.authentication.exp)) {
      this.setTimeout(this.getTtl() * 1000);
    }
  };

  AuthService.prototype.getMe = function getMe(criteriaOrId) {
    if (typeof criteriaOrId === 'string' || typeof criteriaOrId === 'number') {
      criteriaOrId = { id: criteriaOrId };
    }
    return this.client.find(this.config.joinBase(this.config.profileUrl), criteriaOrId);
  };

  AuthService.prototype.updateMe = function updateMe(body, criteriaOrId) {
    if (typeof criteriaOrId === 'string' || typeof criteriaOrId === 'number') {
      criteriaOrId = { id: criteriaOrId };
    }
    if (this.config.profileMethod === 'put') {
      return this.client.update(this.config.joinBase(this.config.profileUrl), criteriaOrId, body);
    }
    return this.client.patch(this.config.joinBase(this.config.profileUrl), criteriaOrId, body);
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

  AuthService.prototype.getExp = function getExp() {
    return this.authentication.getExp();
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
    var _this4 = this;

    if (!this.authentication.getRefreshToken()) {
      return Promise.reject(new Error('refreshToken not set'));
    }

    if (this.authentication.updateTokenCallstack.length === 0) {
      var content = {
        grant_type: 'refresh_token',
        refresh_token: this.authentication.getRefreshToken(),
        client_id: this.config.clientId ? this.config.clientId : undefined
      };

      this.client.post(this.config.joinBase(this.config.refreshTokenUrl ? this.config.refreshTokenUrl : this.config.loginUrl), content).then(function (response) {
        _this4.setResponseObject(response);
        _this4.authentication.resolveUpdateTokenCallstack(_this4.isAuthenticated());
      }).catch(function (err) {
        _this4.setResponseObject(null);
        _this4.authentication.resolveUpdateTokenCallstack(Promise.reject(err));
      });
    }

    return this.authentication.toUpdateTokenCallstack();
  };

  AuthService.prototype.signup = function signup(displayNameOrCredentials, emailOrOptions, passwordOrRedirectUri, options, redirectUri) {
    var _this5 = this;

    var content = void 0;

    if (_typeof(arguments[0]) === 'object') {
      content = arguments[0];
      options = arguments[1];
      redirectUri = arguments[2];
    } else {
      content = {
        'displayName': displayNameOrCredentials,
        'email': emailOrOptions,
        'password': passwordOrRedirectUri
      };
    }
    return this.client.post(this.config.joinBase(this.config.signupUrl), content, options).then(function (response) {
      if (_this5.config.loginOnSignup) {
        _this5.setResponseObject(response);
      }
      _this5.authentication.redirect(redirectUri, _this5.config.signupRedirect);

      return response;
    });
  };

  AuthService.prototype.login = function login(emailOrCredentials, passwordOrOptions, optionsOrRedirectUri, redirectUri) {
    var _this6 = this;

    var content = void 0;

    if (_typeof(arguments[0]) === 'object') {
      content = arguments[0];
      optionsOrRedirectUri = arguments[1];
      redirectUri = arguments[2];
    } else {
      content = {
        'email': emailOrCredentials,
        'password': passwordOrOptions
      };
      optionsOrRedirectUri = optionsOrRedirectUri;
    }

    if (this.config.clientId) {
      content.client_id = this.config.clientId;
    }

    return this.client.post(this.config.joinBase(this.config.loginUrl), content, optionsOrRedirectUri).then(function (response) {
      _this6.setResponseObject(response);

      _this6.authentication.redirect(redirectUri, _this6.config.loginRedirect);

      return response;
    });
  };

  AuthService.prototype.logout = function logout(redirectUri) {
    var _this7 = this;

    var localLogout = function localLogout(response) {
      return new Promise(function (resolve) {
        _this7.setResponseObject(null);

        _this7.authentication.redirect(redirectUri, _this7.config.logoutRedirect);

        if (typeof _this7.onLogout === 'function') {
          _this7.onLogout(response);
        }

        resolve(response);
      });
    };

    return this.config.logoutUrl ? this.client.request(this.config.logoutMethod, this.config.joinBase(this.config.logoutUrl)).then(localLogout) : localLogout();
  };

  AuthService.prototype.authenticate = function authenticate(name, redirectUri) {
    var _this8 = this;

    var userData = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return this.authentication.authenticate(name, userData).then(function (response) {
      _this8.setResponseObject(response);

      _this8.authentication.redirect(redirectUri, _this8.config.loginRedirect);

      return response;
    });
  };

  AuthService.prototype.unlink = function unlink(name, redirectUri) {
    var _this9 = this;

    var unlinkUrl = this.config.joinBase(this.config.unlinkUrl) + name;
    return this.client.request(this.config.unlinkMethod, unlinkUrl).then(function (response) {
      _this9.authentication.redirect(redirectUri);

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
}(), (_applyDecoratedDescriptor(_class7.prototype, 'getCurrentToken', [_dec12], Object.getOwnPropertyDescriptor(_class7.prototype, 'getCurrentToken'), _class7.prototype)), _class7)) || _class6);

export var BaseConfig = function () {
  function BaseConfig() {
    

    this.client = null;
    this.endpoint = null;
    this.configureEndpoints = null;
    this.loginRedirect = '#/';
    this.logoutRedirect = '#/';
    this.loginRoute = '/login';
    this.loginOnSignup = true;
    this.signupRedirect = '#/login';
    this.expiredRedirect = 0;
    this.baseUrl = '';
    this.loginUrl = '/auth/login';
    this.logoutUrl = null;
    this.logoutMethod = 'get';
    this.signupUrl = '/auth/signup';
    this.profileUrl = '/auth/me';
    this.profileMethod = 'put';
    this.unlinkUrl = '/auth/unlink/';
    this.unlinkMethod = 'get';
    this.refreshTokenUrl = null;
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
    this.globalValueConverters = ['authFilterValueConverter'];
    this.providers = {
      facebook: {
        name: 'facebook',
        url: '/auth/facebook',
        authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
        redirectUri: PLATFORM.location.origin + '/',
        requiredUrlParams: ['display', 'scope'],
        scope: ['email'],
        scopeDelimiter: ',',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 580, height: 400 }
      },
      google: {
        name: 'google',
        url: '/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: PLATFORM.location.origin,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: ['profile', 'email'],
        scopePrefix: 'openid',
        scopeDelimiter: ' ',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 452, height: 633 },
        state: randomState
      },
      github: {
        name: 'github',
        url: '/auth/github',
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        redirectUri: PLATFORM.location.origin,
        optionalUrlParams: ['scope'],
        scope: ['user:email'],
        scopeDelimiter: ' ',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 }
      },
      instagram: {
        name: 'instagram',
        url: '/auth/instagram',
        authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
        redirectUri: PLATFORM.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['basic'],
        scopeDelimiter: '+',
        oauthType: '2.0'
      },
      linkedin: {
        name: 'linkedin',
        url: '/auth/linkedin',
        authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
        redirectUri: PLATFORM.location.origin,
        requiredUrlParams: ['state'],
        scope: ['r_emailaddress'],
        scopeDelimiter: ' ',
        state: 'STATE',
        oauthType: '2.0',
        popupOptions: { width: 527, height: 582 }
      },
      twitter: {
        name: 'twitter',
        url: '/auth/twitter',
        authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
        redirectUri: PLATFORM.location.origin,
        oauthType: '1.0',
        popupOptions: { width: 495, height: 645 }
      },
      twitch: {
        name: 'twitch',
        url: '/auth/twitch',
        authorizationEndpoint: 'https://api.twitch.tv/kraken/oauth2/authorize',
        redirectUri: PLATFORM.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['user_read'],
        scopeDelimiter: ' ',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 500, height: 560 }
      },
      live: {
        name: 'live',
        url: '/auth/live',
        authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
        redirectUri: PLATFORM.location.origin,
        requiredUrlParams: ['display', 'scope'],
        scope: ['wl.emails'],
        scopeDelimiter: ' ',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 500, height: 560 }
      },
      yahoo: {
        name: 'yahoo',
        url: '/auth/yahoo',
        authorizationEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
        redirectUri: PLATFORM.location.origin,
        scope: [],
        scopeDelimiter: ',',
        oauthType: '2.0',
        popupOptions: { width: 559, height: 519 }
      },
      bitbucket: {
        name: 'bitbucket',
        url: '/auth/bitbucket',
        authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
        redirectUri: PLATFORM.location.origin + '/',
        requiredUrlParams: ['scope'],
        scope: ['email'],
        scopeDelimiter: ' ',
        oauthType: '2.0',
        popupOptions: { width: 1028, height: 529 }
      },
      auth0: {
        name: 'auth0',
        oauthType: 'auth0-lock',
        clientId: 'your_client_id',
        clientDomain: 'your_domain_url',
        display: 'popup',
        lockOptions: {
          popup: true
        },
        responseType: 'token',
        state: randomState
      }
    };
    this._authToken = 'Bearer';
    this._responseTokenProp = 'access_token';
    this._tokenName = 'token';
    this._tokenRoot = false;
    this._tokenPrefix = 'aurelia';
  }

  BaseConfig.prototype.joinBase = function joinBase(url) {
    return join(this.baseUrl, url);
  };

  BaseConfig.prototype.configure = function configure(incomming) {
    for (var key in incomming) {
      var value = incomming[key];
      if (value !== undefined) {
        if (Array.isArray(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null) {
          this[key] = value;
        } else {
          extend(true, this[key], value);
        }
      }
    }
  };

  _createClass(BaseConfig, [{
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
  }, {
    key: 'current',
    get: function get() {
      LogManager.getLogger('authentication').warn('Getter BaseConfig.current is deprecated. Use BaseConfig directly instead.');
      return this;
    },
    set: function set(_) {
      throw new Error('Setter BaseConfig.current is obsolete. Use BaseConfig directly instead.');
    }
  }, {
    key: '_current',
    get: function get() {
      LogManager.getLogger('authentication').warn('Getter BaseConfig._current is deprecated. Use BaseConfig directly instead.');
      return this;
    },
    set: function set(_) {
      throw new Error('Setter BaseConfig._current is obsolete. Use BaseConfig directly instead.');
    }
  }]);

  return BaseConfig;
}();

function randomState() {
  var rand = Math.random().toString(36).substr(2);
  return encodeURIComponent(rand);
}

export var FetchConfig = (_dec13 = inject(HttpClient, Config, AuthService, BaseConfig), _dec13(_class10 = function () {
  function FetchConfig(httpClient, clientConfig, authService, config) {
    

    this.httpClient = httpClient;
    this.clientConfig = clientConfig;
    this.authService = authService;
    this.config = config;
  }

  FetchConfig.prototype.configure = function configure(client) {
    var _this10 = this;

    if (Array.isArray(client)) {
      var _ret = function () {
        var configuredClients = [];
        client.forEach(function (toConfigure) {
          configuredClients.push(_this10.configure(toConfigure));
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
    } else if (client instanceof Rest) {
      client = client.client;
    } else if (!(client instanceof HttpClient)) {
      client = this.httpClient;
    }

    client.interceptors.push(this.interceptor);

    return client;
  };

  _createClass(FetchConfig, [{
    key: 'interceptor',
    get: function get() {
      var _this11 = this;

      return {
        request: function request(_request) {
          if (!_this11.config.httpInterceptor || !_this11.authService.isAuthenticated()) {
            return _request;
          }
          var token = _this11.authService.getAccessToken();

          if (_this11.config.authTokenType) {
            token = _this11.config.authTokenType + ' ' + token;
          }

          _request.headers.set(_this11.config.authHeader, token);

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
            if (!_this11.config.httpInterceptor || !_this11.authService.isTokenExpired()) {
              return resolve(_response);
            }
            if (!_this11.config.useRefreshToken || !_this11.authService.getRefreshToken()) {
              return resolve(_response);
            }

            return _this11.authService.updateToken().then(function () {
              var token = _this11.authService.getAccessToken();

              if (_this11.config.authTokenType) {
                token = _this11.config.authTokenType + ' ' + token;
              }

              request.headers.set(_this11.config.authHeader, token);

              return _this11.client.fetch(request).then(resolve);
            });
          });
        }
      };
    }
  }]);

  return FetchConfig;
}()) || _class10);

export var OAuth1 = (_dec14 = inject(Storage, Popup, BaseConfig), _dec14(_class11 = function () {
  function OAuth1(storage, popup, config) {
    

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
    var _this12 = this;

    var provider = extend(true, {}, this.defaults, options);
    var serverUrl = this.config.joinBase(provider.url);

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', provider.name, provider.popupOptions);
    }

    return this.config.client.post(serverUrl).then(function (response) {
      var url = provider.authorizationEndpoint + '?' + buildQueryString(response);

      if (_this12.config.platform === 'mobile') {
        _this12.popup = _this12.popup.open(url, provider.name, provider.popupOptions);
      } else {
        _this12.popup.popupWindow.location = url;
      }

      var popupListener = _this12.config.platform === 'mobile' ? _this12.popup.eventListener(provider.redirectUri) : _this12.popup.pollPopup();

      return popupListener.then(function (result) {
        return _this12.exchangeForToken(result, userData, provider);
      });
    });
  };

  OAuth1.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, provider) {
    var data = extend(true, {}, userData, oauthData);
    var serverUrl = this.config.joinBase(provider.url);
    var credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, { credentials: credentials });
  };

  return OAuth1;
}()) || _class11);

export var OAuth2 = (_dec15 = inject(Storage, Popup, BaseConfig), _dec15(_class12 = function () {
  function OAuth2(storage, popup, config) {
    

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
    var _this13 = this;

    var provider = extend(true, {}, this.defaults, options);
    var stateName = provider.name + '_state';

    if (typeof provider.state === 'function') {
      this.storage.set(stateName, provider.state());
    } else if (typeof provider.state === 'string') {
      this.storage.set(stateName, provider.state);
    }

    var url = provider.authorizationEndpoint + '?' + buildQueryString(this.buildQuery(provider));
    var popup = this.popup.open(url, provider.name, provider.popupOptions);
    var openPopup = this.config.platform === 'mobile' ? popup.eventListener(provider.redirectUri) : popup.pollPopup();

    return openPopup.then(function (oauthData) {
      if (provider.responseType === 'token' || provider.responseType === 'id_token%20token' || provider.responseType === 'token%20id_token') {
        return oauthData;
      }
      if (oauthData.state && oauthData.state !== _this13.storage.get(stateName)) {
        return Promise.reject('OAuth 2.0 state parameter mismatch.');
      }
      return _this13.exchangeForToken(oauthData, userData, provider);
    });
  };

  OAuth2.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, provider) {
    var data = extend(true, {}, userData, {
      clientId: provider.clientId,
      redirectUri: provider.redirectUri
    }, oauthData);

    var serverUrl = this.config.joinBase(provider.url);
    var credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, { credentials: credentials });
  };

  OAuth2.prototype.buildQuery = function buildQuery(provider) {
    var _this14 = this;

    var query = {};
    var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

    urlParams.forEach(function (params) {
      (provider[params] || []).forEach(function (paramName) {
        var camelizedName = camelCase(paramName);
        var paramValue = typeof provider[paramName] === 'function' ? provider[paramName]() : provider[camelizedName];

        if (paramName === 'state') {
          paramValue = encodeURIComponent(_this14.storage.get(provider.name + '_state'));
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
}()) || _class12);

var camelCase = function camelCase(name) {
  return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  });
};

export var Popup = function () {
  function Popup() {
    

    this.popupWindow = null;
    this.polling = null;
    this.url = '';
  }

  Popup.prototype.open = function open(url, windowName, options) {
    this.url = url;
    var optionsString = buildPopupWindowOptions(options || {});

    this.popupWindow = PLATFORM.global.open(url, windowName, optionsString);

    if (this.popupWindow && this.popupWindow.focus) {
      this.popupWindow.focus();
    }

    return this;
  };

  Popup.prototype.eventListener = function eventListener(redirectUri) {
    var _this15 = this;

    return new Promise(function (resolve, reject) {
      _this15.popupWindow.addEventListener('loadstart', function (event) {
        if (event.url.indexOf(redirectUri) !== 0) {
          return;
        }

        var parser = DOM.createElement('a');
        parser.href = event.url;

        if (parser.search || parser.hash) {
          var qs = parseUrl(parser);

          if (qs.error) {
            reject({ error: qs.error });
          } else {
            resolve(qs);
          }

          _this15.popupWindow.close();
        }
      });

      _this15.popupWindow.addEventListener('exit', function () {
        reject({ data: 'Provider Popup was closed' });
      });

      _this15.popupWindow.addEventListener('loaderror', function () {
        reject({ data: 'Authorization Failed' });
      });
    });
  };

  Popup.prototype.pollPopup = function pollPopup() {
    var _this16 = this;

    return new Promise(function (resolve, reject) {
      _this16.polling = PLATFORM.global.setInterval(function () {
        var errorData = void 0;

        try {
          if (_this16.popupWindow.location.host === PLATFORM.global.document.location.host && (_this16.popupWindow.location.search || _this16.popupWindow.location.hash)) {
            var qs = parseUrl(_this16.popupWindow.location);

            if (qs.error) {
              reject({ error: qs.error });
            } else {
              resolve(qs);
            }

            _this16.popupWindow.close();
            PLATFORM.global.clearInterval(_this16.polling);
          }
        } catch (error) {
          errorData = error;
        }

        if (!_this16.popupWindow) {
          PLATFORM.global.clearInterval(_this16.polling);
          reject({
            error: errorData,
            data: 'Provider Popup Blocked'
          });
        } else if (_this16.popupWindow.closed) {
          PLATFORM.global.clearInterval(_this16.polling);
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

  var extended = extend({
    width: width,
    height: height,
    left: PLATFORM.global.screenX + (PLATFORM.global.outerWidth - width) / 2,
    top: PLATFORM.global.screenY + (PLATFORM.global.outerHeight - height) / 2.5
  }, options);

  var parts = [];
  Object.keys(extended).map(function (key) {
    return parts.push(key + '=' + extended[key]);
  });

  return parts.join(',');
};

var parseUrl = function parseUrl(url) {
  return extend(true, {}, parseQueryString(url.search), parseQueryString(url.hash));
};

export var Storage = (_dec16 = inject(BaseConfig), _dec16(_class13 = function () {
  function Storage(config) {
    

    this.config = config;
  }

  Storage.prototype.get = function get(key) {
    return PLATFORM.global[this.config.storage].getItem(key);
  };

  Storage.prototype.set = function set(key, value) {
    PLATFORM.global[this.config.storage].setItem(key, value);
  };

  Storage.prototype.remove = function remove(key) {
    PLATFORM.global[this.config.storage].removeItem(key);
  };

  return Storage;
}()) || _class13);