import {inject} from 'aurelia-dependency-injection';

import {BaseConfig}  from './baseConfig';
import {Storage} from './storage';
import {OAuth1} from './oAuth1';
import {OAuth2} from './oAuth2';

@inject(Storage, BaseConfig, OAuth1, OAuth2)
export class Authentication {
  constructor(storage, config, oAuth1, oAuth2) {
    this.storage = storage;
    this.config  = config;
    this.oAuth1  = oAuth1;
    this.oAuth2  = oAuth2;
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

  setAccessTokenFromResponse(response) {
    const config   = this.config;
    const newToken = this.getTokenFromResponse(response, config.accessTokenProp, config.accessTokenName, config.accessTokenRoot);

    if (!newToken) throw new Error('Token not found in response');

    this.accessToken = newToken;
  }

  setRefreshTokenFromResponse(response) {
    const config   = this.config;
    const newToken = this.getTokenFromResponse(response, config.refreshTokenProp, config.refreshTokenName, config.refreshTokenRoot);

    if (!newToken) throw new Error('Token not found in response');

    this.refreshToken = newToken;
  }

  setTokensFromResponse(response) {
    this.setAccessTokenFromResponse(response);

    if (this.config.useRefreshToken) {
      this.setRefreshTokenFromResponse(response);
    }
  }

  removeTokens() {
    this.accessToken  = null;
    this.refreshToken = null;
  }

  logout() {
    return new Promise(resolve => {
      this.removeTokens();

      resolve();
    });
  }

  /**
   * Authenticate with third-party
   *
   * @param {String}    name of the provider
   * @param {[{}]}      [userData]
   *
   * @return {Promise<response>}
   *
   */
  authenticate(name, userData = {}) {
    const provider = this.config.providers[name].type === '1.0' ? this.oAuth1 : this.oAuth2;

    return provider.open(this.config.providers[name], userData);
  }

  redirect(redirectUrl, defaultRedirectUrl) {
    // stupid rule to keep it BC
    if (redirectUrl === true) {
      console.warn('Setting redirectUrl === true to actually not redirect is deprecated. Set redirectUrl===false instead.');
      return;
    }
    // explicit false means don't redirect
    if (redirectUrl === false) {
      console.warn('Setting redirectUrl === false to actually use the defaultRedirectUrl has changed. It means "Do not redirect" now. Set redirectUrl to undefined or null to use the defaultRedirectUrl.');
      return;
    }
    if (typeof redirectUrl === 'string') {
      window.location.href = window.encodeURI(redirectUrl);
    } else if (defaultRedirectUrl) {
      window.location.href = defaultRedirectUrl;
    }
  }
}
