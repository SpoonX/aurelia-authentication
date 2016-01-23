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

  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }

  // after baseConfig was configured
  let fetchConfig  = aurelia.container.get(FetchConfig);
  let clientConfig = aurelia.container.get(Config);

  // Array? Configure the provided endpoints.
  if (Array.isArray(baseConfig.current.configureEndpoints)) {
    baseConfig.current.configureEndpoints.forEach(endpointToPatch => {
      fetchConfig.configure(endpointToPatch);
    });
  }

  // Let's see if there's a configured client.
  let client = clientConfig.getEndpoint(baseConfig.current.endpoint);

  // No? Fine. Default to HttpClient. BC all the way.
  if (!(client instanceof Rest)) {
    client = new Rest(aurelia.container.get(HttpClient));
  }

  // Set the client on the config, for use throughout the plugin.
  baseConfig.current.client = client;
}
