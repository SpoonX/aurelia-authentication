import {HttpClient} from 'aurelia-fetch-client';
import {AuthService} from './authService';
import {BaseConfig} from './baseConfig';
import {inject} from 'aurelia-dependency-injection';
import {Config, Rest} from 'spoonx/aurelia-api';

@inject(HttpClient, Config, AuthService, BaseConfig)
export class FetchConfig {
  /**
   * Construct the FetchConfig
   *
   * @param {HttpClient} httpClient
   * @param {Config} clientConfig
   * @param {Authentication} authService
   * @param {BaseConfig} config
   */
  constructor(httpClient, clientConfig, authService, config) {
    this.httpClient   = httpClient;
    this.clientConfig = clientConfig;
    this.auth         = authService;
    this.config       = config;
  }

  /**
   * Interceptor for HttpClient
   *
   * @return {{request: Function}}
   */
  get interceptor() {
    let auth   = this.auth;
    let config = this.config.current;
    let client = this.httpClient;

    return {
      request(request) {
        if (!auth.isAuthenticated() || !config.httpInterceptor) {
          return request;
        }
        let token = auth.getCurrentToken();

        if (config.authHeader && config.authToken) {
          token = `${config.authToken} ${token}`;
        }

        request.headers.set(config.authHeader, token);

        return request;
      },
      response(response, request) {
        return new Promise((resolve, reject) => {
          if (response.ok) {
            return resolve(response);
          }
          if (response.status !== 401) {
            return resolve(response);
          }
          if (!auth.isTokenExpired() || !config.httpInterceptor) {
            return resolve(response);
          }
          if (!auth.getRefreshToken()) {
            return resolve(response);
          }
          auth.updateToken().then(() => {
            let token = auth.getCurrentToken();
            if (config.authHeader && config.authToken) {
              token = `${config.authToken} ${token}`;
            }
            request.headers.append('Authorization', token);
            return client.fetch(request).then(resolve);
          });
        });
      }
    };
  }

  /**
   * @param {HttpClient|Rest[]} client
   *
   * @return {HttpClient[]}
   */
  configure(client) {
    if (Array.isArray(client)) {
      let configuredClients = [];
      client.forEach(toConfigure => {
        configuredClients.push(this.configure(toConfigure));
      });

      return configuredClients;
    }

    if (typeof client === 'string') {
      let endpoint = this.clientConfig.getEndpoint(client);
      if (!endpoint) {
        throw new Error(`There is no '${client || 'default'}' endpoint registered.`);
      }
      client = endpoint.client;
    } else if (client instanceof Rest) {
      client = client.client;
    } else if (!(client instanceof HttpClient)) {
      client = this.httpClient;
    }

    client.interceptors.push(this.interceptor);

    return client;
  }
}
