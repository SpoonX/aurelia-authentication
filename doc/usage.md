# Usage

## Add a configuration file

Set your custom configuration. You can find all options and the default values in the [baseConfig](baseConfig.md).

```js
/* authConfig.js */
export default {
    endpoint: 'auth',              // use 'auth' endpoint for the auth server
    configureEndpoints: ['auth'],  // add Authorization header to 'auth' endpoint
    storageChangedReload: true,    // ensure secondary tab reloading after auth status changes
    facebook: {
        clientId: 'your client id' // set your third-party providers client ids
    }
```

## Configure the plugin

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
  .plugin('aurelia-authentication', config => {
      config.configure(authConfig);
  });
```

## Use AuthService in a view-model

```js
import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';

@inject(AuthService)
export class Login {
    constructor(authService) {
        this.authService   = authService;
        this.providers     = [];
    };

    // make a getter to get the authentication status.
    // use computedFrom to avoid dirty checking
    @computedFrom('authService.authenticated')
    get authenticated() {
      return this.authService.authenticated;
    }

    // use authService.login(credentialsObject) to login to your auth server
    login(username, password) {
      return this.authService.login({username, password});
    };

    // use authService.logout to delete stored tokens
    // if you are using JWTs, authService.logout() will be called automatically,
    // when the token expires. The expiredRedirect setting in your authConfig
    // will determine the redirection option
    logout() {
      return this.authService.logout();
    }

    // use authenticate(providerName) to get third-party authentication
    authenticate(name) {
      return this.authService.authenticate(name)
        .then(response => {
          this.provider[name] = true;
        });
    }
}
```
