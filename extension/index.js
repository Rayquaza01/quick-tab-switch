const tabs_ele = document.getElementById("tabs");

function createTabs(info) {
    let tab = document.createElement("div");

    tab.innerText = info.title;
    tab.classList.add("tab");
    if (info.active) {
        tab.classList.add("active");
    }
    tab.dataset.id = info.id;

    tabs_ele.appendChild(tab);
}

function switchTab(e) {
    let tabs = Array.from(document.getElementsByClassName("tab"));
    let active = document.getElementsByClassName("active")[0];
    let newActive;
    if (e.key === "j" || e.key === "ArrowDown") {
        active.classList.remove("active");
        if (tabs.indexOf(active) === tabs.length - 1) {
            newActive = tabs[0];
        } else {
            newActive = active.nextSibling;
        }
        newActive.classList.add("active");
    }
    if (e.key === "k" || e.key === "ArrowUp") {
        active.classList.remove("active");
        if (tabs.indexOf(active) === 0) {
            newActive = tabs[tabs.length - 1];
        } else {
            newActive = active.previousSibling;
        }
        newActive.classList.add("active");
    }
    if (e.key === "Enter") {
        let active = document.getElementsByClassName("active")[0];
        browser.tabs.update(Number(active.dataset.id), { active: true });
        window.close();
    }
}

async function main() {
    let tabs = await browser.tabs.query({ currentWindow: true });
    tabs.forEach(createTabs);
}

document.addEventListener("keydown", switchTab);
document.addEventListener("DOMContentLoaded", main);
