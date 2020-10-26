const shortcut = document.querySelector("#shortcut");
const searchMode = document.querySelector("#searchMode");
const caseSensitivity = document.querySelector("#caseSensitivity");
const showDead = document.querySelector("#showDead");
const maxDead = document.querySelector("#maxDead");
const theme = document.querySelector("#theme");

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
