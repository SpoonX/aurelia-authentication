# Refresh tokens

A refresh_token is just another jwt with a longer ttl than the access_token. The refresh tokens is then used to request a new access_token, either automatically whenever the access_token expires, or manually by calling `authService.updateToken()` .

For example, you could set the ttl of the access_token to 1 day and the ttl of the refresh_token to 30 days. As a result, a user stays logged in for 30 days after his last activity.

## Configuration

### Client

Following are the configuration options for the refresh token. Most importantly, you want to set `useRefreshToken: true` in your `authConfig.js`. With default settings, the value of the `refresh_token` property in the login response body will then be used as refresh token later.

```js
// Refresh Token Options
// =====================

// The API endpoint to which refreshToken requests are sent. null = loginUrl
refreshTokenUrl = null;

// Option to turn refresh tokens On/Off
useRefreshToken: false,
// The option to enable/disable the automatic refresh of Auth tokens using Refresh Tokens
autoUpdateToken: true,
// Oauth Client Id
clientId: false,
// The the property from which to get the refresh token after a successful token refresh
refreshTokenProp: 'refresh_token',
// The proprety name used to send the existing token when refreshing `{ "refreshTokenSubmitProp": '...' }`
refreshTokenSubmitProp = 'refresh_token';

// If the property defined by `refreshTokenProp` is an object:
// -----------------------------------------------------------

// This is the property from which to get the token `{ "refreshTokenProp": { "refreshTokenName" : '...' } }`
refreshTokenName: 'token',
// This allows the refresh token to be a further object deeper `{ "refreshTokenProp": { "refreshTokenRoot" : { "refreshTokenName" : '...' } } }`
refreshTokenRoot: false,

```

### Server

Upon login your server needs to send a second jwt with a longer ttl which will be used as refresh_token. So, the body of your server response might look like this:

```js
{
  userId: 6143772,
  access_token: 'this_is_the.access_token.jwt',
  refresh_token: 'this_is_the.refresh_token.jwt'
}
```

On calling `authService.updateToken()` or after expiration of the access_token if `autoUpdateToken` is set true (default), a post request is send to your config's `loginUrl` with the (probably now expired) access_token in the header and following body:

```js
{
  grant_type: 'refresh_token',
  refresh_token: 'this_is_the.refresh_token.jwt'
  // client_id: 'the_client_id'  // if selected in your config
}
```

If all goes well, the server sends back the same response as after regular login with all new tokens.

#### Sample middleware for express

Here's a sample `refreshToken` middleware for express. Following would need to be executed after the json body parser.

```js
// refreshToken.js

var jwt = require('jsonwebtoken');

module.exports = function(options) {
  return function refreshToken(req, res, next) {
    // we only do something if grant_type is 'refresh_token'
    if (req.body.grant_type !== 'refresh_token') return next();

    // verify refresh_token
    jwt.verify(req.body.refresh_token, "client_secret", function(err) {
      if (err) return next(err)

      // we use the old access_token as well. should be in the header
      var access_token = req.header('authorization');
      if (!access_token) return next();

      // remove Bearer if needed
      access_token = access_token.replace('Bearer ','');

      // decode access_token to get the user data
      // since it might be expired we use ignoreExpiration: true
      jwt.verify(access_token, "client_secret", {
        ignoreExpiration: true,
      }, function(err, token) {
        if (err) return next(err);

        // remove old claims or jsonwebtoken complains or will wrongly re-use some claims
        token.exp = undefined;
        token.iat = undefined;
        token.nbf = undefined;
        token.aud = undefined;
        token.sub = undefined;

        // send back new tokens
        res.json({
          access_token: jwt.sign(token, 'client_secret', {expiresIn: '1d'}),
          refresh_token: jwt.sign(token, 'client_secret', {expiresIn: '10d'})
        });
      });
    });
  };
}
```
