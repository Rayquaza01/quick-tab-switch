import { browser } from "webextension-polyfill-ts";

const shortcut: HTMLInputElement = document.querySelector("#shortcut");
const searchMode: HTMLSelectElement = document.querySelector("#searchMode");
const caseSensitivity: HTMLSelectElement = document.querySelector("#caseSensitivity");
const showDead: HTMLSelectElement = document.querySelector("#showDead");
const maxDead: HTMLInputElement = document.querySelector("#maxDead");
const theme: HTMLSelectElement = document.querySelector("#theme");

/** Loads from storage onto page */
async function load() {
    let res = await browser.storage.local.get();
    shortcut.value = res.shortcut;
    searchMode.value = res.searchMode;
    caseSensitivity.value = res.caseSensitivity;
    theme.value = res.theme;
    showDead.value = JSON.stringify(res.showDead);
    maxDead.value = res.maxDead;
}

/** Saves from form on page to storage */
function save() {
    browser.storage.local.set({
        shortcut: shortcut.value,
        searchMode: searchMode.value,
        caseSensitivity: JSON.parse(caseSensitivity.value),
        theme: theme.value,
        showDead: JSON.parse(showDead.value),
        maxDead: Number(maxDead.value)
    });
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: shortcut.value
    });
}

document.addEventListener("input", save);
document.addEventListener("DOMContentLoaded", load);
