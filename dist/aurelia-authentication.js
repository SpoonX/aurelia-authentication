import extend from 'extend';
import * as LogManager from 'aurelia-logging';
import {parseQueryString,join,buildQueryString} from 'aurelia-path';
import {inject} from 'aurelia-dependency-injection';
import {deprecated} from 'aurelia-metadata';
import {Redirect} from 'aurelia-router';
import {HttpClient} from 'aurelia-fetch-client';
import {Config,Rest} from 'aurelia-api';

export class Popup {
  constructor() {
    this.popupWindow = null;
    this.polling     = null;
    this.url         = '';
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

        const parser  = document.createElement('a');
        parser.href = event.url;

        if (parser.search || parser.hash) {
          const qs = parseUrl(parser);

          if (qs.error) {
            reject({error: qs.error});
          } else {
            resolve(qs);
          }

          this.popupWindow.close();
        }
      });

      this.popupWindow.addEventListener('exit', () => {
        reject({data: 'Provider Popup was closed'});
      });

      this.popupWindow.addEventListener('loaderror', () => {
        reject({data: 'Authorization Failed'});
      });
    });
  }

  pollPopup() {
    return new Promise((resolve, reject) => {
      this.polling = setInterval(() => {
        let errorData;

        try {
          if (this.popupWindow.location.host ===  document.location.host
            && (this.popupWindow.location.search || this.popupWindow.location.hash)) {
            const qs = parseUrl(this.popupWindow.location);

            if (qs.error) {
              reject({error: qs.error});
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
}

const buildPopupWindowOptions = options => {
  const width  = options.width || 500;
  const height = options.height || 500;

  const extended = extend({
    width: width,
    height: height,
    left: window.screenX + ((window.outerWidth - width) / 2),
    top: window.screenY + ((window.outerHeight - height) / 2.5)
  }, options);

  let parts = [];
  Object.keys(extended).map(key => parts.push(key + '=' + extended[key]));

  return parts.join(',');
};

const parseUrl = url => {
  return extend(true, {}, parseQueryString(url.search), parseQueryString(url.hash));
};

export class BaseConfig {
  // prepends baseUrl
  withBase(url) {
    return join(this.baseUrl, url);
  }

  // merge current settings with incomming settings
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

  /* ----------- default  config ----------- */

  // Used internally. The used Rest instance; set during configuration (see index.js)
  client = null;

  // If using aurelia-api:
  // =====================

  // This is the name of the endpoint used for any requests made in relation to authentication (login, logout, etc.). An empty string selects the default endpoint of aurelia-api.
  endpoint = null;
  // When authenticated, these endpoints will have the token added to the header of any requests (for authorization). Accepts an array of endpoint names. An empty string selects the default endpoint of aurelia-api.
  configureEndpoints = null;


  // SPA related options
  // ===================

  // The SPA url to which the user is redirected after a successful login
  loginRedirect = '#/customer';
  // The SPA url to which the user is redirected after a successful logout
  logoutRedirect = '#/';
  // The SPA route used when an unauthenticated user tries to access an SPA page that requires authentication
  loginRoute = '/login';
  // Whether or not an authentication token is provided in the response to a successful signup
  loginOnSignup = true;
  // If loginOnSignup == false: The SPA url to which the user is redirected after a successful signup (else loginRedirect is used)
  signupRedirect = '#/login';


  // API related options
  // ===================

  // The base url used for all authentication related requests, including provider.url below.
  // This appends to the httpClient/endpoint base url, it does not override it.
  baseUrl = '';
  // The API endpoint to which login requests are sent
  loginUrl = '/auth/login';
  // The API endpoint to which signup requests are sent
  signupUrl = '/auth/signup';
  // The API endpoint used in profile requests (inc. `find/get` and `update`)
  profileUrl = '/auth/me';
  // The API endpoint used with oAuth to unlink authentication
  unlinkUrl = '/auth/unlink/';
  // The HTTP method used for 'unlink' requests (Options: 'get' or 'post')
  unlinkMethod = 'get';


  // Token Options
  // =============

  // The header property used to contain the authToken in the header of API requests that require authentication
  authHeader = 'Authorization';
  // The token name used in the header of API requests that require authentication
  authTokenType = 'Bearer';
  // The the property from which to get the access token after a successful login or signup
  accessTokenProp = 'access_token';


  // If the property defined by `accessTokenProp` is an object:
  // ------------------------------------------------------------

  //This is the property from which to get the token `{ "accessTokenProp": { "accessTokenName" : '...' } }`
  accessTokenName = 'token';
  // This allows the token to be a further object deeper `{ "accessTokenProp": { "accessTokenRoot" : { "accessTokenName" : '...' } } }`
  accessTokenRoot = false;


  // Refresh Token Options
  // =====================

  // Option to turn refresh tokens On/Off
  useRefreshToken = false;
  // The option to enable/disable the automatic refresh of Auth tokens using Refresh Tokens
  autoUpdateToken = true;
  // Oauth Client Id
  clientId = false;
  // The the property from which to get the refresh token after a successful token refresh
  refreshTokenProp = 'refresh_token';

  // If the property defined by `refreshTokenProp` is an object:
  // -----------------------------------------------------------

  // This is the property from which to get the token `{ "refreshTokenProp": { "refreshTokenName" : '...' } }`
  refreshTokenName = 'token';
  // This allows the refresh token to be a further object deeper `{ "refreshTokenProp": { "refreshTokenRoot" : { "refreshTokenName" : '...' } } }`
  refreshTokenRoot = false;


  // Miscellaneous Options
  // =====================

  // Whether to enable the fetch interceptor which automatically adds the authentication headers
  // (or not... e.g. if using a session based API or you want to override the default behaviour)
  httpInterceptor = true;
  // For OAuth only: Tell the API whether or not to include token cookies in the response (for session based APIs)
  withCredentials = true;
  // Controls how the popup is shown for different devices (Options: 'browser' or 'mobile')
  platform = 'browser';
  // Determines the `window` property name upon which aurelia-authentication data is stored (Default: `window.localStorage`)
  storage = 'localStorage';
  // The key used for storing the authentication response locally
  storageKey = 'aurelia_authentication';

  //OAuth provider specific related configuration
  // ============================================
  providers = {
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
      nonce: function() {
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

  /* deprecated defaults */
  _authToken = 'Bearer';
  _responseTokenProp = 'access_token';
  _tokenName = 'token';
  _tokenRoot = false;
  _tokenPrefix = 'aurelia';

  /* deprecated methods and parameteres */
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
}

@inject(BaseConfig)
export class Storage {
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
}

@inject(Storage, Popup, BaseConfig)
export class OAuth1 {
  constructor(storage, popup, config) {
    this.storage  = storage;
    this.config   = config;
    this.popup    = popup;
    this.defaults = {
      url: null,
      name: null,
      popupOptions: null,
      redirectUri: null,
      authorizationEndpoint: null
    };
  }

  open(options, userData) {
    const provider  = extend(true, {}, this.defaults, options);
    const serverUrl = this.config.withBase(provider.url);

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', provider.name, provider.popupOptions, provider.redirectUri);
    }

    return this.config.client.post(serverUrl)
      .then(response => {
        const url = provider.authorizationEndpoint + '?' + buildQueryString(response);

        if (this.config.platform === 'mobile') {
          this.popup = this.popup.open(url, provider.name, provider.popupOptions,  provider.redirectUri);
        } else {
          this.popup.popupWindow.location = url;
        }

        const popupListener = this.config.platform === 'mobile'
                            ? this.popup.eventListener(provider.redirectUri)
                            : this.popup.pollPopup();

        return popupListener.then(result => this.exchangeForToken(result, userData, provider));
      });
  }

  exchangeForToken(oauthData, userData, provider) {
    const data        = extend(true, {}, userData, oauthData);
    const serverUrl   = this.config.withBase(provider.url);
    const credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, {credentials: credentials});
  }
}

@inject(Storage, Popup, BaseConfig)
export class OAuth2 {
  constructor(storage, popup, config) {
    this.storage      = storage;
    this.config       = config;
    this.popup        = popup;
    this.defaults     = {
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
    const provider  = extend(true, {}, this.defaults, options);
    const stateName = provider.name + '_state';

    if (typeof provider.state === 'function') {
      this.storage.set(stateName, provider.state());
    } else if (typeof provider.state === 'string') {
      this.storage.set(stateName, provider.state);
    }

    const url       = provider.authorizationEndpoint
                    + '?' + buildQueryString(this.buildQuery(provider));
    const popup     = this.popup.open(url, provider.name, provider.popupOptions, provider.redirectUri);
    const openPopup = (this.config.platform === 'mobile')
                    ? popup.eventListener(provider.redirectUri)
                    : popup.pollPopup();

    return openPopup
      .then(oauthData => {
        if (provider.responseType === 'token' ||
            provider.responseType === 'id_token%20token' ||
            provider.responseType === 'token%20id_token'
        ) {
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

    const serverUrl   = this.config.withBase(provider.url);
    const credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, {credentials: credentials});
  }

  buildQuery(provider) {
    let query = {};
    const urlParams   = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

    urlParams.forEach( params => {
      (provider[params] || []).forEach( paramName => {
        const camelizedName = camelCase(paramName);
        let paramValue      = (typeof provider[paramName] === 'function')
                              ? provider[paramName]()
                              : provider[camelizedName];

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
}

const camelCase = function(name) {
  return name.replace(/([\:\-\_]+(.))/g, function(_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  });
};

@inject(Storage, BaseConfig, OAuth1, OAuth2)
export class Authentication {
  constructor(storage, config, oAuth1, oAuth2) {
    this.storage              = storage;
    this.config               = config;
    this.oAuth1               = oAuth1;
    this.oAuth2               = oAuth2;
    this.updateTokenCallstack = [];
    this.accessToken          = null;
    this.refreshToken         = null;
    this.payload              = null;
    this.exp                  = null;
    this.hasDataStored        = false;

    // get token stored in previous format over
    const oldStorageKey = config.tokenPrefix
                        ? config.tokenPrefix + '_' + config.tokenName
                        : this.tokenName;
    const oldToken = storage.get(oldStorageKey);

    if (oldToken) {
      LogManager.getLogger('authentication').info('Found token with deprecated format in storage. Converting it to new format. No further action required.');
      let fakeOldResponse = {};
      fakeOldResponse[config.accessTokenProp] = oldToken;
      this.responseObject = fakeOldResponse;
      storage.remove(oldStorageKey);
    }
  }


  /* deprecated methods */

  @deprecated({message: 'Use baseConfig.loginRoute instead.'})
  getLoginRoute() {
    return this.config.loginRoute;
  }

  @deprecated({message: 'Use baseConfig.loginRedirect instead.'})
  getLoginRedirect() {
    return this.config.loginRedirect;
  }

  @deprecated({message: 'Use baseConfig.withBase(baseConfig.loginUrl) instead.'})
  getLoginUrl() {
    return this.config.withBase(this.config.loginUrl);
  }

  @deprecated({message: 'Use baseConfig.withBase(baseConfig.signupUrl) instead.'})
  getSignupUrl() {
    return this.config.withBase(this.config.signupUrl);
  }

  @deprecated({message: 'Use baseConfig.withBase(baseConfig.profileUrl) instead.'})
  getProfileUrl() {
    return this.config.withBase(this.config.profileUrl);
  }

  @deprecated({message: 'Use .getAccessToken() instead.'})
  getToken() {
    return this.getAccessToken();
  }

  /* getters/setters for responseObject */

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


  /* get data, update if needed first */

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


 /* get status from data */

  getTtl() {
    const exp = this.getExp();
    return  Number.isNaN(exp) ? NaN : exp - Math.round(new Date().getTime() / 1000);
  }

  isTokenExpired() {
    const timeLeft = this.getTtl();
    return Number.isNaN(timeLeft) ? undefined : timeLeft < 0;
  }

  isAuthenticated() {
    const isTokenExpired = this.isTokenExpired();
    if (isTokenExpired === undefined ) return this.accessToken ? true : false;
    return !isTokenExpired;
  }


  /* get and set from response */

  getDataFromResponse(response) {
    const config   = this.config;

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
      const tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function(o, x) { return o[x]; }, responseTokenProp);
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


  /**
   * Authenticate with third-party
   *
   * @param {String}    name of the provider
   * @param {[{}]}      [userData]
   *
   * @return {Promise<response>}
   */
  authenticate(name, userData = {}) {
    const provider = this.config.providers[name].type === '1.0' ? this.oAuth1 : this.oAuth2;

    return provider.open(this.config.providers[name], userData);
  }

  redirect(redirectUrl, defaultRedirectUrl) {
    // stupid rule to keep it BC
    if (redirectUrl === true) {
      LogManager.getLogger('authentication').warn('DEPRECATED: Setting redirectUrl === true to actually *not redirect* is deprecated. Set redirectUrl === 0 instead.');
      return;
    }
    // stupid rule to keep it BC
    if (redirectUrl === false) {
      LogManager.getLogger('authentication').warn('BREAKING CHANGE: Setting redirectUrl === false to actually *do redirect* is deprecated. Set redirectUrl to undefined or null to use the defaultRedirectUrl if so desired.');
    }
    // BC hack. explicit 0 means don't redirect. false will be added later and 0 deprecated
    if (redirectUrl === 0) {
      return;
    }
    if (typeof redirectUrl === 'string') {
      window.location.href = window.encodeURI(redirectUrl);
    } else if (defaultRedirectUrl) {
      window.location.href = defaultRedirectUrl;
    }
  }
}

@inject(Authentication, BaseConfig)
export class AuthService {
  constructor(authentication, config) {
    this.authentication = authentication;
    this.config         = config;
  }

  /**
   * Getter: The configured client for all aurelia-authentication requests
   *
   * @return {HttpClient}
   */
  get client() {
    return this.config.client;
  }

  get auth() {
    LogManager.getLogger('authentication').warn('AuthService.auth is deprecated. Use .authentication instead.');
    return this.authentication;
  }

  /**
   * Get current user profile from server
   *
   * @param {[{}|number|string]}  [criteria object or a Number|String converted to {id:criteria}]
   *
   * @return {Promise<response>}
   */
  getMe(criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = {id: criteria};
    }
    return this.client.find(this.config.withBase(this.config.profileUrl), criteria);
  }

  /**
   * Send current user profile update to server
   *
   * @param {any}                 request body with data.
   * @param {[{}|Number|String]}  [criteria object or a Number|String converted to {id:criteria}]
   *
   * @return {Promise<response>}
   */
  updateMe(body, criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
    return this.client.update(this.config.withBase(this.config.profileUrl), criteria, body);
  }

  /**
   * Get accessToken from storage
   *
   * @returns {String} current accessToken
   */
  getAccessToken() {
    return this.authentication.getAccessToken();
  }

  @deprecated({message: 'Use .getAccessToken() instead.'})
  getCurrentToken() {
    return this.getAccessToken();
  }

  /**
   * Get refreshToken from storage
   *
   * @returns {String} current refreshToken
   */
  getRefreshToken() {
    return this.authentication.getRefreshToken();
  }

 /**
  * Gets authentication status
  *
  * @returns {Boolean} true: for Non-JWT and unexpired JWT, false: else
  */
  isAuthenticated() {
    let authenticated = this.authentication.isAuthenticated();

    // auto-update token?
    if (!authenticated
      && this.config.autoUpdateToken
      && this.authentication.getAccessToken()
      && this.authentication.getRefreshToken()) {
      this.updateToken();
      authenticated = true;
    }

    return authenticated;
  }

  /**
   * Gets ttl in seconds
   *
   * @returns {Number} ttl for JWT tokens, NaN for all other tokens
   */
  getTtl() {
    return this.authentication.getTtl();
  }

 /**
  * Gets exp from token payload and compares to current time
  *
  * @returns {Boolean} returns (ttl > 0)? for JWT, undefined other tokens
  */
  isTokenExpired() {
    return this.authentication.isTokenExpired();
  }

  /**
  * Get payload from tokens
  *
  * @returns {null | String} null: Non-JWT payload, String: JWT token payload
  */
  getTokenPayload() {
    return this.authentication.getPayload();
  }

  /**
   * Request new accesss token
   *
   * @returns {Promise<Response>} requests new token. can be called multiple times
   */
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

      this.client.post(this.config.withBase(this.config.loginUrl), content)
        .then(response => {
          this.authentication.responseObject = response;
          this.authentication.resolveUpdateTokenCallstack(this.authentication.isAuthenticated());
        })
        .catch(err => {
          this.authentication.responseObject = null;
          this.authentication.resolveUpdateTokenCallstack(Promise.reject(err));
        });
    }

    return this.authentication.toUpdateTokenCallstack();
  }

  /**
   * Signup locally
   *
   * @param {String|{}}   displayName | object with signup data.
   * @param {[String]|{}} [email | options for post request]
   * @param {[String]}    [password | redirectUri overwrite]
   * @param {[{}]}        [options]
   * @param {[String]}    [redirectUri overwrite]
   *
   * @return {Promise<response>}
   */
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
    return this.client.post(this.config.withBase(this.config.signupUrl), content, options)
      .then(response => {
        if (this.config.loginOnSignup) {
          this.authentication.responseObject = response;
        }
        this.authentication.redirect(redirectUri, this.config.signupRedirect);

        return response;
      });
  }

  /**
   * login locally. Redirect depending on config
   *
   * @param {[String]|{}} email | object with signup data.
   * @param {[String]}    [password | options for post request]
   * @param {[{}]}        [options | redirectUri overwrite]]
   * @param {[String]}    [redirectUri overwrite]
   *
   * @return {Promise<response>}
   */
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

    return this.client.post(this.config.withBase(this.config.loginUrl), content, options)
      .then(response => {
        this.authentication.responseObject = response;

        this.authentication.redirect(redirectUri, this.config.loginRedirect);

        return response;
      });
  }

  /**
   * logout locally and redirect to redirectUri (if set) or redirectUri of config
   *
   * @param {[String]}  [redirectUri]
   *
   * @return {Promise<>}
   */
  logout(redirectUri) {
    return new Promise(resolve => {
      this.authentication.responseObject = null;

      this.authentication.redirect(redirectUri, this.config.logoutRedirect);

      resolve();
    });
  }

  /**
   * Authenticate with third-party and redirect to redirectUri (if set) or redirectUri of config
   *
   * @param {String}    name of the provider
   * @param {[String]}  [redirectUri]
   * @param {[{}]}      [userData]
   *
   * @return {Promise<response>}
   */
  authenticate(name, redirectUri, userData = {}) {
    return this.authentication.authenticate(name, userData)
      .then(response => {
        this.authentication.responseObject = response;

        this.authentication.redirect(redirectUri, this.config.loginRedirect);

        return response;
      });
  }

  /**
   * Unlink third-party
   *
   * @param {String}  name of the provider
   *
   * @return {Promise<response>}
   */
  unlink(name, redirectUri) {
    const unlinkUrl = this.config.withBase(this.config.unlinkUrl) + name;
    return this.client.request(this.config.unlinkMethod, unlinkUrl)
      .then(response => {
        this.authentication.redirect(redirectUri);

        return response;
      });
  }
}

@inject(Authentication)
export class AuthorizeStep {
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
      return next.cancel(new Redirect( this.authentication.config.loginRedirect ));
    }

    return next();
  }
}

@inject(HttpClient, Config, AuthService, BaseConfig)
export class FetchConfig {
  /**
   * Construct the FetchConfig
   *
   * @param {HttpClient} httpClient
   * @param {Config} clientConfig
   * @param {Authentication} authService
   * @param {BaseConfig} config
   */
  constructor(httpClient, clientConfig, authService, config) {
    this.httpClient   = httpClient;
    this.clientConfig = clientConfig;
    this.authService  = authService;
    this.config       = config;
  }

  /**
   * Interceptor for HttpClient
   *
   * @return {{request: Function, response: Function}}
   */
  get interceptor() {
    return {
      request: request => {
        if (!this.config.httpInterceptor || !this.authService.isAuthenticated()) {
          return request;
        }
        let token = this.authService.getAccessToken();

        if (this.config.authTokenType) {
          token = `${this.config.authTokenType} ${token}`;
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
              token = `${this.config.authTokenType} ${token}`;
            }

            request.headers.set(this.config.authHeader, token);

            return this.client.fetch(request).then(resolve);
          });
        });
      }
    };
  }

  /**
   * Configure client(s) with authorization interceptor
   *
   * @param {HttpClient|Rest|string[]} (array of) httpClient, rest client or api endpoint names
   *
   * @return {HttpClient[]}
   */
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
        throw new Error(`There is no '${client || 'default'}' endpoint registered.`);
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
}

import './authFilter';

/**
 * Configure the plugin.
 *
 * @param {{globalResources: Function, container: {Container}}} aurelia
 * @param {{}|Function}                                         config
 */
function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  const baseConfig = aurelia.container.get(BaseConfig);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }
  // after baseConfig was configured
  const fetchConfig  = aurelia.container.get(FetchConfig);
  const clientConfig = aurelia.container.get(Config);

  // Array? Configure the provided endpoints.
  if (Array.isArray(baseConfig.configureEndpoints)) {
    baseConfig.configureEndpoints.forEach(endpointToPatch => {
      fetchConfig.configure(endpointToPatch);
    });
  }

  let client;

  // Let's see if there's a configured named or default endpoint or a HttpClient.
  if (baseConfig.endpoint !== null) {
    if (typeof baseConfig.endpoint === 'string') {
      const endpoint = clientConfig.getEndpoint(baseConfig.endpoint);
      if (!endpoint) {
        throw new Error(`There is no '${baseConfig.endpoint || 'default'}' endpoint registered.`);
      }
      client = endpoint;
    } else if (baseConfig.endpoint instanceof HttpClient) {
      client = new Rest(baseConfig.endpoint);
    }
  }

  // No? Fine. Default to HttpClient. BC all the way.
  if (!(client instanceof Rest)) {
    client = new Rest(aurelia.container.get(HttpClient));
  }

  // Set the client on the config, for use throughout the plugin.
  baseConfig.client = client;
}

export {
  configure,
  FetchConfig,
  AuthService,
  AuthorizeStep
};
