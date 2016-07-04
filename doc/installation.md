# Installation

## Aureli-Cli

Run `npm i aurelia-authentication` from your project root and add `aurelia-authentication` to the `build/bundles/dependencies` section of `aurelia-project/aurelia.json`.

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

Run `npm i aurelia-authentication` from your project root.

Aurelia-authentication has submodules (currently only the authFilter). So you need to add it to the AureliaWebpackPlugin includeSubModules list.

```js
AureliaWebpackPlugin({
    includeSubModules: [
      { moduleId: 'aurelia-authentication' }
    ]
  }),
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
