const shortcut = document.getElementById("shortcut");
const searchMode = document.getElementById("searchMode");
const caseSensitivity = document.getElementById("caseSensitivity");
const theme = document.getElementById("theme");
const showDead = document.getElementById("showDead");
const maxDead = document.getElementById("maxDead");

async function load() {
    let res = await browser.storage.local.get();
    shortcut.value = res.shortcut;
    searchMode.value = res.searchMode;
    caseSensitivity.value = res.caseSensitivity;
    theme.value = res.theme;
    showDead.value = JSON.stringify(res.showDead);
    maxDead.value = res.maxDead;
}

function save() {
    browser.storage.local.set({
        shortcut: shortcut.value,
        searchMode: searchMode.value,
        caseSensitivity: caseSensitivity.value,
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
