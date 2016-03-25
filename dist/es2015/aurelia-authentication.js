import { HttpClient } from 'aurelia-fetch-client';
import { Config, Rest } from 'spoonx/aurelia-api';

import { AuthService } from './authService';
import { AuthorizeStep } from './authorizeStep';
import { BaseConfig } from './baseConfig';
import { FetchConfig } from './app.fetch-httpClient.config';
import { authUtils } from './authUtils';

function configure(aurelia, config) {
  aurelia.globalResources('./authFilter');

  let baseConfig = aurelia.container.get(BaseConfig);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if (typeof config === 'object') {
    baseConfig.configure(config);
  }

  let fetchConfig = aurelia.container.get(FetchConfig);
  let clientConfig = aurelia.container.get(Config);

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

export { configure, FetchConfig, AuthService, AuthorizeStep, authUtils };