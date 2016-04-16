# aurelia-authentication

[![Build Status](https://travis-ci.org/SpoonX/aurelia-authentication.svg)](https://travis-ci.org/SpoonX/aurelia-authentication)
[![Known Vulnerabilities](https://snyk.io/test/npm/name/badge.svg)](https://snyk.io/test/npm/aurelia-authentication)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Aurelia-authentication is a token-based authentication plugin for [Aurelia](http://aurelia.io/) with support for popular social authentication providers (Google, Twitter, Facebook, LinkedIn, Windows Live, FourSquare, Yahoo, Github, Instagram) and a local stragegy, i.e. simple username / email and password. It developed of a fork of [paul van bladel's aurelia-auth](https://github.com/paulvanbladel/aurelia-auth/) which itself is a port of the great [Satellizer](https://github.com/sahat/satellizer/) library.

Aurelia-authentication makes local and third-party authentication easy. Burelia-authentication does not use any cookies but relies on a token (designed for JWT, but has basic support for others as well) stored in the local storage of the browser. If your server is setup right, it can be a simple as just to select your server endpoint from your [aurelia-api](https://github.com/SpoonX/aurelia-api) setup, add your third-party client ids and you are ready to go.

You have multiple endpoints? No problem! In the recommended setting,  aurelia-authentication makes use of [aurelia-api](https://github.com/SpoonX/aurelia-api) which can set up multiple endpoints. Just specifiy in your aurelia-authentication configuration which endpoint you want to use for your server and which further endpoints you want to be configured and your token will be sent automatically to your protected API when the user is authenticated.

With aurelia-authentication you can:

* Use local or third-party providers to authenticate the user
* Automatically add your token to requests to the specified endpoints
* Automatically refresh your token
* Extensivly customize the settings
* Use standalone or in conjuction with [aurelia-api](https://github.com/SpoonX/aurelia-api)
* And more

## Important note

We've simplified installation and usage! This plugin should now be installed using `jspm i aurelia-authentication` or (for webpack) `npm i aurelia-authentication`. Make sure you update all references to `spoonx/aurelia-authentication` and `spoonx/aurelia-api` and remove the `spoonx/` prefix (don't forget your config.js, package.json, imports and bundles).

## Installation

Run `jspm i aurelia-authentication`, or (for webpack) `npm i aurelia-authentication`, from your project root.

## Documentation

You can find usage examples and the documentation at [aurelia-authentication-docs](http://aurelia-authentication.spoonx.org/).

The [changelog](doc/changelog.md) provides you with information about important changes.

## Usage

### Add a configuration file

Set your custom configuration. You can find  all options and the default values in the [baseConfig](http://aurelia-authentication.spoonx.org/baseConfig).

```js
/* authConfig.js */
var baseConfig = {
    endpoint: 'auth',             // use 'auth' endpoint for the auth server
    configureEndpoints: ['auth']  // add Authorization header to 'auth' endpoint
    facebook: {
        clientId: 'your client id' // set your third-party providers client ids
    }
```

### Configure the plugin

Register the plugin and apply your `authConfig`.

```js
/* main.js */
import authConfig from './authConfig';

aurelia.use
  /* Your other plugins and init code */
  .plugin('aurelia-api', config => {
    // Register an authentication hosts
    config.registerEndpoint('auth');
  })
  /* configure aurelia-authentication */
  .plugin('aurelia-authentication', baseConfig => {
      baseConfig.configure(authConfig);
  });
```

### Use AuthService in a view-model

```js
import {AuthService} from 'aurelia-authentication';
import {inject} from 'aurelia-framework';

@inject(AuthService)
export class Login {
    constructor(authService) {
        this.authService   = authService;
        this.authenticated = false;
        this.providers     = [];
    };

    // use authService.login(credentialsObject) to login to your auth server
    login(credentialsObject) {
      return this.authService.login(credentialsObject)
        .then(response => {
            this.authenticated = this.authService.isAuthenticated();
        });
    };

    // use authService.logout to delete stored tokens
    logout() {
      return this.authService.logout()
        .then(() => {
          this.authenticated = this.authService.isAuthenticated();
        });
    }

    // use authenticate(providerName) to get third-party authenticaten
    authenticate(name) {
      return this.authService.authenticate(name)
        .then(response => {
          this.authenticated  = this.authService.isAuthenticated();
          this.provider[name] = true;
        });
    }
}
```

### Quick authService api overview

```js
authService
  // the instance of aurelia-api use for requests. '.client.client' is the used httpClient instance
  .client
  // signup into server with credentials and optionally logs in
  .signup(credentials: Object)): Promise<Response>
   // log into server with credentials. Stores token if successful
  .login(credentials: Object): Promise<Response>
  // deletes stored tokens
  .logout([redirectUri: string]): Promise<>
  // manually refresh token. Needs refreshToken options to be configured
  .updateToken(): Promise<Response> {
  // link thrird-party accounts or use it to log into server. Stores token if successful
  .authenticate(provider: string[, redirectUri: string][, userData: Object]): Promise<Response>
  // unlink third-party
  .unlink(provider: string): Promise<Response>
  // get profile
  .getMe([criteria: Object|string|number]): Promise<Response>
  // update profile
  .updateMe(data: Object[,criteria: Object|string|number]): Promise<Response>
  // check if token is available and, if applicable, not expired
  .isAuthenticated(): boolean
  // get token if available
  .getTokenPayload(): string
  // get the tokena ttl if available
  .getTtl(): Number
```

Additionnally, you can use `AuthFilterValueConverter` and `AuthorizeStep` for UI feedback.

More information you can find in [aurelia-authentication-docs](http://aurelia-authentication.spoonx.org/).
