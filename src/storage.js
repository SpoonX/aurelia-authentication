import {inject} from 'aurelia-dependency-injection';

import {BaseConfig} from './baseConfig';

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
