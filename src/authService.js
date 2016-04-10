import {inject} from 'aurelia-dependency-injection';

import {Authentication} from './authentication';
import {BaseConfig} from './baseConfig';

@inject(Authentication, BaseConfig)
export class AuthService {
  constructor(authentication, config) {
    this.authentication = authentication;
    this.config         = config;
  }

  /**
   * Set true during updateToken process
   *
   * @param {Boolean} isRefreshing
   */
   isRefreshing = false;

  /**
   * Getter: The configured client for all aurelia-authentication requests
   *
   * @return {HttpClient}
   *
   */
  get client() {
    return this.config.client;
  }

  get auth() {
    console.warn('AuthService.auth is deprecated. Use .authentication instead.');
    return this.authentication;
  }

  /**
   * Get current user profile from server
   *
   * @param {[{}|number|string]}  [criteria object or a Number|String converted to {id:criteria}]
   *
   * @return {Promise<response>}
   *
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
   *
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
   *
   */
  getAccessToken() {
    return this.authentication.accessToken;
  }

  getCurrentToken() {
    console.warn('AuthService.getCurrentToken() is deprecated. Use .getAccessToken() instead.');
    return this.getAccessToken();
  }

  /**
   * Get refreshToken from storage
   *
   * @returns {String} current refreshToken
   *
   */
  getRefreshToken() {
    return this.authentication.refreshToken;
  }

 /**
  * Gets authentication status from token. If autoUpdateToken === true,
  * updates token and returns true meanwhile
  *
  * @returns {Boolean} true: for Non-JWT tokens and unexpired JWT tokens, false: else
  *
  */
  isAuthenticated(asPromise) {
    let authenticated = this.authentication.isAuthenticated();

    // auto-update token?
    if (!authenticated
      && this.config.autoUpdateToken
      && this.authentication.accessToken
      && this.authentication.refreshToken) {
      if (this.isRefreshing) {
        authenticated = true;
      } else {
        authenticated = this.updateToken();
      }
    }

    // return as boolean or Promise
    if (asPromise) {
      if (authenticated instanceof Promise) return authenticated;
      return Promise.resolve(authenticated);
    }

    if (authenticated instanceof Promise) {
      authenticated.catch(()=>{}).then(Promise.resolve);
      return true;
    }
    return authenticated;
  }

 /**
  * Gets exp from token payload and compares to current time
  *
  * @returns {Boolean | undefined} undefined: Non-JWT payload, true: unexpired JWT tokens, false: else
  *
  */
  isTokenExpired() {
    return this.authentication.isTokenExpired();
  }

  /**
  * Get payload from tokens
  *
  * @returns {null | String} null: Non-JWT payload, String: JWT token payload
  *
  */
  getTokenPayload() {
    return this.authentication.getPayload();
  }

  /**
   * Signup locally
   *
   * @param {String|{}}  displayName | object with signup data.
   * @param {[String]}   [email]
   * @param {[String]}   [password]
   *
   * @return {Promise<response>}
   *
   */
  signup(displayName, email, password) {
    let content;

    if (typeof arguments[0] === 'object') {
      content = arguments[0];
    } else {
      console.warn('AuthService.signup(displayName, email, password) is deprecated. Provide an object with signup data instead.');
      content = {
        'displayName': displayName,
        'email': email,
        'password': password
      };
    }
    return this._signup(content);
  }

  _signup(data, redirectUri) {
    return this.client.post(this.config.withBase(this.config.signupUrl), data)
      .then(response => {
        if (this.config.loginOnSignup) {
          this.authentication.setTokensFromResponse(response);
        }
        this.authentication.redirect(redirectUri, this.config.signupRedirect);

        return response;
      });
  }

  /**
   * login locally. Redirect depending on config
   *
   * @param {{}}  object with login data.
   *
   * @return {Promise<response>}
   *
   */
  login(email, password) {
    let content  = {};

    if (typeof arguments[1] !== 'string') {
      content = arguments[0];
    } else {
      console.warn('AuthService.login(email, password) is deprecated. Provide an object with login data instead.');
      content = {email: email, password: password};
    }

    return this._login(content);
  }

  _login(data, redirectUri) {
    if (this.config.clientId) {
      data.client_id = this.config.clientId;
    }

    return this.client.post(this.config.withBase(this.config.loginUrl), data)
      .then(response => {
        this.authentication.setTokensFromResponse(response);

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
   *
   */
  logout(redirectUri) {
    return this.authentication.logout(redirectUri)
      .then(response => {
        this.authentication.redirect(redirectUri, this.config.logoutRedirect);

        return response;
      });
  }

  /**
   * update accessToken using the refreshToken
   *
   * @return {Promise<response>}
   *
   */
  updateToken() {
    if (this.isRefreshing) {

    }
    this.isRefreshing  = true;
    const refreshToken = this.authentication.refreshToken;
    let content        = {};

    if (refreshToken) {
      content = {grant_type: 'refresh_token', refresh_token: refreshToken};
      if (this.config.clientId) {
        content.client_id = this.config.clientId;
      }

      return this.client.post(this.config.withBase(this.config.loginUrl), content)
          .then(response => {
            this.isRefreshing = false;
            this.authentication.setTokensFromResponse(response);
            return response;
          }).catch(err => {
            this.isRefreshing = false;
            this.authentication.removeTokens();
            throw err;
          });
    }

    return Promise.reject('refreshToken not enabled');
  }

  /**
   * Authenticate with third-party and redirect to redirectUri (if set) or redirectUri of config
   *
   * @param {String}    name of the provider
   * @param {[String]}  [redirectUri]
   * @param {[{}]}      [userData]
   *
   * @return {Promise<response>}
   *
   */
  authenticate(name, redirectUri, userData = {}) {
    return this.authentication.authenticate(name, userData)
      .then(response => {
        this.authentication.setTokensFromResponse(response);

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
   *
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
