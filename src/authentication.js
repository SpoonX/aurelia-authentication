import {inject} from 'aurelia-dependency-injection';

import {BaseConfig}  from './baseConfig';
import {Storage} from './storage';

@inject(Storage, BaseConfig)
export class Authentication {
  constructor(storage, config) {
    this.storage = storage;
    this.config  = config;
  }

  getLoginRoute() {
    console.warn('Authentication.getLoginRoute is deprecated. Use baseConfig.loginRoute instead.');
    return this.config.loginRoute;
  }

  getLoginRedirect() {
    console.warn('Authentication.getLoginRedirect is deprecated. Use baseConfig.loginRedirect instead.');
    return this.config.loginRedirect;
  }

  getLoginUrl() {
    console.warn('Authentication.getLoginUrl is deprecated. Use baseConfig.withBase(baseConfig.loginUrl) instead.');
    return this.config.withBase(this.config.loginUrl);
  }

  getSignupUrl() {
    console.warn('Authentication.getSignupUrl is deprecated. Use baseConfig.withBase(baseConfig.signupUrl) instead.');
    return this.config.withBase(this.config.signupUrl);
  }

  getProfileUrl() {
    console.warn('Authentication.getProfileUrl is deprecated. Use baseConfig.withBase(baseConfig.profileUrl) instead.');
    return this.config.withBase(this.config.profileUrl);
  }

  getToken() {
    console.warn('Authentication.getToken is deprecated. Use .accessToken instead.');
    return this.accessToken;
  }

  getRefreshToken() {
    console.warn('Authentication.getRefreshToken is deprecated. Use .refreshToken instead.');
    return this.refreshToken;
  }
  /* getters/setters for tokens */

  get accessToken() {
    return this.storage.get(this.config.accessTokenStorage);
  }

  set accessToken(newToken) {
    if (newToken) {
      return this.storage.set(this.config.accessTokenStorage, newToken);
    }
    return this.storage.remove(this.config.accessTokenStorage);
  }

  get refreshToken() {
    return this.storage.get(this.config.refreshTokenStorage);
  }

  set refreshToken(newToken) {
    if (newToken) {
      return this.storage.set(this.config.refreshTokenStorage, newToken);
    }
    return this.storage.remove(this.config.refreshTokenStorage);
  }


  /* work with the token */

  getPayload() {
    const accessToken = this.accessToken;
    if (accessToken && accessToken.split('.').length === 3) {
      try {
        const base64Url = this.accessToken.split('.')[1];
        const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isTokenExpired() {
    const payload = this.getPayload();
    const exp     = payload && payload.exp;
    if (exp) {
      return Math.round(new Date().getTime() / 1000) > exp;
    }
    return undefined;
  }

  isAuthenticated() {
    // FAIL: There's no token, so user is not authenticated.
    if (!this.accessToken) {
      return false;
    }
    // PASS: There is a token, but in a different format
    if (this.accessToken.split('.').length !== 3) {
      return true;
    }
    // PASS: Non-JWT token that looks like JWT (isTokenExpired === undefined)
    // PASS or FAIL: test isTokenExpired.
    return this.isTokenExpired() !== true;
  }


  /* get and set token from response */

  getTokenFromResponse(response, tokenProp, tokenName, tokenRoot) {
    if (!response) return null;

    const responseTokenProp = response[tokenProp];

    if (typeof responseTokenProp === 'string') {
      return responseTokenProp;
    }

    if (typeof responseTokenProp === 'object') {
      const tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function(o, x) { return o[x]; }, responseTokenProp);
      return tokenRootData ? tokenRootData[tokenName] : responseTokenProp[tokenName];
    }

    return response[tokenName] === undefined ? null : response[tokenName];
  }

  setAccessTokenFromResponse(response, redirect) {
    const config   = this.config;
    const newToken = this.getTokenFromResponse(response, config.accessTokenProp, config.accessTokenName, config.accessTokenRoot);

    if (!newToken) throw new Error('Token not found in response');

    this.accessToken = newToken;

    if (this.config.loginRedirect && !redirect) {
      window.location.href = this.config.loginRedirect;
    } else if (typeof redirect === 'string') {
      window.location.href = window.encodeURI(redirect);
    }
  }

  setRefreshTokenFromResponse(response) {
    const config   = this.config;
    const newToken = this.getTokenFromResponse(response, config.refreshTokenProp, config.refreshTokenName, config.refreshTokenRoot);

    if (!newToken) throw new Error('Token not found in response');

    this.refreshToken = newToken;
  }

  logout(redirect) {
    return new Promise(resolve => {
      this.accessToken  = null;
      this.refreshToken = null;

      if (this.config.logoutRedirect && !redirect) {
        window.location.href = this.config.logoutRedirect;
      } else if (typeof redirect === 'string') {
        window.location.href = redirect;
      }

      resolve();
    });
  }
}
