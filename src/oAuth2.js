import {inject} from 'aurelia-dependency-injection';
import authUtils from './authUtils';
import {Storage} from './storage';
import {Popup} from './popup';
import {BaseConfig} from './baseConfig';

@inject(Storage, Popup, BaseConfig)
export class OAuth2 {
  constructor(storage, popup, config) {
    this.storage      = storage;
    this.config       = config.current;
    this.client       = this.config.client;
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
    this.current = {};
  }

  open(options, userData) {
    this.current = authUtils.extend({}, this.defaults, options);
    let stateName = this.current.name + '_state';

    if (authUtils.isFunction(this.current.state)) {
      this.storage.set(stateName, this.current.state());
    } else if (authUtils.isString(this.current.state)) {
      this.storage.set(stateName, this.current.state);
    }

    let url = this.current.authorizationEndpoint + '?' + this.buildQueryString();

    let openPopup;
    if (this.config.platform === 'mobile') {
      openPopup = this.popup.open(url, this.current.name, this.current.popupOptions, this.current.redirectUri).eventListener(this.current.redirectUri);
    } else {
      openPopup = this.popup.open(url, this.current.name, this.current.popupOptions, this.current.redirectUri).pollPopup();
    }

    return openPopup
      .then(oauthData => {
        if (this.current.responseType === 'token' ||
          this.current.responseType === 'id_token%20token' ||
          this.current.responseType === 'token%20id_token'
        ) {
          return oauthData;
        }
        if (oauthData.state && oauthData.state !== this.storage.get(stateName)) {
          return Promise.reject('OAuth 2.0 state parameter mismatch.');
        }
        return this.exchangeForToken(oauthData, userData);
      });
  }

  exchangeForToken(oauthData, userData) {
    let data = authUtils.extend({}, userData, {
      code: oauthData.code,
      clientId: this.current.clientId,
      redirectUri: this.current.redirectUri
    });

    if (oauthData.state) {
      data.state = oauthData.state;
    }

    authUtils.forEach(this.current.responseParams, param => data[param] = oauthData[param]);

    let exchangeForTokenUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.current.url) : this.current.url;
    let credentials         = this.config.withCredentials ? 'include' : 'same-origin';

    return this.client.post(exchangeForTokenUrl, data, {credentials: credentials});
  }

  buildQueryString() {
    let keyValuePairs = [];
    let urlParams     = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

    authUtils.forEach(urlParams, params => {
      authUtils.forEach(this.current[params], paramName => {
        let camelizedName = authUtils.camelCase(paramName);
        let paramValue    = authUtils.isFunction(this.current[paramName]) ? this.current[paramName]() : this.current[camelizedName];

        if (paramName === 'state') {
          let stateName = this.current.name + '_state';
          paramValue    = encodeURIComponent(this.storage.get(stateName));
        }

        if (paramName === 'scope' && Array.isArray(paramValue)) {
          paramValue = paramValue.join(this.current.scopeDelimiter);

          if (this.current.scopePrefix) {
            paramValue = [this.current.scopePrefix, paramValue].join(this.current.scopeDelimiter);
          }
        }

        keyValuePairs.push([paramName, paramValue]);
      });
    });

    return keyValuePairs.map(pair => pair.join('=')).join('&');
  }

}
