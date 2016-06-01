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
});
