# Installation

## Aureli-Cli

Run `npm i aurelia-authentication --save` from your project root.

Aurelia-authentication has submodules (currently only the authFilter) and makes use of `extends` and `jwt-decode`. So, add following to the `build/bundles/dependencies` section of `aurelia-project/aurelia.json`.

```js
"dependencies": [
  // ...
  'extends',
  {
    "name": "aurelia-authentication",
    "path": "../node_modules/aurelia-authentication/dist/amd",
    "main": "aurelia-authentication"
  },
  {
    "name": "jwt-decode",
    "path": "../node_modules/jwt-decode/lib",
    "main": "index"
  }
  // ...
],
```

## Jspm

Run `jspm i aurelia-authentication`

Add `aurelia-authentication` to the `build/bundles/dependencies` section of `aurelia-project/aurelia.json`.

Aurelia-authentication has submodules (currently only the authFilter). So, if you use it, add `aurelia-authentication/authFilterValueConverter` as well.

If the installation results in having forks, try resolving them by running:

```sh
jspm inspect --forks
jspm resolve --only registry:package-name@version
```

E.g.

```sh
jspm inspect --forks
>     Installed Forks
>         npm:aurelia-dependency-injection 1.0.0-beta.1.2.3 1.0.0-beta.2.1.0

jspm resolve --only npm:aurelia-dependency-injection@1.0.0-beta.2.1.0
```


## Webpack

Run `npm i aurelia-authentication --save` from your project root.

Add `'aurelia-authentication'` in the `coreBundles.aurelia section` of your `webpack.config.js`.

Aurelia-authentication has submodules (currently only the authFilter). They are included in it's package.json, so no further action is required.

## Typescript

If needed, add to your `typings.json`:

```js
"aurelia-authentication": "github:spoonx/aurelia-authentication",
```

and run `typings i`

or run

```sh
typings i github:spoonx/aurelia-authentication
```
