import { browser, Runtime } from "webextension-polyfill-ts";
import { OptionsInterface, DefaultOptions } from "./OptionsInterface";

function defaultValues(object: any, settings: OptionsInterface): OptionsInterface {
    for (let key of Object.keys(settings)) {
        if (!Object.prototype.hasOwnProperty.call(object, key)) {
            object[key] = settings[key];
        }
    }

    return object;
}

async function startup() {
    let res = await browser.storage.local.get();
    res = defaultValues(res, DefaultOptions);
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: res.hasOwnProperty("shortcut") ? res.shortcut : "Ctrl+Shift+B"
    });
}

async function main(details: Runtime.OnInstalledDetailsType) {
    if (details.reason === "install" || details.reason === "update") {
        let res = await browser.storage.local.get();
        res = defaultValues(res, DefaultOptions);

        // update casesensitivity option to be bool
        if (typeof res.caseSensitivity === "string") {
            if (res.caseSensitivity === "nocase") {
                res.caseSensitivity = false;
            } else {
                res.caseSensitivity = true;
            }
        }

        await browser.storage.local.set(res);
        startup();
    }
}

browser.runtime.onInstalled.addListener(main);
browser.runtime.onStartup.addListener(startup);
