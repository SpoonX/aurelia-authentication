declare module 'aurelia-authentication' {
  export class Popup {
    constructor();
    open(url?: any, windowName?: any, options?: any, redirectUri?: any): any;
    eventListener(redirectUri?: any): any;
    pollPopup(): any;
  }
  export class AuthFilterValueConverter {
    toView(routes?: any, isAuthenticated?: any): any;
  }
  export class BaseConfig {
    
    // prepends baseUrl
    withBase(url?: any): any;
    
    // merge current settings with incomming settings
    configure(incomming?: any): any;
    
    /* ----------- default  config ----------- */
    // Used internally. The used Rest instance; set during configuration (see index.js)
    client: any;
    
    // If using aurelia-api:
    // =====================
    // This is the name of the endpoint used for any requests made in relation to authentication (login, logout, etc.). An empty string selects the default endpoint of aurelia-api.
    endpoint: any;
    
    // When authenticated, these endpoints will have the token added to the header of any requests (for authorization). Accepts an array of endpoint names. An empty string selects the default endpoint of aurelia-api.
    configureEndpoints: any;
    
    // SPA related options
    // ===================
    // The SPA url to which the user is redirected after a successful login
    loginRedirect: any;
    
    // The SPA url to which the user is redirected after a successful logout
    logoutRedirect: any;
    
    // The SPA route used when an unauthenticated user tries to access an SPA page that requires authentication
    loginRoute: any;
    
    // Whether or not an authentication token is provided in the response to a successful signup
    loginOnSignup: any;
    
    // If loginOnSignup == false: The SPA url to which the user is redirected after a successful signup (else loginRedirect is used)
    signupRedirect: any;
    
    // API related options
    // ===================
    // The base url used for all authentication related requests, including provider.url below.
    // This appends to the httpClient/endpoint base url, it does not override it.
    baseUrl: any;
    
    // The API endpoint to which login requests are sent
    loginUrl: any;
    
    // The API endpoint to which signup requests are sent
    signupUrl: any;
    
    // The API endpoint used in profile requests (inc. `find/get` and `update`)
    profileUrl: any;
    
    // The API endpoint used with oAuth to unlink authentication
    unlinkUrl: any;
    
    // The HTTP method used for 'unlink' requests (Options: 'get' or 'post')
    unlinkMethod: any;
    
    // Token Options
    // =============
    // The header property used to contain the authToken in the header of API requests that require authentication
    authHeader: any;
    
    // The token name used in the header of API requests that require authentication
    authTokenType: any;
    
    // The the property from which to get the access token after a successful login or signup
    accessTokenProp: any;
    
    // If the property defined by `accessTokenProp` is an object:
    // ------------------------------------------------------------
    //This is the property from which to get the token `{ "accessTokenProp": { "accessTokenName" : '...' } }`
    accessTokenName: any;
    
    // This allows the token to be a further object deeper `{ "accessTokenProp": { "accessTokenRoot" : { "accessTokenName" : '...' } } }`
    accessTokenRoot: any;
    
    // Refresh Token Options
    // =====================
    // Option to turn refresh tokens On/Off
    useRefreshToken: any;
    
    // The option to enable/disable the automatic refresh of Auth tokens using Refresh Tokens
    autoUpdateToken: any;
    
    // Oauth Client Id
    clientId: any;
    
    // The the property from which to get the refresh token after a successful token refresh
    refreshTokenProp: any;
    
    // If the property defined by `refreshTokenProp` is an object:
    // -----------------------------------------------------------
    // This is the property from which to get the token `{ "refreshTokenProp": { "refreshTokenName" : '...' } }`
    refreshTokenName: any;
    
    // This allows the refresh token to be a further object deeper `{ "refreshTokenProp": { "refreshTokenRoot" : { "refreshTokenName" : '...' } } }`
    refreshTokenRoot: any;
    
    // Miscellaneous Options
    // =====================
    // Whether to enable the fetch interceptor which automatically adds the authentication headers
    // (or not... e.g. if using a session based API or you want to override the default behaviour)
    httpInterceptor: any;
    
    // For OAuth only: Tell the API whether or not to include token cookies in the response (for session based APIs)
    withCredentials: any;
    
    // Controls how the popup is shown for different devices (Options: 'browser' or 'mobile')
    platform: any;
    
    // Determines the `window` property name upon which aurelia-authentication data is stored (Default: `window.localStorage`)
    storage: any;
    
    // The key used for storing the authentication response locally
    storageKey: any;
    
    //OAuth provider specific related configuration
    // ============================================
    providers: any;
    
    /* deprecated defaults */
    _authToken: any;
    _responseTokenProp: any;
    _tokenName: any;
    _tokenRoot: any;
    _tokenPrefix: any;
    
    /* deprecated methods and parameteres */
    current: any;
    authToken: any;
    responseTokenProp: any;
    tokenRoot: any;
    tokenName: any;
    tokenPrefix: any;
  }
  export class Storage {
    constructor(config?: any);
    get(key?: any): any;
    set(key?: any, value?: any): any;
    remove(key?: any): any;
  }
  export class OAuth1 {
    constructor(storage?: any, popup?: any, config?: any);
    open(options?: any, userData?: any): any;
    exchangeForToken(oauthData?: any, userData?: any, provider?: any): any;
  }
  export class OAuth2 {
    constructor(storage?: any, popup?: any, config?: any);
    open(options?: any, userData?: any): any;
    exchangeForToken(oauthData?: any, userData?: any, provider?: any): any;
    buildQuery(provider?: any): any;
  }
  export class Authentication {
    constructor(storage?: any, config?: any, oAuth1?: any, oAuth2?: any);
    
    /* deprecated methods */
    getLoginRoute(): any;
    getLoginRedirect(): any;
    getLoginUrl(): any;
    getSignupUrl(): any;
    getProfileUrl(): any;
    getToken(): any;
    
    /* getters/setters for responseObject */
    responseObject: any;
    
    /* get data, update if needed first */
    getAccessToken(): any;
    getRefreshToken(): any;
    getPayload(): any;
    getExp(): any;
    
    /* get status from data */
    getTtl(): any;
    isTokenExpired(): any;
    isAuthenticated(): any;
    
    /* get and set from response */
    getDataFromResponse(response?: any): any;
    deleteData(): any;
    getTokenFromResponse(response?: any, tokenProp?: any, tokenName?: any, tokenRoot?: any): any;
    toUpdateTokenCallstack(): any;
    resolveUpdateTokenCallstack(response?: any): any;
    
    /**
       * Authenticate with third-party
       *
       * @param {String}    name of the provider
       * @param {[{}]}      [userData]
       *
       * @return {Promise<response>}
       */
    authenticate(name?: any, userData?: any): any;
    redirect(redirectUrl?: any, defaultRedirectUrl?: any): any;
  }
  export class AuthorizeStep {
    constructor(authentication?: any);
    run(routingContext?: any, next?: any): any;
  }
  export class AuthService {
    constructor(authentication?: any, config?: any);
    
    /**
       * Getter: The configured client for all aurelia-authentication requests
       *
       * @return {HttpClient}
       */
    client: any;
    auth: any;
    
    /**
       * Get current user profile from server
       *
       * @param {[{}|number|string]}  [criteria object or a Number|String converted to {id:criteria}]
       *
       * @return {Promise<response>}
       */
    getMe(criteria?: any): any;
    
    /**
       * Send current user profile update to server
       *
       * @param {any}                 request body with data.
       * @param {[{}|Number|String]}  [criteria object or a Number|String converted to {id:criteria}]
       *
       * @return {Promise<response>}
       */
    updateMe(body?: any, criteria?: any): any;
    
    /**
       * Get accessToken from storage
       *
       * @returns {String} current accessToken
       */
    getAccessToken(): any;
    getCurrentToken(): any;
    
    /**
       * Get refreshToken from storage
       *
       * @returns {String} current refreshToken
       */
    getRefreshToken(): any;
    
    /**
      * Gets authentication status
      *
      * @returns {Boolean} true: for Non-JWT and unexpired JWT, false: else
      */
    isAuthenticated(): any;
    
    /**
       * Gets ttl in seconds
       *
       * @returns {Number} ttl for JWT tokens, NaN for all other tokens
       */
    getTtl(): any;
    
    /**
      * Gets exp from token payload and compares to current time
      *
      * @returns {Boolean} returns (ttl > 0)? for JWT, undefined other tokens
      */
    isTokenExpired(): any;
    
    /**
      * Get payload from tokens
      *
      * @returns {null | String} null: Non-JWT payload, String: JWT token payload
      */
    getTokenPayload(): any;
    
    /**
       * Request new accesss token
       *
       * @returns {Promise<Response>} requests new token. can be called multiple times
       */
    updateToken(): any;
    
    /**
       * Signup locally
       *
       * @param {String|{}}   displayName | object with signup data.
       * @param {[String]|{}} [email | options for post request]
       * @param {[String]}    [password | redirectUri overwrite]
       * @param {[{}]}        [options]
       * @param {[String]}    [redirectUri overwrite]
       *
       * @return {Promise<response>}
       */
    signup(displayName?: any, email?: any, password?: any, options?: any, redirectUri?: any): any;
    
    /**
       * login locally. Redirect depending on config
       *
       * @param {[String]|{}} email | object with signup data.
       * @param {[String]}    [password | options for post request]
       * @param {[{}]}        [options | redirectUri overwrite]]
       * @param {[String]}    [redirectUri overwrite]
       *
       * @return {Promise<response>}
       */
    login(email?: any, password?: any, options?: any, redirectUri?: any): any;
    
    /**
       * logout locally and redirect to redirectUri (if set) or redirectUri of config
       *
       * @param {[String]}  [redirectUri]
       *
       * @return {Promise<>}
       */
    logout(redirectUri?: any): any;
    
    /**
       * Authenticate with third-party and redirect to redirectUri (if set) or redirectUri of config
       *
       * @param {String}    name of the provider
       * @param {[String]}  [redirectUri]
       * @param {[{}]}      [userData]
       *
       * @return {Promise<response>}
       */
    authenticate(name?: any, redirectUri?: any, userData?: any): any;
    
    /**
       * Unlink third-party
       *
       * @param {String}  name of the provider
       *
       * @return {Promise<response>}
       */
    unlink(name?: any, redirectUri?: any): any;
  }
  export class FetchConfig {
    
    /**
       * Construct the FetchConfig
       *
       * @param {HttpClient} httpClient
       * @param {Config} clientConfig
       * @param {Authentication} authService
       * @param {BaseConfig} config
       */
    constructor(httpClient?: any, clientConfig?: any, authService?: any, config?: any);
    
    /**
       * Interceptor for HttpClient
       *
       * @return {{request: Function, response: Function}}
       */
    interceptor: any;
    
    /**
       * Configure client(s) with authorization interceptor
       *
       * @param {HttpClient|Rest|string[]} (array of) httpClient, rest client or api endpoint names
       *
       * @return {HttpClient[]}
       */
    configure(client?: any): any;
  }
}