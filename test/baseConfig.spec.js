import {Container} from 'aurelia-dependency-injection';

import {BaseConfig} from '../src/baseConfig';

describe('BaseConfig', () => {
  describe('.configure()', () => {
    it('Should merge incomming with base', () => {
      const container = new Container();
      const baseConfig = container.get(BaseConfig);


      baseConfig.configure({providers: {google: {name: 'not google'}}});

      expect(baseConfig.providers.google.name).toBe('not google');
      expect(JSON.stringify(baseConfig.providers.google.popupOptions))
        .toBe(JSON.stringify({width: 452, height: 633}));
      expect(baseConfig.providers.facebook.name).toBe('facebook');
    });
  });

  describe('.joinBase()', () => {
    it('Should join baseUrl with path', () => {
      const container = new Container();
      const baseConfig = container.get(BaseConfig);
      baseConfig.baseUrl = 'http://localhost:1927/';

      expect(baseConfig.joinBase('/xy')).toBe('http://localhost:1927/xy');
    });
  });

  describe('.getOptionsForTokenRequests()', () => {
    it('When given empty or undefined object as input, should return default values set in config object', () => {
      const container = new Container();
      const baseConfig = container.get(BaseConfig);
      const resultOptions = baseConfig.getOptionsForTokenRequests();

      expect(resultOptions.headers['Content-Type']).toBe(baseConfig.defaultHeadersForTokenRequests['Content-Type']);
    });

    it('When given object with values, should return object with values overridden by input object', () => {
      const container = new Container();
      const baseConfig = container.get(BaseConfig);
      const contentType = 'test';
      const resultOptions = baseConfig.getOptionsForTokenRequests({
        headers: {
          'Content-Type': contentType
        }
      });

      expect(resultOptions.headers['Content-Type']).toBe(resultOptions.headers['Content-Type']);
    });
  });
});
