require("./index.css");
import browser from "webextension-polyfill";
import { Options, SearchModes, SortModes, Themes } from "../OptionsInterface";

const shortcut = document.querySelector("#shortcut") as HTMLInputElement;
const searchMode = document.querySelector("#searchMode") as HTMLSelectElement;
const caseSensitivity = document.querySelector("#caseSensitivity") as HTMLSelectElement;
const showDead = document.querySelector("#showDead") as HTMLSelectElement;
const maxDead = document.querySelector("#maxDead") as HTMLInputElement;
const theme = document.querySelector("#theme") as HTMLSelectElement;
const autofocusSearch = document.querySelector("#autofocusSearch") as HTMLSelectElement;
const sortMode = document.querySelector("#sortMode") as HTMLSelectElement;

/** Loads from storage onto page */
async function load() {
    const res = new Options(await browser.storage.local.get());
    shortcut.value = res.shortcut;
    searchMode.value = res.searchMode;
    caseSensitivity.value = res.caseSensitivity.toString();
    theme.value = res.theme;
    showDead.value = res.showDead.toString();
    maxDead.value = res.maxDead.toString();
    autofocusSearch.value = res.autofocusSearch.toString();
    sortMode.value = res.sortMode;
}

/** Saves from form on page to storage */
function save() {
    const opt = new Options( {
        shortcut: shortcut.value,
        searchMode: searchMode.value as SearchModes,
        caseSensitivity: caseSensitivity.value === "true",
        theme: theme.value as Themes,
        showDead: showDead.value === "true",
        maxDead: Number(maxDead.value),
        autofocusSearch: autofocusSearch.value === "true",
        sortMode: sortMode.value as SortModes
    });

    browser.storage.local.set(opt);
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: shortcut.value
    });
}

document.addEventListener("input", save);
document.addEventListener("DOMContentLoaded", load);
