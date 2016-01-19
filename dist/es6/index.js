export {AuthService} from './authService';
export {AuthorizeStep} from './authorizeStep';
import {BaseConfig} from './baseConfig';
import {FetchConfig} from './app.fetch-httpClient.config';
export {FetchConfig} from './app.fetch-httpClient.config';
import {Config, Rest} from 'spoonx/aurelia-api';
import {HttpClient} from 'aurelia-fetch-client';

/**
 * Configure the plugin.
 *
 * @param {{globalResources: Function, container: {Container}}} aurelia
 * @param {{}|Function}                                         config
 */
export function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  let baseConfig   = aurelia.container.get(BaseConfig);
  let fetchConfig  = aurelia.container.get(FetchConfig);
  let clientConfig = aurelia.container.get(Config);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }

  if (Array.isArray(baseConfig.current.configureEndpoints)) {
    baseConfig.current.configureEndpoints.forEach(endpointToPatch => {
      fetchConfig.configure(endpointToPatch);
    });
  }

  let client = clientConfig.getEndpoint(baseConfig.current.endpoint);

  if (!(client instanceof Rest)) {
    client = new Rest(aurelia.container.get(HttpClient));
  }

  baseConfig.current.client = client;
}
