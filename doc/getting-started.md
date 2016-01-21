# Getting started


## Installation
Aurelia-auth uses [aurelia-api](https://github.com/SpoonX/aurelia-api).
We recommend that you read the [getting-started document](https://github.com/SpoonX/aurelia-api/blob/master/doc/getting-started.md) for aurelia-api first, as we'll be using it in this document.

To get started, simply run:

`jspm i github:spoonx/aurelia-api github:spoonx/aurelia-auth`

### configuration

#### Example auth-config.js
```js
export default {

}
```

#### Example main.js
```js
import config from './config/auth-config';

export function configure(aurelia) {
  aurelia.use
    .plugin('spoonx/aurelia-auth', config);
  aurelia.start().then(a => a.setRoot());
}
```
