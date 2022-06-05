require("./index.css");
import { browser } from "webextension-polyfill-ts";
import { Options, SearchModes, Themes } from "../OptionsInterface";

const shortcut = document.querySelector("#shortcut") as HTMLInputElement;
const searchMode = document.querySelector("#searchMode") as HTMLSelectElement;
const caseSensitivity = document.querySelector("#caseSensitivity") as HTMLSelectElement;
const showDead = document.querySelector("#showDead") as HTMLSelectElement;
const maxDead = document.querySelector("#maxDead") as HTMLInputElement;
const theme = document.querySelector("#theme") as HTMLSelectElement;

/** Loads from storage onto page */
async function load() {
    const res = new Options(await browser.storage.local.get());
    shortcut.value = res.shortcut;
    searchMode.value = res.searchMode;
    caseSensitivity.value = res.caseSensitivity.toString();
    theme.value = res.theme;
    showDead.value = JSON.stringify(res.showDead);
    maxDead.value = res.maxDead.toString();
}

/** Saves from form on page to storage */
function save() {
    const opt = new Options( {
        shortcut: shortcut.value,
        searchMode: searchMode.value as SearchModes,
        caseSensitivity: JSON.parse(caseSensitivity.value),
        theme: theme.value as Themes,
        showDead: JSON.parse(showDead.value),
        maxDead: Number(maxDead.value)
    });

    browser.storage.local.set(opt);
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: shortcut.value
    });
}

document.addEventListener("input", save);
document.addEventListener("DOMContentLoaded", load);
