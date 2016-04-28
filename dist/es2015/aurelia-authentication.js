var _dec, _class2, _dec2, _class3, _dec3, _class4, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class5, _desc, _value, _class6, _dec11, _dec12, _class7, _desc2, _value2, _class8, _dec13, _class9, _dec14, _class10;

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

import extend from 'extend';
import * as LogManager from 'aurelia-logging';
import { parseQueryString, join, buildQueryString } from 'aurelia-path';
import { inject } from 'aurelia-dependency-injection';
import { deprecated } from 'aurelia-metadata';
import { Redirect } from 'aurelia-router';
import { HttpClient } from 'aurelia-fetch-client';
import { Config, Rest } from 'aurelia-api';

export let Popup = class Popup {
  constructor() {
    this.popupWindow = null;
    this.polling = null;
    this.url = '';
  }

  open(url, windowName, options, redirectUri) {
    this.url = url;
    const optionsString = buildPopupWindowOptions(options || {});

    this.popupWindow = window.open(url, windowName, optionsString);

    if (this.popupWindow && this.popupWindow.focus) {
      this.popupWindow.focus();
    }

    return this;
  }

  eventListener(redirectUri) {
    return new Promise((resolve, reject) => {
      this.popupWindow.addEventListener('loadstart', event => {
        if (event.url.indexOf(redirectUri) !== 0) {
          return;
        }

        const parser = document.createElement('a');
        parser.href = event.url;

        if (parser.search || parser.hash) {
          const qs = parseUrl(parser);

          if (qs.error) {
            reject({ error: qs.error });
          } else {
            resolve(qs);
          }

          this.popupWindow.close();
        }
      });

      this.popupWindow.addEventListener('exit', () => {
        reject({ data: 'Provider Popup was closed' });
      });

      this.popupWindow.addEventListener('loaderror', () => {
        reject({ data: 'Authorization Failed' });
      });
    });
  }

  pollPopup() {
    return new Promise((resolve, reject) => {
      this.polling = setInterval(() => {
        let errorData;

        try {
          if (this.popupWindow.location.host === document.location.host && (this.popupWindow.location.search || this.popupWindow.location.hash)) {
            const qs = parseUrl(this.popupWindow.location);

            if (qs.error) {
              reject({ error: qs.error });
            } else {
              resolve(qs);
            }

            this.popupWindow.close();
            clearInterval(this.polling);
          }
        } catch (error) {
          errorData = error;
        }

        if (!this.popupWindow) {
          clearInterval(this.polling);
          reject({
            error: errorData,
            data: 'Provider Popup Blocked'
          });
        } else if (this.popupWindow.closed) {
          clearInterval(this.polling);
          reject({
            error: errorData,
            data: 'Problem poll popup'
          });
        }
      }, 35);
    });
  }
};

const buildPopupWindowOptions = options => {
  const width = options.width || 500;
  const height = options.height || 500;

  const extended = extend({
    width: width,
    height: height,
    left: window.screenX + (window.outerWidth - width) / 2,
    top: window.screenY + (window.outerHeight - height) / 2.5
  }, options);

  let parts = [];
  Object.keys(extended).map(key => parts.push(key + '=' + extended[key]));

  return parts.join(',');
};

const parseUrl = url => {
  return extend(true, {}, parseQueryString(url.search), parseQueryString(url.hash));
};

