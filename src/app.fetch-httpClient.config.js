import {HttpClient} from 'aurelia-fetch-client';
import {AuthService} from './authService';
import {BaseConfig} from './baseConfig';
import {inject} from 'aurelia-dependency-injection';
import {Config, Rest} from 'aurelia-api';

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
    this.authService  = authService;
    this.config       = config.current;
  }

  /**
   * Interceptor for HttpClient
   *
   * @return {{request: Function}}
   */
  get interceptor() {
    return {
      request: (request) => {
        if (!this.authService.isAuthenticated() || !this.config.httpInterceptor) {
          return request;
        }
        let token = this.authService.getCurrentToken();

        if (this.config.authHeader && this.config.authToken) {
          token = `${this.config.authToken} ${token}`;
        }

        request.headers.set(this.config.authHeader, token);

        return request;
      },
      response: (response, request) => {
        return new Promise((resolve, reject) => {
          if (response.ok) {
            return resolve(response);
          }
          if (response.status !== 401) {
            return resolve(response);
          }
          if (!this.authService.isTokenExpired() || !this.config.httpInterceptor) {
            return resolve(response);
          }
          if (!this.authService.getRefreshToken()) {
            return resolve(response);
          }
          this.authService.updateToken().then(() => {
            let token = this.authService.getCurrentToken();
            if (this.config.authHeader && this.config.authToken) {
              token = `${this.config.authToken} ${token}`;
            }
            request.headers.append('Authorization', token);
            return this.client.fetch(request).then(resolve);
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
