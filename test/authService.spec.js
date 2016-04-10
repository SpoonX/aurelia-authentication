import {Container} from 'aurelia-dependency-injection';
import {Config, Rest} from 'aurelia-api';

import {configure} from '../src/aurelia-authentication';
import {AuthService} from '../src/aurelia-authentication';
import {BaseConfig} from '../src/baseConfig';
import {Authentication} from '../src/authentication';

const noop = () => {};

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


describe('AuthService', () => {
  describe('.isAuthenticated()', () => {
    const container      = getContainer();
    const authentication = container.get(Authentication);
    const baseConfig     = container.get(BaseConfig);
    const authService    = container.get(AuthService);

    afterEach((done) => {
      authService.logout().then(done);
      baseConfig.autoUpdateToken = false;
    });

    it('should return boolean', () => {
      const result = authService.isAuthenticated();

      expect(typeof result).toBe('boolean');
    });

    it('should return Promise<boolean>', done => {
      const result = authService.isAuthenticated(true);

      expect(result instanceof Promise).toBe(true);
      result.then(authenticated => {
        expect(typeof authenticated).toBe('boolean');
        done();
      });
    });

    describe('with autoUpdateToken=true', () => {
      it('should return boolean true', () => {
        baseConfig.autoUpdateToken  = true;
        authentication.accessToken  = 'outdated';
        authentication.refreshToken = 'some';

        spyOn(authService, 'updateToken').and.returnValue(Promise.resolve(false));
        spyOn(authentication, 'isAuthenticated').and.returnValue(false);

        const result = authService.isAuthenticated();

        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
      });

      it('should return Promise<true>', done => {
        baseConfig.autoUpdateToken  = true;
        authentication.accessToken  = 'outdated';
        authentication.refreshToken = 'some';

        spyOn(authService, 'updateToken').and.returnValue(Promise.resolve(true));
        spyOn(authentication, 'isAuthenticated').and.returnValue(false);

        const result = authService.isAuthenticated(true);

        expect(result instanceof Promise).toBe(true);
        result.then(authenticated => {
          expect(typeof authenticated).toBe('boolean');
          expect(authenticated).toBe(true);
          done();
        });
      });
    });
  });

  describe('.signup()', () => {
    afterEach(done => {
      const container = getContainer();
      const authService = container.get(AuthService);
      authService.logout().then(done);
    });

    it('Should try to signup with signup data object and fail.', (done) => {
      const container = getContainer();
      const authService = container.get(AuthService);

      expect(authService.client instanceof Rest).toBe(true);

      authService.signup({user: 'some'})
        .then(res => {
          expect(res).toBeUndefined();
          expect(true).toBe(false);
          done();
        })
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          expect(authService.getAccessToken()).toBe(null);
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(false);

          expect(authService.getRefreshToken()).toBe(null);
          authService.updateToken()
            .then(res => {
              expect(res).toBeUndefined();
              expect(true).toBe(false);
              done();
            })
            .catch(err => {
              expect(err instanceof Error).toBe(true);
              done();
            });
        });
    });

    it('Should signup with signup data object and not login.', (done) => {
      const container   = getContainer();
      const authService = container.get(AuthService);
      const baseConfig  = container.get(BaseConfig);
      baseConfig.loginOnSignup = false;

      expect(authService.client instanceof Rest).toBe(true);

      authService.signup({user: 'some', access_token: 'aToken'})
        .then(response => {
          expect(response.path).toBe('/auth/signup');
          expect(response.body.user).toBe('some');
          expect(authService.getAccessToken()).toBe(null);
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(false);

          expect(authService.getRefreshToken()).toBe(null);
          authService.updateToken()
            .then(res => {
              expect(res).toBeUndefined();
              expect(true).toBe(false);
              done();
            })
            .catch(err => {
              expect(err instanceof Error).toBe(true);
              done();
            });
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });

    it('Should signup with signup data object and login.', (done) => {
      const container = getContainer();
      const authService = container.get(AuthService);

      expect(authService.client instanceof Rest).toBe(true);

      authService.signup({user: 'some', access_token: 'aToken'})
        .then(response => {
          expect(response.path).toBe('/auth/signup');
          expect(response.body.user).toBe('some');
          expect(authService.getAccessToken()).toBe('aToken');
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(true);

          expect(authService.getRefreshToken()).toBe(null);
          authService.updateToken()
            .then(res => {
              expect(res).toBeUndefined();
              expect(true).toBe(false);
              done();
            })
            .catch(err => {
              expect(err instanceof Error).toBe(true);
              done();
            });
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });
  });

  describe('.login()', () => {
    afterEach((done) => {
      const container = getContainer();
      const authService = container.get(AuthService);
      authService.logout().then(done);
    });

    it('Should try to login with login data object and fail.', (done) => {
      const container = getContainer();
      const authService = container.get(AuthService);

      expect(authService.client instanceof Rest).toBe(true);

      authService.login({user: 'some'})
        .then(res => {
          expect(res).toBeUndefined();
          expect(true).toBe(false);
          done();
        })
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          expect(authService.getAccessToken()).toBe(null);
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(false);

          expect(authService.getRefreshToken()).toBe(null);
          authService.updateToken()
            .then(res => {
              expect(res).toBeUndefined();
              expect(true).toBe(false);
              done();
            })
            .catch(err => {
              expect(err instanceof Error).toBe(true);
              done();
            });
        });
    });

    it('Should login with login data object.', (done) => {
      const container = getContainer();
      const authService = container.get(AuthService);

      expect(authService.client instanceof Rest).toBe(true);

      authService.login({user: 'some', access_token: 'aToken'})
        .then(response => {
          expect(response.path).toBe('/auth/login');
          expect(response.body.user).toBe('some');
          expect(authService.getAccessToken()).toBe('aToken');
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(true);

          expect(authService.getRefreshToken()).toBe(null);
          authService.updateToken()
            .then(res => {
              expect(res).toBeUndefined();
              expect(true).toBe(false);
              done();
            })
            .catch(err => {
              expect(err instanceof Error).toBe(true);
              done();
            });
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });
  });

  describe('.unlink()', () => {
    it('Should unlink provider.', (done) => {
      const container = getContainer();
      const authService = container.get(AuthService);

      authService.unlink('some')
        .then(response => {
          expect(response.method).toBe('GET');
          expect(response.path).toBe('/auth/unlink/some');
          done();
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });

    it('Should unlink provider using POST.', (done) => {
      const container   = getContainer();
      const authService = container.get(AuthService);
      authService.config.unlinkMethod = 'post';

      authService.unlink('some')
        .then(response => {
          expect(response.method).toBe('POST');
          expect(response.path).toBe('/auth/unlink/some');
          done();
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });
  });

  describe('.authenticate()', () => {
    const container      = getContainer();
    const authentication = container.get(Authentication);
    const baseConfig     = container.get(BaseConfig);

    authentication.oAuth1.open = (provider, userData) => Promise.resolve({
      provider: provider,
      userData: userData,
      access_token: 'oauth1'
    });

    authentication.oAuth2.open = (provider, userData) => Promise.resolve({
      provider: provider,
      userData: userData,
      access_token: 'oauth2'
    });

    afterEach((done) => {
      const authService = container.get(AuthService);
      authService.logout().then(done);
    });

    it('Should authenticate with oAuth1 provider and login.', (done) => {
      const authService = new AuthService(authentication, baseConfig);
      spyOn(authentication.oAuth1, 'open').and.callThrough();

      authService.authenticate('twitter', null, {data: 'some'})
        .then(response => {
          expect(response.provider).toBe(baseConfig.providers['twitter']);
          expect(response.userData.data).toBe('some');
          expect(response.access_token).toBe('oauth1');

          expect(authService.getAccessToken()).toBe('oauth1');
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(true);
          done();
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });

    it('Should authenticate with oAuth2 provider and login.', (done) => {
      const authService = new AuthService(authentication, baseConfig);
      spyOn(authentication.oAuth2, 'open').and.callThrough();

      authService.authenticate('facebook', null, {data: 'some'})
        .then(response => {
          expect(response.provider).toBe(baseConfig.providers['facebook']);
          expect(response.userData.data).toBe('some');
          expect(response.access_token).toBe('oauth2');

          expect(authService.getAccessToken()).toBe('oauth2');
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(true);
          done();
        })
        .catch(err => {
          expect(err).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });

    it('Should try to authenticate with and fail.', (done) => {
      const authService = new AuthService(authentication, baseConfig);
      spyOn(authentication.oAuth2, 'open').and.returnValue(Promise.resolve());

      authService.authenticate('facebook')
        .then(res => {
          expect(res).toBeUndefined();
          expect(true).toBe(false);
          done();
        })
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          expect(authService.getAccessToken()).toBe(null);
          expect(authService.getTokenPayload()).toBe(null);
          expect(authService.isTokenExpired()).toBe(undefined);
          expect(authService.isAuthenticated()).toBe(false);

          done();
        });
    });
  });

  describe('.updateToken', () => {
    const container      = new Container();
    const authService = container.get(AuthService);

    it('fail without refreshToken', done => {
      authService.updateToken()
      .then(res => {
        expect(res).toBeUndefined();
        expect(true).toBe(false);
        done();
      })
      .catch(error => {
        expect(error instanceof Error).toBe(true);
        done();
      });
    });

    it('fail on no token in response', done => {
      authService.authentication.accessToken = null;
      authService.authentication.refreshToken = 'some';
      authService.config.client = {
        post: () => Promise.resolve({Error: 'serverError'})
      };

      authService.updateToken()
        .then(res => {
          expect(error).toBeUndefined();
          expect(true).toBe(false);
          done();
        })
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          expect(authService.authentication.isAuthenticated()).toBe(false);
          done();
        });
    });

    it('fail with same response if called several times', done => {
      authService.authentication.accessToken = null;
      authService.authentication.refreshToken = 'some';
      authService.config.client = {
        post: () => Promise.resolve({Error: 'no token'})
      };

      authService.updateToken()
        .then(res => {
          expect(error).toBeUndefined();
          expect(true).toBe(false);
          done();
        })
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          expect(authService.authentication.isAuthenticated()).toBe(false);
        });

      authService.config.client = {
        post: () => Promise.resolve({token: 'valid token'})
      };

      authService.updateToken()
        .then(res => {
          expect(error).toBeUndefined();
          expect(true).toBe(false);
          done();
        })
        .catch(error => {
          expect(error instanceof Error).toBe(true);
          expect(authService.authentication.isAuthenticated()).toBe(false);
          done();
        });
    });

    it('get new accessToken', done => {
      authService.authentication.accessToken = null;
      authService.authentication.refreshToken = 'some';
      authService.config.client = {
        post: () => Promise.resolve({token: 'newToken'})
      };

      authService.updateToken()
      .then(res => {
        expect(authService.authentication.isAuthenticated()).toBe(true);
        expect(authService.authentication.accessToken).toBe('newToken');
        done();
      })
      .catch(error => {
        expect(error).toBeUndefined();
        expect(true).toBe(false);
        done();
      });
    });

    it('get same new accessToken if called several times', done => {
      authService.authentication.accessToken = null;
      authService.authentication.refreshToken = 'some';
      authService.config.client = {
        post: () => Promise.resolve({token: 'newToken'})
      };

      authService.updateToken()
      .then(res => {
        expect(authService.authentication.isAuthenticated()).toBe(true);
        expect(authService.authentication.accessToken).toBe('newToken');
      })
      .catch(error => {
        expect(error).toBeUndefined();
        expect(true).toBe(false);
        done();
      });

      authService.config.client = {
        post: () => Promise.resolve({token: 'other newToken'})
      };
      authService.updateToken()
        .then(res => {
          expect(authService.authentication.isAuthenticated()).toBe(true);
          expect(authService.authentication.accessToken).toBe('newToken');
          done();
        })
        .catch(error => {
          expect(error).toBeUndefined();
          expect(true).toBe(false);
          done();
        });
    });
  });
});