export let BaseConfig = class BaseConfig {
  constructor() {
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
        nonce: function () {
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

  withBase(url) {
    return join(this.baseUrl, url);
  }

  configure(incomming) {
    for (let key in incomming) {
      const value = incomming[key];
      if (value !== undefined) {
        if (Array.isArray(value) || typeof value !== 'object' || value === null) {
          this[key] = value;
        } else {
          extend(true, this[key], value);
        }
      }
    }
  }

  get current() {
    LogManager.getLogger('authentication').warn('BaseConfig.current() is deprecated. Use BaseConfig directly instead.');
    return this;
  }

  set authToken(authToken) {
    LogManager.getLogger('authentication').warn('BaseConfig.authToken is deprecated. Use BaseConfig.authTokenType instead.');
    this._authTokenType = authToken;
    this.authTokenType = authToken;
    return authToken;
  }
  get authToken() {
    return this._authTokenType;
  }

  set responseTokenProp(responseTokenProp) {
    LogManager.getLogger('authentication').warn('BaseConfig.responseTokenProp is deprecated. Use BaseConfig.accessTokenProp instead.');
    this._responseTokenProp = responseTokenProp;
    this.accessTokenProp = responseTokenProp;
    return responseTokenProp;
  }
  get responseTokenProp() {
    return this._responseTokenProp;
  }

  set tokenRoot(tokenRoot) {
    LogManager.getLogger('authentication').warn('BaseConfig.tokenRoot is deprecated. Use BaseConfig.accessTokenRoot instead.');
    this._tokenRoot = tokenRoot;
    this.accessTokenRoot = tokenRoot;
    return tokenRoot;
  }
  get tokenRoot() {
    return this._tokenRoot;
  }

  set tokenName(tokenName) {
    LogManager.getLogger('authentication').warn('BaseConfig.tokenName is deprecated. Use BaseConfig.accessTokenName instead.');
    this._tokenName = tokenName;
    this.accessTokenName = tokenName;
    return tokenName;
  }
  get tokenName() {
    return this._tokenName;
  }

  set tokenPrefix(tokenPrefix) {
    LogManager.getLogger('authentication').warn('BaseConfig.tokenPrefix is obsolete. Use BaseConfig.storageKey instead.');
    this._tokenPrefix = tokenPrefix;
    return tokenPrefix;
  }
  get tokenPrefix() {
    return this._tokenPrefix || 'aurelia';
  }
};

export let Storage = (_dec = inject(BaseConfig), _dec(_class2 = class Storage {
  constructor(config) {
    this.config = config;
  }

  get(key) {
    if (window[this.config.storage]) {
      return window[this.config.storage].getItem(key);
    }
  }

  set(key, value) {
    if (window[this.config.storage]) {
      return window[this.config.storage].setItem(key, value);
    }
  }

  remove(key) {
    if (window[this.config.storage]) {
      return window[this.config.storage].removeItem(key);
    }
  }
}) || _class2);

export let OAuth1 = (_dec2 = inject(Storage, Popup, BaseConfig), _dec2(_class3 = class OAuth1 {
  constructor(storage, popup, config) {
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

  open(options, userData) {
    const provider = extend(true, {}, this.defaults, options);
    const serverUrl = this.config.withBase(provider.url);

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', provider.name, provider.popupOptions, provider.redirectUri);
    }

    return this.config.client.post(serverUrl).then(response => {
      const url = provider.authorizationEndpoint + '?' + buildQueryString(response);

      if (this.config.platform === 'mobile') {
        this.popup = this.popup.open(url, provider.name, provider.popupOptions, provider.redirectUri);
      } else {
        this.popup.popupWindow.location = url;
      }

      const popupListener = this.config.platform === 'mobile' ? this.popup.eventListener(provider.redirectUri) : this.popup.pollPopup();

      return popupListener.then(result => this.exchangeForToken(result, userData, provider));
    });
  }

  exchangeForToken(oauthData, userData, provider) {
    const data = extend(true, {}, userData, oauthData);
    const serverUrl = this.config.withBase(provider.url);
    const credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, { credentials: credentials });
  }
}) || _class3);

export let OAuth2 = (_dec3 = inject(Storage, Popup, BaseConfig), _dec3(_class4 = class OAuth2 {
  constructor(storage, popup, config) {
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

  open(options, userData) {
    const provider = extend(true, {}, this.defaults, options);
    const stateName = provider.name + '_state';

    if (typeof provider.state === 'function') {
      this.storage.set(stateName, provider.state());
    } else if (typeof provider.state === 'string') {
      this.storage.set(stateName, provider.state);
    }

    const url = provider.authorizationEndpoint + '?' + buildQueryString(this.buildQuery(provider));
    const popup = this.popup.open(url, provider.name, provider.popupOptions, provider.redirectUri);
    const openPopup = this.config.platform === 'mobile' ? popup.eventListener(provider.redirectUri) : popup.pollPopup();

    return openPopup.then(oauthData => {
      if (provider.responseType === 'token' || provider.responseType === 'id_token%20token' || provider.responseType === 'token%20id_token') {
        return oauthData;
      }
      if (oauthData.state && oauthData.state !== this.storage.get(stateName)) {
        return Promise.reject('OAuth 2.0 state parameter mismatch.');
      }
      return this.exchangeForToken(oauthData, userData, provider);
    });
  }

  exchangeForToken(oauthData, userData, provider) {
    const data = extend(true, {}, userData, {
      clientId: provider.clientId,
      redirectUri: provider.redirectUri
    }, oauthData);

    const serverUrl = this.config.withBase(provider.url);
    const credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, { credentials: credentials });
  }

  buildQuery(provider) {
    let query = {};
    const urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

    urlParams.forEach(params => {
      (provider[params] || []).forEach(paramName => {
        const camelizedName = camelCase(paramName);
        let paramValue = typeof provider[paramName] === 'function' ? provider[paramName]() : provider[camelizedName];

        if (paramName === 'state') {
          paramValue = encodeURIComponent(this.storage.get(provider.name + '_state'));
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
  }
}) || _class4);

const camelCase = function (name) {
  return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  });
};

export let Authentication = (_dec4 = inject(Storage, BaseConfig, OAuth1, OAuth2), _dec5 = deprecated({ message: 'Use baseConfig.loginRoute instead.' }), _dec6 = deprecated({ message: 'Use baseConfig.loginRedirect instead.' }), _dec7 = deprecated({ message: 'Use baseConfig.withBase(baseConfig.loginUrl) instead.' }), _dec8 = deprecated({ message: 'Use baseConfig.withBase(baseConfig.signupUrl) instead.' }), _dec9 = deprecated({ message: 'Use baseConfig.withBase(baseConfig.profileUrl) instead.' }), _dec10 = deprecated({ message: 'Use .getAccessToken() instead.' }), _dec4(_class5 = (_class6 = class Authentication {
  constructor(storage, config, oAuth1, oAuth2) {
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

    const oldStorageKey = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : this.tokenName;
    const oldToken = storage.get(oldStorageKey);

    if (oldToken) {
      LogManager.getLogger('authentication').info('Found token with deprecated format in storage. Converting it to new format. No further action required.');
      let fakeOldResponse = {};
      fakeOldResponse[config.accessTokenProp] = oldToken;
      this.responseObject = fakeOldResponse;
      storage.remove(oldStorageKey);
    }
  }

  getLoginRoute() {
    return this.config.loginRoute;
  }

  getLoginRedirect() {
    return this.config.loginRedirect;
  }

  getLoginUrl() {
    return this.config.withBase(this.config.loginUrl);
  }

  getSignupUrl() {
    return this.config.withBase(this.config.signupUrl);
  }

  getProfileUrl() {
    return this.config.withBase(this.config.profileUrl);
  }

  getToken() {
    return this.getAccessToken();
  }

  get responseObject() {
    return JSON.parse(this.storage.get(this.config.storageKey || {}));
  }

  set responseObject(response) {
    if (response) {
      this.getDataFromResponse(response);
      return this.storage.set(this.config.storageKey, JSON.stringify(response));
    }
    this.deleteData();
    return this.storage.remove(this.config.storageKey);
  }

  getAccessToken() {
    if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
    return this.accessToken;
  }

  getRefreshToken() {
    if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
    return this.refreshToken;
  }

  getPayload() {
    if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
    return this.payload;
  }

  getExp() {
    if (!this.hasDataStored) this.getDataFromResponse(this.responseObject);
    return this.exp;
  }

  getTtl() {
    const exp = this.getExp();
    return Number.isNaN(exp) ? NaN : exp - Math.round(new Date().getTime() / 1000);
  }

  isTokenExpired() {
    const timeLeft = this.getTtl();
    return Number.isNaN(timeLeft) ? undefined : timeLeft < 0;
  }

  isAuthenticated() {
    const isTokenExpired = this.isTokenExpired();
    if (isTokenExpired === undefined) return this.accessToken ? true : false;
    return !isTokenExpired;
  }

  getDataFromResponse(response) {
    const config = this.config;

    this.accessToken = this.getTokenFromResponse(response, config.accessTokenProp, config.accessTokenName, config.accessTokenRoot);

    this.refreshToken = null;
    if (config.useRefreshToken) {
      try {
        this.refreshToken = this.getTokenFromResponse(response, config.refreshTokenProp, config.refreshTokenName, config.refreshTokenRoot);
      } catch (e) {
        this.refreshToken = null;
      }
    }

    let payload = null;

    if (this.accessToken && this.accessToken.split('.').length === 3) {
      try {
        const base64 = this.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
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
  }

  deleteData() {
    this.accessToken = null;
    this.refreshToken = null;
    this.payload = null;
    this.exp = null;

    this.hasDataStored = false;
  }

  getTokenFromResponse(response, tokenProp, tokenName, tokenRoot) {
    if (!response) return undefined;

    const responseTokenProp = response[tokenProp];

    if (typeof responseTokenProp === 'string') {
      return responseTokenProp;
    }

    if (typeof responseTokenProp === 'object') {
      const tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function (o, x) {
        return o[x];
      }, responseTokenProp);
      return tokenRootData ? tokenRootData[tokenName] : responseTokenProp[tokenName];
    }

    const token = response[tokenName] === undefined ? null : response[tokenName];

    if (!token) throw new Error('Token not found in response');

    return token;
  }

  toUpdateTokenCallstack() {
    return new Promise(resolve => this.updateTokenCallstack.push(resolve));
  }

  resolveUpdateTokenCallstack(response) {
    this.updateTokenCallstack.map(resolve => resolve(response));
    this.updateTokenCallstack = [];
  }

  authenticate(name, userData = {}) {
    const provider = this.config.providers[name].type === '1.0' ? this.oAuth1 : this.oAuth2;

    return provider.open(this.config.providers[name], userData);
  }

  redirect(redirectUrl, defaultRedirectUrl) {
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
  }
}, (_applyDecoratedDescriptor(_class6.prototype, 'getLoginRoute', [_dec5], Object.getOwnPropertyDescriptor(_class6.prototype, 'getLoginRoute'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getLoginRedirect', [_dec6], Object.getOwnPropertyDescriptor(_class6.prototype, 'getLoginRedirect'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getLoginUrl', [_dec7], Object.getOwnPropertyDescriptor(_class6.prototype, 'getLoginUrl'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getSignupUrl', [_dec8], Object.getOwnPropertyDescriptor(_class6.prototype, 'getSignupUrl'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getProfileUrl', [_dec9], Object.getOwnPropertyDescriptor(_class6.prototype, 'getProfileUrl'), _class6.prototype), _applyDecoratedDescriptor(_class6.prototype, 'getToken', [_dec10], Object.getOwnPropertyDescriptor(_class6.prototype, 'getToken'), _class6.prototype)), _class6)) || _class5);

export let AuthService = (_dec11 = inject(Authentication, BaseConfig), _dec12 = deprecated({ message: 'Use .getAccessToken() instead.' }), _dec11(_class7 = (_class8 = class AuthService {
  constructor(authentication, config) {
    this.authentication = authentication;
    this.config = config;
  }

  get client() {
    return this.config.client;
  }

  get auth() {
    LogManager.getLogger('authentication').warn('AuthService.auth is deprecated. Use .authentication instead.');
    return this.authentication;
  }

  getMe(criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
    return this.client.find(this.config.withBase(this.config.profileUrl), criteria);
  }

  updateMe(body, criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
    return this.client.update(this.config.withBase(this.config.profileUrl), criteria, body);
  }

  getAccessToken() {
    return this.authentication.getAccessToken();
  }

  getCurrentToken() {
    return this.getAccessToken();
  }

  getRefreshToken() {
    return this.authentication.getRefreshToken();
  }

  isAuthenticated() {
    let authenticated = this.authentication.isAuthenticated();

    if (!authenticated && this.config.autoUpdateToken && this.authentication.getAccessToken() && this.authentication.getRefreshToken()) {
      this.updateToken();
      authenticated = true;
    }

    return authenticated;
  }

  getTtl() {
    return this.authentication.getTtl();
  }

  isTokenExpired() {
    return this.authentication.isTokenExpired();
  }

  getTokenPayload() {
    return this.authentication.getPayload();
  }

  updateToken() {
    if (!this.authentication.getRefreshToken()) {
      return Promise.reject(new Error('refreshToken not set'));
    }

    if (this.authentication.updateTokenCallstack.length === 0) {
      const content = {
        grant_type: 'refresh_token',
        refresh_token: this.authentication.getRefreshToken(),
        client_id: this.config.clientId ? this.config.clientId : undefined
      };

      this.client.post(this.config.withBase(this.config.loginUrl), content).then(response => {
        this.authentication.responseObject = response;
        this.authentication.resolveUpdateTokenCallstack(this.authentication.isAuthenticated());
      }).catch(err => {
        this.authentication.responseObject = null;
        this.authentication.resolveUpdateTokenCallstack(Promise.reject(err));
      });
    }

    return this.authentication.toUpdateTokenCallstack();
  }

  signup(displayName, email, password, options, redirectUri) {
    let content;

    if (typeof arguments[0] === 'object') {
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
    return this.client.post(this.config.withBase(this.config.signupUrl), content, options).then(response => {
      if (this.config.loginOnSignup) {
        this.authentication.responseObject = response;
      }
      this.authentication.redirect(redirectUri, this.config.signupRedirect);

      return response;
    });
  }

  login(email, password, options, redirectUri) {
    let content;

    if (typeof arguments[0] === 'object') {
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

    return this.client.post(this.config.withBase(this.config.loginUrl), content, options).then(response => {
      this.authentication.responseObject = response;

      this.authentication.redirect(redirectUri, this.config.loginRedirect);

      return response;
    });
  }

  logout(redirectUri) {
    return new Promise(resolve => {
      this.authentication.responseObject = null;

      this.authentication.redirect(redirectUri, this.config.logoutRedirect);

      resolve();
    });
  }

  authenticate(name, redirectUri, userData = {}) {
    return this.authentication.authenticate(name, userData).then(response => {
      this.authentication.responseObject = response;

      this.authentication.redirect(redirectUri, this.config.loginRedirect);

      return response;
    });
  }

  unlink(name, redirectUri) {
    const unlinkUrl = this.config.withBase(this.config.unlinkUrl) + name;
    return this.client.request(this.config.unlinkMethod, unlinkUrl).then(response => {
      this.authentication.redirect(redirectUri);

      return response;
    });
  }
}, (_applyDecoratedDescriptor(_class8.prototype, 'getCurrentToken', [_dec12], Object.getOwnPropertyDescriptor(_class8.prototype, 'getCurrentToken'), _class8.prototype)), _class8)) || _class7);

export let AuthorizeStep = (_dec13 = inject(Authentication), _dec13(_class9 = class AuthorizeStep {
  constructor(authentication) {
    this.authentication = authentication;
  }

  run(routingContext, next) {
    const isLoggedIn = this.authentication.isAuthenticated();
    const loginRoute = this.authentication.config.loginRoute;

    if (routingContext.getAllInstructions().some(i => i.config.auth)) {
      if (!isLoggedIn) {
        return next.cancel(new Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(i => i.fragment === loginRoute)) {
      return next.cancel(new Redirect(this.authentication.config.loginRedirect));
    }

    return next();
  }
}) || _class9);

export let FetchConfig = (_dec14 = inject(HttpClient, Config, AuthService, BaseConfig), _dec14(_class10 = class FetchConfig {
  constructor(httpClient, clientConfig, authService, config) {
    this.httpClient = httpClient;
    this.clientConfig = clientConfig;
    this.authService = authService;
    this.config = config;
  }

  get interceptor() {
    return {
      request: request => {
        if (!this.config.httpInterceptor || !this.authService.isAuthenticated()) {
          return request;
        }
        let token = this.authService.getAccessToken();

        if (this.config.authTokenType) {
          token = `${ this.config.authTokenType } ${ token }`;
        }

        request.headers.set(this.config.authHeader, token);

        return request;
      },
      response: (response, request) => {
        return new Promise((resolve, reject) => {
          if (response.ok) {
            return resolve(response);
          }
          if (response.status !== 401) {
            return resolve(response);
          }
          if (!this.config.httpInterceptor || !this.authService.isTokenExpired()) {
            return resolve(response);
          }
          if (!this.config.useRefreshToken || !this.authService.getRefreshToken()) {
            return resolve(response);
          }

          this.authService.updateToken().then(() => {
            let token = this.authService.getAccessToken();

            if (this.config.authTokenType) {
              token = `${ this.config.authTokenType } ${ token }`;
            }

            request.headers.set(this.config.authHeader, token);

            return this.client.fetch(request).then(resolve);
          });
        });
      }
    };
  }

  configure(client) {
    if (Array.isArray(client)) {
      let configuredClients = [];
      client.forEach(toConfigure => {
        configuredClients.push(this.configure(toConfigure));
      });

      return configuredClients;
    }

    if (typeof client === 'string') {
      const endpoint = this.clientConfig.getEndpoint(client);
      if (!endpoint) {
        throw new Error(`There is no '${ client || 'default' }' endpoint registered.`);
      }
      client = endpoint.client;
    } else if (client instanceof Rest) {
      client = client.client;
    } else if (!(client instanceof HttpClient)) {
      client = this.httpClient;
    }

    client.interceptors.push(this.interceptor);

    return client;
  }
}) || _class10);

import './authFilter';

function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  const baseConfig = aurelia.container.get(BaseConfig);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }

  const fetchConfig = aurelia.container.get(FetchConfig);
  const clientConfig = aurelia.container.get(Config);

  if (Array.isArray(baseConfig.configureEndpoints)) {
    baseConfig.configureEndpoints.forEach(endpointToPatch => {
      fetchConfig.configure(endpointToPatch);
    });
  }

  let client;

  if (baseConfig.endpoint !== null) {
    if (typeof baseConfig.endpoint === 'string') {
      const endpoint = clientConfig.getEndpoint(baseConfig.endpoint);
      if (!endpoint) {
        throw new Error(`There is no '${ baseConfig.endpoint || 'default' }' endpoint registered.`);
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

export { configure, FetchConfig, AuthService, AuthorizeStep };