import {inject} from 'aurelia-framework';
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
  }

  open(options, userData) {
    authUtils.extend(this.defaults, options);

    let serverUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.defaults.url) : this.defaults.url;

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', this.defaults.name, this.defaults.popupOptions, this.defaults.redirectUri);
    }
    let self = this;
    return this.client.post(serverUrl)
      .then(response => {
        if (self.config.platform === 'mobile') {
          self.popup = self.popup.open(
            [
              self.defaults.authorizationEndpoint,
              self.buildQueryString(response)
            ].join('?'),
            self.defaults.name,
            self.defaults.popupOptions,
            self.defaults.redirectUri);
        } else {
          self.popup.popupWindow.location = [
            self.defaults.authorizationEndpoint,
            self.buildQueryString(response)
          ].join('?');
        }

        let popupListener = self.config.platform === 'mobile' ? self.popup.eventListener(self.defaults.redirectUri) : self.popup.pollPopup();

        return popupListener.then((result) => {
          return self.exchangeForToken(result, userData);
        });
      });
  }

  exchangeForToken(oauthData, userData) {
    let data                = authUtils.extend({}, userData, oauthData);
    let exchangeForTokenUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.defaults.url) : this.defaults.url;
    let credentials         = this.config.withCredentials ? 'include' : 'same-origin';

    return this.client.post(exchangeForTokenUrl, data, {credentials: credentials});
  }

  buildQueryString(obj) {
    let str = [];

    authUtils.forEach(obj, function(value, key) {
      str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });

    return str.join('&');
  }
}
