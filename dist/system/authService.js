'use strict';

System.register(['aurelia-dependency-injection', './authentication', './baseConfig', './oAuth1', './oAuth2', './authUtils'], function (_export, _context) {
  var inject, Authentication, BaseConfig, OAuth1, OAuth2, authUtils, _typeof, _dec, _class, AuthService;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_aureliaDependencyInjection) {
      inject = _aureliaDependencyInjection.inject;
    }, function (_authentication) {
      Authentication = _authentication.Authentication;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_oAuth) {
      OAuth1 = _oAuth.OAuth1;
    }, function (_oAuth2) {
      OAuth2 = _oAuth2.OAuth2;
    }, function (_authUtils) {
      authUtils = _authUtils.authUtils;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
      };

      _export('AuthService', AuthService = (_dec = inject(Authentication, OAuth1, OAuth2, BaseConfig), _dec(_class = function () {
        function AuthService(auth, oAuth1, oAuth2, config) {
          _classCallCheck(this, AuthService);

          this.auth = auth;
          this.oAuth1 = oAuth1;
          this.oAuth2 = oAuth2;
          this.config = config.current;
          this.client = this.config.client;
        }

        AuthService.prototype.getMe = function getMe(criteria) {
          if (typeof criteria === 'string' || typeof criteria === 'number') {
            criteria = { id: criteria };
          }
          return this.client.find(this.auth.getProfileUrl(), criteria);
        };

        AuthService.prototype.updateMe = function updateMe(body, criteria) {
          if (typeof criteria === 'string' || typeof criteria === 'number') {
            criteria = { id: criteria };
          }
          return this.client.update(this.auth.getProfileUrl(), criteria, body);
        };

        AuthService.prototype.isAuthenticated = function isAuthenticated() {
          return this.auth.isAuthenticated();
        };

        AuthService.prototype.getTokenPayload = function getTokenPayload() {
          return this.auth.getPayload();
        };

        AuthService.prototype.signup = function signup(displayName, email, password) {
          var _this = this;

          var signupUrl = this.auth.getSignupUrl();
          var content = void 0;
          if (_typeof(arguments[0]) === 'object') {
            content = arguments[0];
          } else {
            content = {
              'displayName': displayName,
              'email': email,
              'password': password
            };
          }
          return this.client.post(signupUrl, content).then(function (response) {
            if (_this.config.loginOnSignup) {
              _this.auth.setTokenFromResponse(response);
            } else if (_this.config.signupRedirect) {
              window.location.href = _this.config.signupRedirect;
            }

            return response;
          });
        };

        AuthService.prototype.login = function login(email, password) {
          var _this2 = this;

          var loginUrl = this.auth.getLoginUrl();
          var content = void 0;
          if (typeof arguments[1] !== 'string') {
            content = arguments[0];
          } else {
            content = {
              'email': email,
              'password': password
            };
          }

          return this.client.post(loginUrl, content).then(function (response) {
            _this2.auth.setTokenFromResponse(response);

            return response;
          });
        };

        AuthService.prototype.logout = function logout(redirectUri) {
          return this.auth.logout(redirectUri);
        };

        AuthService.prototype.authenticate = function authenticate(name, redirect, userData) {
          var _this3 = this;

          var provider = this.oAuth2;
          if (this.config.providers[name].type === '1.0') {
            provider = this.oAuth1;
          }

          return provider.open(this.config.providers[name], userData || {}).then(function (response) {
            _this3.auth.setTokenFromResponse(response, redirect);
            return response;
          });
        };

        AuthService.prototype.unlink = function unlink(provider) {
          var unlinkUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.config.unlinkUrl) : this.config.unlinkUrl;

          if (this.config.unlinkMethod === 'get') {
            return this.client.find(unlinkUrl + provider);
          } else if (this.config.unlinkMethod === 'post') {
            return this.client.post(unlinkUrl, provider);
          }
        };

        return AuthService;
      }()) || _class));

      _export('AuthService', AuthService);
    }
  };
});