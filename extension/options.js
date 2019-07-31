const shortcut = document.getElementById("shortcut");
const searchMode = document.getElementById("searchMode");
const caseSensitivity = document.getElementById("caseSensitivity");
const theme = document.getElementById("theme");

async function load() {
    let res = await browser.storage.local.get();
    shortcut.value = res.shortcut;
    searchMode.value = res.searchMode;
    caseSensitivity.value = res.caseSensitivity;
    theme.value = res.theme;
}

function save() {
    browser.storage.local.set({
        shortcut: shortcut.value,
        searchMode: searchMode.value,
        caseSensitivity: caseSensitivity.value,
        theme: theme.value
    });
    browser.commands.update({
        name: "_execute_browser_action",
        shortcut: shortcut.value
    });
}

document.addEventListener("input", save);
document.addEventListener("DOMContentLoaded", load);
