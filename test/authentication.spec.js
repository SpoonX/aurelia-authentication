import {Container} from 'aurelia-dependency-injection';

import {Authentication} from '../src/authentication';

const tokenPast = {
  payload: {
    name: 'tokenPast',
    admin: false,
    exp: '0460017154'
  },
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidG9rZW5QYXN0IiwiYWRtaW4iOmZhbHNlLCJleHAiOiIwNDYwMDE3MTU0In0.Z7QE185hOWL6xxVDmlFpNEmgA-_Vg2bjV9uDRkkVaQY'
};

const tokenFuture = {
  payload: {
    name: 'tokenFuture',
    admin: true,
    exp: '2460017154'
  },
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidG9rZW5GdXR1cmUiLCJhZG1pbiI6dHJ1ZSwiZXhwIjoiMjQ2MDAxNzE1NCJ9.iHXLzWGY5U9WwVT4IVRLuKTf65XpgrA1Qq_Jlynv6bc'
};


describe('Authentication', () => {
  describe('.constructor()', () => {
    const container = new Container();

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      container.get(Authentication).deleteData();
    });

    it('should return old accessToken and delete in storage', () => {
      window.localStorage.setItem('aurelia_token', 'old one');

      const authentication = container.get(Authentication);
      const token = authentication.getAccessToken();

      expect(token).toBe('old one');
    });
  });


  describe('.responseObject', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should get {} if no responseObject stored', () => {
      window.localStorage.removeItem('aurelia_authentication');

      const responseObject = authentication.responseObject;
      expect(typeof responseObject === 'object').toBe(true);
      expect(responseObject).toBe(null);
    });

    it('Should get stored responseObject', () => {
      window.localStorage.setItem('aurelia_authentication', JSON.stringify({access_token: 'another'}));

      const responseObject = authentication.responseObject;
      expect(typeof responseObject === 'object').toBe(true);
      expect(responseObject.access_token).toBe('another');
    });

    it('Should set with object', () => {
      authentication.responseObject = {access_token: 'some'};

      expect(JSON.parse(window.localStorage.getItem('aurelia_authentication')).access_token).toBe('some');
    });

    it('Should delete', () => {
      window.localStorage.setItem('aurelia_authentication', 'another');

      authentication.responseObject = null;
      expect(window.localStorage.getItem('aurelia_authentication')).toBe(null);
    });
  });

  describe('.getAccessToken()', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should analyze response first and return accessToken', () => {
      authentication.responseObject = {access_token: 'some'};

      expect(authentication.getAccessToken()).toBe('some');
    });
  });

  describe('.getRefreshToken()', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.config.useRefreshToken = false;
      authentication.deleteData();
    });

    it('Should analyze response first and return refreshToken', () => {
      authentication.config.useRefreshToken = true;
      authentication.responseObject = {token: 'some', refresh_token: 'another'};

      expect(authentication.getRefreshToken()).toBe('another');
    });
  });

  describe('.getPayload()', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should return null for JWT-like token', () => {
      authentication.responseObject = {token: 'xx.yy.zz'};
      const payload = authentication.payload;

      expect(payload).toBe(null);
    });

    it('Should return null for non-JWT-like token', () => {
      authentication.responseObject = {token: 'some'};
      const payload = authentication.payload;

      expect(payload).toBe(null);
    });

    it('Should analyze response first and return payload', () => {
      authentication.responseObject = {token: tokenFuture.jwt};

      const payload = authentication.getPayload();
      expect(typeof payload === 'object').toBe(true);
      expect(JSON.stringify(payload)).toBe(JSON.stringify(tokenFuture.payload));
    });
  });

  describe('.getExp()', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should analyze response first and return exp', () => {
      authentication.responseObject = {token: tokenPast.jwt};

      const exp = authentication.getExp();
      expect(typeof exp === 'number').toBe(true);
      expect(exp).toBe(Number(tokenPast.payload.exp));
    });
  });


  describe('.getTtl()', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should be NaN for Non-JWT', () => {
      authentication.responseObject = {token: 'some'};
      const timeLeft = authentication.getTtl();

      expect(typeof timeLeft === 'number').toBe(true);
      expect(Number.isNaN(timeLeft)).toBe(true);
    });

    it('Should be exp-currentTime for JWT', () => {
      authentication.responseObject = {token: tokenPast.jwt};

      const timeLeft = authentication.getTtl();
      expect(typeof timeLeft === 'number').toBe(true);
      expect(timeLeft).toBe(tokenPast.payload.exp - Math.round(new Date().getTime() / 1000));
    });
  });

  describe('.isTokenExpired()', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should be undefined for Non-JWT', () => {
      authentication.responseObject = {token: 'some'};
      const isTokenExpired = authentication.isTokenExpired();

      expect(isTokenExpired).toBe(undefined);
    });

    it('Should be true when JWT expired', () => {
      authentication.responseObject = {token: tokenPast.jwt};

      const isTokenExpired = authentication.isTokenExpired();
      expect(typeof isTokenExpired === 'boolean').toBe(true);
      expect(isTokenExpired).toBe(true);
    });

    it('Should false when JWT not expired', () => {
      authentication.responseObject = {token: tokenFuture.jwt};

      const isTokenExpired = authentication.isTokenExpired();
      expect(typeof isTokenExpired === 'boolean').toBe(true);
      expect(isTokenExpired).toBe(false);
    });
  });


  describe('.isAuthenticated', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should be false when no token present', () => {
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });

    it('Should be true when non-JWT token present', () => {
      authentication.responseObject = {token: 'some'};
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('Should be true when JWT-like token present', () => {
      authentication.responseObject = {token: 'xx.yy.zz'};
      const isAuthenticated = authentication.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('Should be false when JWT expired', () => {
      authentication.responseObject = {token: tokenPast.jwt};

      const isAuthenticated = authentication.isAuthenticated();
      expect(isAuthenticated).toBe(false);
    });

    it('Should be false when JWT not expired', () => {
      authentication.responseObject = {token: tokenFuture.jwt};

      const isAuthenticated = authentication.isAuthenticated();
      expect(isAuthenticated).toBe(true);
    });
  });


  describe('.getTokenFromResponse', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should not throw if response is empty', () => {
      const fail = () => authentication.getTokenFromResponse();

      expect(fail).not.toThrow();
    });

    it('Should throw if response is not string or object', () => {
      const fail = () => authentication.getTokenFromResponse(1);

      expect(fail).toThrow();
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


  describe('.getDataFromResponse', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    afterEach(() => {
      window.localStorage.removeItem('aurelia_authentication');
      authentication.deleteData();
    });

    it('Should set data from non-JWT response', () => {
      authentication.getDataFromResponse({access_token: 'token'});

      expect(authentication.hasDataStored).toBe(true);
      expect(authentication.accessToken).toBe('token');
      expect(authentication.payload).toBe(null);
      expect(Number.isNaN(authentication.exp)).toBe(true);
    });

    it('Should set data from JWT-like response', () => {
      authentication.getDataFromResponse({access_token: 'xx.yy.zz'});

      expect(authentication.hasDataStored).toBe(true);
      expect(authentication.accessToken).toBe('xx.yy.zz');
      expect(authentication.payload).toBe(null);
      expect(Number.isNaN(authentication.exp)).toBe(true);
    });

    it('Should set data from JWT response', () => {
      authentication.getDataFromResponse({access_token: tokenFuture.jwt});

      expect(authentication.hasDataStored).toBe(true);
      expect(authentication.accessToken).toBe(tokenFuture.jwt);
      expect(JSON.stringify(authentication.payload)).toBe(JSON.stringify(tokenFuture.payload));
      expect(authentication.exp).toBe(Number(tokenFuture.payload.exp));
    });
  });


  describe('.redirect', () => {
    const container      = new Container();
    const authentication = container.get(Authentication);

    it('should not redirect with redirectUri===0', () => {
      authentication.redirect(0, 'somewhere');

      // basically just don't get the window reload error
      expect(true).toBe(true);
    });
  });
});
