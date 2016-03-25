var _dec, _class;

import { inject } from 'aurelia-dependency-injection';
import { BaseConfig } from './baseConfig';

export let Storage = (_dec = inject(BaseConfig), _dec(_class = class Storage {
  constructor(config) {
    this.config = config.current;
  }

  get(key) {
    let storageKey = this.config.storage;

    if (window[storageKey]) {
      return window[storageKey].getItem(key);
    }
  }

  set(key, value) {
    let storageKey = this.config.storage;

    if (window[storageKey]) {
      return window[storageKey].setItem(key, value);
    }
  }

  remove(key) {
    let storageKey = this.config.storage;

    if (window[storageKey]) {
      return window[storageKey].removeItem(key);
    }
  }
}) || _class);