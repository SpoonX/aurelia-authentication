import {Container} from 'aurelia-dependency-injection';

import {Authentication} from '../src/authentication';

const tokenPast = {
  payload: {
    'name': 'tokenPast',
    'admin': false,
    'exp': '0460017154'
  },
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidG9rZW5QYXN0IiwiYWRtaW4iOmZhbHNlLCJleHAiOiIwNDYwMDE3MTU0In0.Z7QE185hOWL6xxVDmlFpNEmgA-_Vg2bjV9uDRkkVaQY'
};

const tokenFuture = {
  payload: {
    'name': 'tokenFuture',
    'admin': true,
    'exp': '2460017154'
  },
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidG9rZW5GdXR1cmUiLCJhZG1pbiI6dHJ1ZSwiZXhwIjoiMjQ2MDAxNzE1NCJ9.iHXLzWGY5U9WwVT4IVRLuKTf65XpgrA1Qq_Jlynv6bc'
};

describe('Authentication', () => {
  describe('.accessToken', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_access_token');
    });

    it('Should set accessToken', () => {
      authentication.accessToken = 'some';
      expect(window.localStorage.getItem('aurelia_access_token')).toBe('some');
    });

    it('Should set accessToken', () => {
      window.localStorage.setItem('aurelia_access_token', 'another');
      expect(authentication.accessToken).toBe('another');
    });

    it('Should delete accessToken', () => {
      window.localStorage.setItem('aurelia_access_token', 'another');
      authentication.accessToken = 0;
      expect(window.localStorage.getItem('aurelia_access_token')).toBe(null);
    });
  });

  describe('.refreshToken', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_refresh_token');
    });

    it('Should set refreshToken', () => {
      authentication.refreshToken = 'some';
      expect(window.localStorage.getItem('aurelia_refresh_token')).toBe('some');
    });

    it('Should set refreshToken', () => {
      window.localStorage.setItem('aurelia_refresh_token', 'another');
      expect(authentication.refreshToken).toBe('another');
    });

    it('Should delete refreshToken', () => {
      window.localStorage.setItem('aurelia_refresh_token', 'another');
      authentication.refreshToken = 0;
      expect(window.localStorage.getItem('aurelia_refresh_token')).toBe(null);
    });
  });

  describe('.getPayload', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      authentication.accessToken = null;
    });

    it('Should return payload of proper JWT token', () => {
      authentication.accessToken = tokenPast.jwt;
      const payload = authentication.getPayload();

      expect(JSON.stringify(payload)).toBe(JSON.stringify(tokenPast.payload));
    });

    it('Should return null for JWT-like token', () => {
      authentication.accessToken = 'xx.yy.zz';
      const payload = authentication.getPayload();

      expect(payload).toBe(null);
    });

    it('Should return null for non-JWT-like token', () => {
      authentication.accessToken = 'xxyyzz';
      const payload = authentication.getPayload();

      expect(payload).toBe(null);
    });
  });

  describe('.isTokenExpired', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_access_token');
    });

    it('Should be undefined if payload.exp is not set', () => {
      const isTokenExpired = authentication.isTokenExpired();

      expect(isTokenExpired).toBe(undefined);
    });

    it('Should be true if payload.exp is in the past', () => {
      authentication.accessToken = tokenPast.jwt;
      const isTokenExpired = authentication.isTokenExpired();

      expect(isTokenExpired).toBe(true);
    });

    it('Should be false if payload.exp is in the future', () => {
      authentication.accessToken = tokenFuture.jwt;
      const isTokenExpired = authentication.isTokenExpired();

      expect(isTokenExpired).toBe(false);
    });
  });

  describe('.isAuthenticated', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_access_token');
    });

    it('Should be false when no token present', () => {
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });

    it('Should be true when token not JWT-like ', () => {
      authentication.accessToken = 'xxyyzz';
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('Should be true when token only JWT-like ', () => {
      authentication.accessToken = 'xx.yy.zz';
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('Should be false if JWT token expired', () => {
      authentication.accessToken = tokenPast.jwt;
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });

    it('Should be true if JWT token not expired', () => {
      authentication.accessToken = tokenFuture.jwt;
      spyOn(authentication, 'isTokenExpired').and.returnValue(false);
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });
  });

  describe('.getTokenFromResponse', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_access_token');
    });

    it('Should return null if response is empty', () => {
      expect(authentication.getTokenFromResponse()).toBe(null);
    });

    it('Should return null if response is not string or object', () => {
      expect(authentication.getTokenFromResponse(1)).toBe(null);
    });

    it('Should return token if response has a string in tokenProp', () => {
      expect(authentication.getTokenFromResponse(
        {tokenProp: 'some'},
        'tokenProp'
      )).toBe('some');
    });

    it('Should return token if response has a string in tokenName of tokenProp', () => {
      expect(authentication.getTokenFromResponse(
        {tokenProp: {tokenName: 'some'}},
        'tokenProp',
        'tokenName'
      )).toBe('some');
    });

    it('Should return token if response has a string in tokenName in tokenRoot of tokenProp', () => {
      expect(authentication.getTokenFromResponse(
        {tokenProp: {tokenRoot1: {tokenRoot2: {tokenName: 'some'}}}},
        'tokenProp',
        'tokenName',
        'tokenRoot1.tokenRoot2'
      )).toBe('some');
    });
  });

  describe('.setAccessTokenFromResponse', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_access_token');
    });

    it('Should throw when no access token response', () => {
      const fail = () => authentication.setAccessTokenFromResponse;

      expect(fail()).toThrow();
    });

    it('Should set access token if present in response', () => {
      authentication.setAccessTokenFromResponse({access_token: 'token'});

      expect(authentication.accessToken).toBe('token');
    });
  });

  describe('.setRefreshTokenFromResponse', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_refresh_token');
    });

    it('Should throw when no refresh token response', () => {
      const fail = () => authentication.setRefreshTokenFromResponse;

      expect(fail()).toThrow();
    });

    it('Should set refesh token if present in response', () => {
      authentication.setRefreshTokenFromResponse({refresh_token: 'token'});

      expect(authentication.refreshToken).toBe('token');
    });
  });

  describe('.logout', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    it('clear tokens', (done) => {
      window.localStorage.setItem('aurelia_access_token', 'some');
      window.localStorage.setItem('aurelia_refresh_token', 'another');

      const promise = authentication.logout();
      expect(promise instanceof Promise).toBe(true);

      promise.then(() => {
        expect(window.localStorage.getItem('aurelia_access_token')).toBe(null);
        expect(window.localStorage.getItem('aurelia_refresh_token')).toBe(null);

        done();
      });
    });
  });

  describe('.redirect', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    it('should not redirect with redirectUri===false', () => {
      authentication.redirect(false, 'somewhere');

      // basically just don't get the window reload error
      expect(true).toBe(true);
    });
  });
});
