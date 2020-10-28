import { browser, Runtime } from "webextension-polyfill-ts";
import { OptionsInterface, DefaultOptions } from "./OptionsInterface";

/**
 * Initialize object with default values
 * @param object - Object to initilize
 * @param settings - Object with efault values
 */
function defaultValues(object: any, settings: OptionsInterface): OptionsInterface {
    for (let key of Object.keys(settings)) {
        object[key] ??= settings[key];
    }
    return object;
}

/** Runs on startup, updates keyboard shortcut */
async function startup(): Promise<void> {
    let res = await browser.storage.local.get();
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: res.shortcut ?? DefaultOptions.shortcut
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
