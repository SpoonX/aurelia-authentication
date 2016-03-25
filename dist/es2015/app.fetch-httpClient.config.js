var _dec, _class;

import { HttpClient } from 'aurelia-fetch-client';
import { Authentication } from './authentication';
import { BaseConfig } from './baseConfig';
import { inject } from 'aurelia-dependency-injection';
import { Config, Rest } from 'spoonx/aurelia-api';

export let FetchConfig = (_dec = inject(HttpClient, Config, Authentication, BaseConfig), _dec(_class = class FetchConfig {
  constructor(httpClient, clientConfig, authentication, config) {
    this.httpClient = httpClient;
    this.clientConfig = clientConfig;
    this.auth = authentication;
    this.config = config.current;
  }

  get interceptor() {
    let auth = this.auth;
    let config = this.config;

    return {
      request(request) {
        if (!auth.isAuthenticated() || !config.httpInterceptor) {
          return request;
        }

        let token = auth.getToken();

        if (config.authHeader && config.authToken) {
          token = `${ config.authToken } ${ token }`;
        }

        request.headers.append(config.authHeader, token);

        return request;
      }
    };
  }

  configure(client) {
    if (Array.isArray(client)) {
      let configuredClients = [];
      client.forEach(toConfigure => {
        configuredClients.push(this.configure(toConfigure));
      });

      return configuredClients;
    }

    if (typeof client === 'string') {
      client = this.clientConfig.getEndpoint(client).client;
    } else if (client instanceof Rest) {
      client = client.client;
    } else if (!(client instanceof HttpClient)) {
      client = this.httpClient;
    }

    client.interceptors.push(this.interceptor);

    return client;
  }
}) || _class);