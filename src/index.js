export {AuthService} from './authService';
export {AuthorizeStep} from './authorizeStep';
import {BaseConfig} from './baseConfig';
export {FetchConfig} from './app.fetch-httpClient.config';

export function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  let baseConfig = aurelia.container.get(BaseConfig);
  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }
}
