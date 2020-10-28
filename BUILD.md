# Building Quick Tab Switcher 1.0.1

System details:
 * Ubuntu 20.10
 * bash 5.0.17
 * node v12.19.0
 * npm 6.14.8
 * For tool and library versions, check package.json

# Building Complete Extension

The source code is in `./src`. It is written in TypeScript and compiled and bundled using Parcel. "webextension-polyfill-ts" is included from the npm package.

Run
```shell
npm install
npm run build:complete
```
The built extension will be in `./dist` and the zipped version in `./web-ext-artifacts/quick_tab_switcher-1.0.1.zip`

# Building Help Page

Run
```shell
npm run build:help
```
This uses Libreoffice to convert `help.fodt` to `./src/help.pdf`.

# Live Testing Version

Run
```shell
npm run watch:extension
npm run firefox
```
This will re-build and reload the extension when the files change
