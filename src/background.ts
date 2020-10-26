import { browser } from "webextension-polyfill-ts";

function defaultValues(object, settings) {
    for (let key in settings) {
        if (!object.hasOwnProperty(key)) {
            object[key] = settings[key];
        }
    }
    return object;
}

async function startup() {
    let res = await browser.storage.local.get();
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: res.hasOwnProperty("shortcut") ? res.shortcut : "Ctrl+Shift+B"
    });
}

async function main(details) {
    if (details.reason === "install" || details.reason === "update") {
        let storage = await (await fetch("options.json")).json();
        let res = await browser.storage.local.get();
        res = defaultValues(res, storage);
        await browser.storage.local.set(res);
        startup();
    }
}

browser.runtime.onInstalled.addListener(main);
browser.runtime.onStartup.addListener(startup);
