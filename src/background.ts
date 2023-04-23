import browser, { Runtime } from "webextension-polyfill";
import { Options } from "./OptionsInterface";

/** Runs on startup, updates keyboard shortcut */
async function startup(): Promise<void> {
    const opt = new Options(await browser.storage.local.get());
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: opt.shortcut
    });
}

async function main(details: Runtime.OnInstalledDetailsType) {
    if (details.reason === "install" || details.reason === "update") {
        const res = new Options(await browser.storage.local.get());

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
