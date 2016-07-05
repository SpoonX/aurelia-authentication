# Installation

## Aureli-Cli

Run `npm i aurelia-authentication --save` from your project root.

Add `aurelia-authentication` to the `build/bundles/dependencies` section of `aurelia-project/aurelia.json`.

Aurelia-authentication has submodules (currently only the authFilter). You need to add it to the aurelia build resources in your package.json.

```js
"aurelia": {
  "build": {
    "resources": ["aurelia-authentication/authFilterValueConverter"]
  }
},
```

## Jspm

Run `jspm i aurelia-authentication`

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

Aurelia-authentication has submodules (currently only the authFilter). You need to add it to the aurelia build resources in your package.json.

```js
"aurelia": {
  "build": {
    "resources": ["aurelia-authentication/authFilterValueConverter"]
  }
},
```

## Typescript

Add to your `typings.json`

```js
"aurelia-authentication": "github:spoonx/aurelia-authentication",
```

and run `typings i`

or run

```sh
typings i github:spoonx/aurelia-authentication
```
