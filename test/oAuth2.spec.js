import {Container} from 'aurelia-dependency-injection';
import {Config} from 'aurelia-api';

import {configure} from '../src/aurelia-authentication';
import {BaseConfig} from '../src/baseConfig';
import {Storage} from '../src/storage';
import {OAuth2} from '../src/oAuth2';

let noop = () => {};

function getContainer() {
  const container = new Container();
  const config    = container.get(Config);

  config
    .registerEndpoint('sx/default', 'http://localhost:1927/')
    .registerEndpoint('sx/custom', 'http://localhost:1927/custom')
    .setDefaultEndpoint('sx/default');

  configure({container: container, globalResources: noop}, {
    endpoint: '',
    loginRedirect: false,
    logoutRedirect: false,
    signupRedirect: false,
    baseUrl: 'http://localhost:1927/'
  });

  return container;
}

describe('OAuth2', () => {
  const container = getContainer();
  const storage = container.get(Storage);
  const baseConfig = container.get(BaseConfig);
  let popup = {
    open: (url, name, popupOptions, redirectUri) => {
      popup.url = url;
      popup.name = name;
      popup.popupOptions = popupOptions;
      popup.redirectUri = redirectUri;
      return popup;
    },
    eventListener: ()=>{},
    pollPopup: () => Promise.resolve({access_token: 'someToken'}),
    popupWindow: {location: null}
  };
  const oAuth2 = new OAuth2(storage, popup, baseConfig);

  describe('.exchangeForToken()', () => {
    it('fails with defaults', done => {
      oAuth2.exchangeForToken(
        {access_token: 'someToken'},
        {userData: 'some'},
        baseConfig.providers['facebook']
      ).then(res => {
        expect(res).toBeUndefined();
        expect(false).toBe(true);
        done();
      })
      .catch(err =>{
        expect(err instanceof TypeError);
        done();
      });
    });

    it('not fails with withCredentials = false', done => {
      baseConfig.withCredentials = false;
      oAuth2.exchangeForToken(
        {access_token: 'someToken'},
        {userData: 'some'},
        baseConfig.providers['facebook']
      ).then(res => {
        expect(res).toBeDefined();
        expect(res.path).toBe('/auth/facebook');
        expect(res.body.access_token).toBe('someToken');
        expect(res.body.userData).toBe('some');

        done();
      }).catch(err =>{
        expect(err).toBeUndefined();
        expect(false).toBe(true);
        done();
      });
    });
  });

  describe('.open()', () => {
    it('not fails with withCredentials = false', done => {
      baseConfig.withCredentials = false;
      oAuth2.open(baseConfig.providers['facebook'], {userData: 'some'})
        .then(res=>{
          expect(res).toBeDefined();
          expect(res.path).toBe('/auth/facebook');
          expect(res.body.access_token).toBe('someToken');
          expect(res.body.userData).toBe('some');
          expect(popup.url).toBe('https://www.facebook.com/v2.5/dialog/oauth?display=popup&redirect_uri=http%3A%2F%2Flocalhost%3A9876%2F&response_type=code&scope=email');

          done();
        })
        .catch(err =>{
          expect(err).toBeUndefined();
          expect(false).toBe(true);
          done();
        });
    });
  });

  describe('.buildQuery()', () => {
    it('return query', () => {
      const query = oAuth2.buildQuery(baseConfig.providers['facebook']);
      expect(query.display).toBe('popup');
      expect(query.scope).toBe('email');
    });
  });
});
