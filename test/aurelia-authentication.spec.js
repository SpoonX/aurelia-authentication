import {Container} from 'aurelia-dependency-injection';
import {
  configure,
  FetchConfig,
  AuthService,
  AuthorizeStep,
  authUtils
} from '../src/aurelia-authentication';
import {BaseConfig} from '../src/baseConfig';
import {Config, Rest} from 'spoonx/aurelia-api';
import {HttpClient} from 'aurelia-fetch-client';

let noop = () => {
};

function getContainer() {
  let container = new Container();
  let config    = container.get(Config);

  config
    .registerEndpoint('sx/default', 'http://localhost:1927/')
    .registerEndpoint('sx/custom', 'http://localhost:1927/custom')
    .setDefaultEndpoint('sx/default');

  return container;
}

describe('aurelia-authentication', function() {
  describe('export', function() {
    it('Should export configure', function() {
      expect(configure).toBeDefined();
    });

    it('Should export FetchConfig', function() {
      expect(FetchConfig).toBeDefined();
    });

    it('Should export AuthService', function() {
      expect(AuthService).toBeDefined();
    });

    it('Should export AuthorizeStep', function() {
      expect(AuthorizeStep).toBeDefined();
    });

    it('Should export authUtils', function() {
      expect(authUtils).toBeDefined();
    });
  });

  describe('configure()', function() {
    it('Should call globalResources configuration to be passed as a function.', function() {
      let container = new Container();

      configure({
        container: container, globalResources: resource => {
          expect(resource).toEqual('./authFilter');
        }
      }, noop);
    });

    it('Should allow configuration to be passed as a function.', function() {
      let container = new Container();

      configure({container: container, globalResources: noop}, builder => {
        expect(builder instanceof BaseConfig).toBe(true);
      });
    });

    it('Should allow configuration to be passed as an object.', function() {
      let container  = new Container();
      let baseConfig = container.get(BaseConfig);

      configure({container: container, globalResources: noop}, {baseUrl: 'something'});

      expect(baseConfig.current.baseUrl).toEqual('something');
    });

    it('Should not allow configuration with unregistered endpoint', function() {
      let container  = new Container();

      let configureWithTypo = () => configure({container: container, globalResources: noop}, {endpoint: 'something'});

      expect(configureWithTypo).toThrow();
    });

    it('Should configure configured endpoints.', function() {
      let container    = getContainer();
      let fetchConfig  = container.get(FetchConfig);
      let clientConfig = container.get(Config);

      configure({container: container, globalResources: noop}, {configureEndpoints: ['sx/default', 'sx/custom']});

      let clientOneInterceptor = clientConfig.getEndpoint('sx/default').client.interceptors[0].toString();
      let clientTwoInterceptor = clientConfig.getEndpoint('sx/custom').client.interceptors[0].toString();
      let configInterceptor    = fetchConfig.interceptor.toString();

      expect(clientOneInterceptor).toEqual(configInterceptor);
      expect(clientTwoInterceptor).toEqual(configInterceptor);
    });

    it('Should configure default endpoint.', function() {
      let container    = getContainer();
      let fetchConfig  = container.get(FetchConfig);
      let clientConfig = container.get(Config);

      configure({container: container, globalResources: noop}, {configureEndpoints: ['']});

      let clientOneInterceptor = clientConfig.getEndpoint().client.interceptors[0].toString();
      let configInterceptor    = fetchConfig.interceptor.toString();

      expect(clientOneInterceptor).toEqual(configInterceptor);
    });

    it('Should set the configured endpoint as a client.', function() {
      let container    = getContainer();
      let baseConfig   = container.get(BaseConfig);
      let clientConfig = container.get(Config);

      configure({container: container, globalResources: noop}, {endpoint: 'sx/custom'});

      expect(baseConfig.current.endpoint).toEqual('sx/custom');
      expect(baseConfig.current.client).toBe(clientConfig.getEndpoint('sx/custom'));
    });

    it('Should set the default HttpClient as client if no endpoint was supplied.', function() {
      let container  = new Container();
      let baseConfig = container.get(BaseConfig);

      configure({container: container, globalResources: noop}, {});

      expect(baseConfig.current.endpoint).toEqual(null);
      expect(baseConfig.current.client instanceof Rest).toBe(true);
      expect(baseConfig.current.client.client).toBe(container.get(HttpClient));
    });
  });
});
