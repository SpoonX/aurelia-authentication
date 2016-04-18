<a name"2.1.2"></a>
### 2.1.2 (2016-04-18)


#### Bug Fixes

* **refreshToken:** use set(Refresh)TokenFromResponse to get new token ([fed52f7a](https://github.com/spoonx/aurelia-authentication/commit/fed52f7a))


<a name"2.1.1"></a>
### 2.1.1 (2016-04-04)


#### Bug Fixes

* **d.ts:** include only necessary imports ([2c292ac4](https://github.com/spoonx/aurelia-authentication/commit/2c292ac4))
* **project:** allways use config.current directly instead of a copy made in the constructor ([4cfe33b4](https://github.com/spoonx/aurelia-authentication/commit/4cfe33b4))


<a name"2.1.0"></a>
## 2.1.0 (2016-03-31)


#### Bug Fixes

* **configure:** fail if specified endpoints are not registered ([4a444253](https://github.com/spoonx/aurelia-authentication/commit/4a444253))
* **interceptor:** set authorization header instead of appending ([4e53457d](https://github.com/spoonx/aurelia-authentication/commit/4e53457d))


#### Features

* **project:** add refresh token ([77bdbe49](https://github.com/spoonx/aurelia-authentication/commit/77bdbe49))


<a name"2.0.2"></a>
### 2.0.2 (2016-03-30)


#### Bug Fixes

* **authFilter:** Import authfilter for bundling ([d5461fd6](https://github.com/spoonx/aurelia-authentication/commit/d5461fd6))


<a name"2.0.1"></a>
### 2.0.1 (2016-03-29)


<a name"2.0.0"></a>
## 2.0.0 (2016-03-29)


<a name"1.1.2"></a>
### 1.1.2 (2016-03-26)
#### Bug Fixes

* **project:** fix wrong dependency introduced in 1.1.1 ([1b288214](https://github.com/spoonx/aurelia-authentication/commit/1b288214))


<a name"1.1.1"></a>
### 1.1.1 (2016-03-25)


<a name"1.1.0"></a>
### 1.1.0 (2016-03-25)


#### Features

* **authUtils:** make authUtils a named export, export  authUtils from index -- breaking change!  ([7de0aa23](https://github.com/spoonx/aurelia-authentication/commit/7de0aa23))


<a name"1.0.1"></a>
### 1.0.1 (2016-03-22)


#### Bug Fixes

* **FetchConfig:** keep client settings when adding interceptor ([18c052c1](git+https://github.com/spoonx/aurelia-authentication.git/commit/18c052c1))


<a name"1.0.0"></a>
## 1.0.0 (2016-03-19)


#### Breaking Changes

* The project now must be imported with aurelia-authentication

 ([ba66705d](git+https://github.com/spoonx/aurelia-authentication.git/commit/ba66705d))


<a name"0.13.9"></a>
### 0.13.9 (2016-03-17)


#### Bug Fixes

* **authorizeStep:** fix redirect if isLoggedIn and on login route ([65986f7c](git+https://github.com/spoonx/aurelia-authentication.git/commit/65986f7c))
* **baseConfig:** SPA redirects should be hashed ([a24ce935](git+https://github.com/spoonx/aurelia-authentication.git/commit/a24ce935))
* **project:** import authFilter for inclusion when bundling ([d70a5c6f](git+https://github.com/spoonx/aurelia-authentication.git/commit/d70a5c6f), closes [#44](git+https://github.com/spoonx/aurelia-authentication.git/issues/44))


<a name"0.13.8"></a>
### 0.13.8 (2016-03-02)


<a name"0.13.7"></a>
### 0.13.7 (2016-02-09)


<a name"0.13.6"></a>
### 0.13.6 (2016-02-08)


#### Bug Fixes

* **oauth:** use current provider settings ([9c860c23](git+https://github.com/spoonx/aurelia-authentication.git/commit/9c860c23))


<a name"0.13.4"></a>
### 0.13.4 (2016-01-28)


#### Bug Fixes

* **oAuth:** reset defaults properly ([968abfcf](git+https://github.com/spoonx/aurelia-authentication.git/commit/968abfcf))


<a name"0.13.3"></a>
### 0.13.3 (2016-01-24)


#### Features

* **typescript:** Add proper build support ([9ebfd763](git+https://github.com/spoonx/aurelia-authentication.git/commit/9ebfd763))
* **authentication:** use current tokenName ([bd58f00b](git+https://github.com/spoonx/aurelia-authentication.git/commit/bd58f00b))


<a name"0.13.2"></a>
### 0.13.2 (2016-01-23)


#### Bug Fixes

* **index:** fetchConfig needs configured baseConfig ([e62c9eb9](git+https://github.com/spoonx/aurelia-authentication.git/commit/e62c9eb9))


<a name"0.13.1"></a>
### 0.13.1 (2016-01-21)


#### Bug Fixes

* **popup:** Referrence popupWindow on this; popupWindow is undefined. ([212117e9](git+https://github.com/spoonx/aurelia-authentication.git/commit/212117e9))


<a name"0.13.0"></a>
## 0.13.0 (2016-01-19)


#### Bug Fixes

* **test:** Added tests ([846d1bf9](git+https://github.com/spoonx/aurelia-authentication.git/commit/846d1bf9))
* **typescript:** Update d.ts ([edbd7304](git+https://github.com/spoonx/aurelia-authentication.git/commit/edbd7304))


#### Features

* **build:**
  * Create typescript definitions file on build ([09f63b1b](git+https://github.com/spoonx/aurelia-authentication.git/commit/09f63b1b))
  * Added typescript ds file generating ([e5d4726a](git+https://github.com/spoonx/aurelia-authentication.git/commit/e5d4726a))
* **fetch-config:** Added endpoint configuring, and configurable client. ([c1e30f61](git+https://github.com/spoonx/aurelia-authentication.git/commit/c1e30f61))
* **project:** Added typescript definition file ([28804352](git+https://github.com/spoonx/aurelia-authentication.git/commit/28804352))
* **snyk:** Added snyk ([562ba14e](git+https://github.com/spoonx/aurelia-authentication.git/commit/562ba14e))


### 0.12.4 (2016-01-14)


#### Bug Fixes

* **typescript:** Update d.ts ([edbd7304](git+https://github.com/spoonx/aurelia-authentication.git/commit/edbd7304))


### 0.12.3 (2016-01-14)


#### Features

* **project:** Added typescript definition file ([28804352](git+https://github.com/spoonx/aurelia-authentication.git/commit/28804352ebff34b617d0afb2600ad94887f99810))


### 0.12.2 (2016-01-14)


#### Bug Fixes

* **authentication:** Catch corrupt json ([b971cfc1](git+https://github.com/spoonx/aurelia-authentication.git/commit/b971cfc184fd01c6f7da42d09aa446c41373ff7e))


#### Features

* **authService:** getMe with optional criteria ([99b8ed62](git+https://github.com/spoonx/aurelia-authentication.git/commit/99b8ed620317202d29d5f804e237b2b8b8ebe82b))


### 0.12.1 (2016-01-13)


#### Features

* **authService:** getMe with optional criteria ([99b8ed62](git+https://github.com/spoonx/aurelia-authentication.git/commit/99b8ed620317202d29d5f804e237b2b8b8ebe82b))


### 0.12.0 (2016-01-02)


#### Bug Fixes

* **project:** Version bump to higher than all previous ones ([c4ceae9b](git+https://github.com/spoonx/aurelia-authentication.git/commit/c4ceae9b18422dd7ca2adc3e26dc88a4f8cefb8c))


### 0.1.2 (2015-12-29)


#### Refactor

* **authentication:** Made response token configurable ([8281d906](git+https://github.com/spoonx/aurelia-authentication.git/commit/d166129d8501d66bca66c1a69e55a40281fa8c00))

### 0.1.1 (2015-12-24)


#### Features

* **fetch-client:** Recover baseUrl from singleton ([8281d906](git+https://github.com/spoonx/aurelia-authentication.git/commit/8281d9062e7a695402992f0db068c020efbeb3e1))
* **lint:** Added linting ([5cf127b2](git+https://github.com/spoonx/aurelia-authentication.git/commit/5cf127b20b673c63d3b78d8b5c00e69b296312bf))
