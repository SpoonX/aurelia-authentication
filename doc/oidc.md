# OpenID Connect (OIDC) Providers

Much like use of the [Auth0 provider](auth0.md), when the aurelia-authentication 
plugin is configured to use an [OpenID Connect](http://openid.net/connect/) provider such as 
[IdentityServer](https://github.com/IdentityServer/IdentityServer4) 
or [OpenIddict](https://github.com/openiddict/openiddict-core), that provider should probably be 
the only authentication provider configured in your application. Authenticating using social
providers such as Facebook, Google, etc and even local user and password authentication 
is handled completely by the OpenID Connect **(OIDC)** provider. As an OIDC provider is 
by definition a simple identity wrapper over the OAuth2 protocol, to integrate an
OIDC provider with aurelia-authentication involves defining a generic OAuth2 provider with
a few additional configuration properties. These properties are discussed below.

## Configuring an OIDC Provider

The following configuration properties should be defined for a OIDC provider. For more information, 
refer to the response given to this [stackoverflow question](http://stackoverflow.com/questions/34809639/openiddict-how-do-you-obtain-the-access-token-for-a-user)

* name : name the aurelia client should use to reference the provider configuration options
* oauthType : must be set to '2.0' to connect to an OIDC provider
* clientId: name of the public client application as defined with the OIDC provider
* authorizationEndpoint: the URL for the OIDC provider authorization endpoint
* redirectUri: the URL defined with the OIDC provider and clientId that will be redirected to upon successful login
* logoutEndpoint: the URL for the OIDC provider logout endpoint
* postLogoutRedirectUri: similar to the redirectUri on successful login, the URL for the OIDC provider and clientId that will be redirected to upon successful logout
* responseType: for an OIDC provider using the implicit flow, should always be set to 'id_token token'
* scope: in order for the client application to return the display name of the user when calling the profileUrl endpoint, must be set to ['openid email profile']
* requiredUrlParams: an array of parameters that are required when submitting a request to the authorizationEndpoint. For an OIDC provider, this value should be defined as ['scope', 'nonce', 'resource']
* state: function returning a random string that is used to maing state between the request and the callback
* nonce: function returning a random string that is used to associate a client session with an ID token and to mitigate replay attacks
* popupOptions: defines the dimensions of the popup window displayed when the authenticate and logout methods are called
* resource: defines the audiences that are returned in the access_token. These values need to match the defined [ValidAudience property](http://andrewlock.net/a-look-behind-the-jwt-bearer-authentication-middleware-in-asp-net-core/) of the JWT Bearer Authentication Middleware for the protected resource server.

## Example OIDC Provider Configuration
```json
export default {|
    endpoint: 'auth',
    configureEndpoints: ['auth', 'resources'],
    profileUrl: '/userinfo',
    loginRedirect: false,
    providers: {
        openiddict: {
            name: 'openiddict',
            oauthType: '2.0',
            clientId: 'aurelia-openiddict',
            redirectUri: 'http://localhost:49862/',
            authorizationEndpoint: 'http://localhost:54540/connect/authorize',
            logoutEndpoint: 'http://localhost:54540/connect/logout',
            postLogoutRedirectUri: 'http://localhost:49862/',
            responseType: 'token id_token',
            scope: ['openid email profile'],
            requiredUrlParams: ['scope', 'nonce', 'resource'],
            state: function () {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 32; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            },
            nonce: function () {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 32; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            },
            popupOptions: { width: 1028, height: 529 },
            resource: 'aurelia-openiddict-resources aurelia-openiddict-server'
        }
    }
};
```

## Integrating a Client with an OIDC Provider

Once properly configured, integration of an Aurelia application with an OpenId Connect provider
using aurelia-authentication couldn't be any simpler. All that is needed to login and logout to
an OIDC provider is to call the AuthService authenticate() and logout() methods. For example, 
the following code completes integration of an OIDC provider configured with the above sample 
script with an Aurelia application.
```
    authenticate() {
        return this.auth.authenticate('openiddict', '/#')
            .then((response) => {
                this.logger.info("login successful");
                this.updateDisplayName();
            });
    }

    logout() {
        return this.auth.logout('/#', undefined, 'openiddict')
            .then(response => {
                this.displayName = '';
            });
    }

```


