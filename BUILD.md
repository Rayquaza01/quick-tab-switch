# Building Quick Tab Switcher 1.1.1

System details:
 * Fedora 38
 * bash 5.2.15
 * node v18.15.0
 * npm 9.4.0
 * For tool and library versions, check package.json

# Building Complete Extension

The source code is in `./src`. It is written in TypeScript and compiled and bundled using webpack. "webextension-polyfill" is included from the npm package.

Run
```shell
npm install
npm run build:production
npm run build:extension
```
The built extension will be in `./dist` and the zipped version in `./web-ext-artifacts/quick_tab_switcher-1.1.1.zip`

# Live Testing Version

Run
```shell
npm run watch:extension
npm run firefox
```
This will re-build and reload the extension when the files change
