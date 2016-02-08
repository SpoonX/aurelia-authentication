import {inject} from 'aurelia-dependency-injection';
import authUtils from './authUtils';
import {Storage} from './storage';
import {Popup} from './popup';
import {BaseConfig} from './baseConfig';

@inject(Storage, Popup, BaseConfig)
export class OAuth1 {
  constructor(storage, popup, config) {
    this.storage  = storage;
    this.config   = config.current;
    this.popup    = popup;
    this.client   = this.config.client;
    this.defaults = {
      url: null,
      name: null,
      popupOptions: null,
      redirectUri: null,
      authorizationEndpoint: null
    };
    this.current = {};
  }

  open(options, userData) {
    this.current = authUtils.extend({}, this.defaults, options);

    let serverUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.current.url) : this.current.url;

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', this.current.name, this.current.popupOptions, this.current.redirectUri);
    }

    return this.client.post(serverUrl)
      .then(response => {
        if (this.config.platform === 'mobile') {
          this.popup = this.popup.open(
            [
              this.defaults.authorizationEndpoint,
              this.buildQueryString(response)
            ].join('?'),
            this.defaults.name,
            this.defaults.popupOptions,
            this.defaults.redirectUri);
        } else {
          this.popup.popupWindow.location = [
            this.defaults.authorizationEndpoint,
            this.buildQueryString(response)
          ].join('?');
        }

        let popupListener = this.config.platform === 'mobile' ? this.popup.eventListener(this.defaults.redirectUri) : this.popup.pollPopup();

        return popupListener.then(result => this.exchangeForToken(result, userData));
      });
  }

  exchangeForToken(oauthData, userData) {
    let data                = authUtils.extend({}, userData, oauthData);
    let exchangeForTokenUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.current.url) : this.current.url;
    let credentials         = this.config.withCredentials ? 'include' : 'same-origin';

    return this.client.post(exchangeForTokenUrl, data, {credentials: credentials});
  }

  buildQueryString(obj) {
    let str = [];

    authUtils.forEach(obj, (value, key) => str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value)));

    return str.join('&');
  }
}
