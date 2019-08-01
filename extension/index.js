const tabs_ele = document.getElementById("tabs");
const search = document.getElementById("search");

function getOnScreen() {
    // https://stackoverflow.com/a/10445639
    let tabs = Array.from(document.getElementsByClassName("tab"));
    let active = document.getElementsByClassName("active")[0];
    if (tabs.indexOf(active) < 10) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    } else {
        let rect = active.getBoundingClientRect();
        window.scrollTo({
            top: rect.top + window.pageYOffset - document.documentElement.clientTop,
            left: 0,
            behavior: "smooth"
        });
    }
}

function createTabs(info) {
    let tab = document.createElement("div");
    tab.classList.add("tab");
    if (info.active) {
        tab.classList.add("active");
    }
    tab.dataset.id = info.id;
    tab.dataset.name = info.title;
    tab.dataset.url = info.url;

    if (info.favIconUrl !== undefined && info.favIconUrl !== "") {
        let url = new URL(info.favIconUrl);
        if (url.protocol.match(/data|https?/)) {
            let image = document.createElement("img");
            image.src = info.favIconUrl;
            tab.appendChild(image);
        }
    }

    let name = document.createElement("div");
    name.innerText = info.title + " | " + info.url;
    tab.appendChild(name);

    tabs_ele.appendChild(tab);
}

function findNextTab(dir, active) {
    let tabs = Array.from(document.getElementsByClassName("tab"));

    let newActive = active[dir];
    while (newActive === null || newActive.classList.contains("hidden")) {
        if (newActive === null) {
            if (dir === "nextSibling") {
                newActive = tabs[0];
            } else if (dir === "previousSibling") {
                newActive = tabs[tabs.length - 1];
            }
        } else if (newActive.classList.contains("hidden")) {
            newActive = newActive[dir];
        }
    }
    return newActive;
}

function switchTab(e) {
    if (document.activeElement !== search) {
        let active = document.getElementsByClassName("active")[0];
        if (e.key === "j" || e.key === "ArrowDown") {
            active.classList.remove("active");
            let newActive = findNextTab("nextSibling", active);
            newActive.classList.add("active");
            getOnScreen();
        } else if (e.key === "k" || e.key === "ArrowUp") {
            active.classList.remove("active");
            let newActive = findNextTab("previousSibling", active);
            newActive.classList.add("active");
            getOnScreen();
        } else if (e.key === "Enter") {
            let active = document.getElementsByClassName("active")[0];
            browser.tabs.update(Number(active.dataset.id), { active: true });
            window.close();
        } else if (e.key === "/") {
            if (search.value !== "") {
                e.preventDefault();
            }
            search.focus();
            active.classList.remove("active");
        } else if (e.key === "?") {
            browser.tabs.create({ url: "help.html", active: true });
            window.close();
        } else if (e.key === "s") {
            browser.runtime.openOptionsPage();
            window.close();
        }
    } else if (e.key === "Enter") {
        let filtered = Array.from(document.getElementsByClassName("tab")).filter(
            item => !item.classList.contains("hidden")
        );
        if (filtered.length !== 0) {
            filtered[0].classList.add("active");
            search.blur();
            search.value = "";
        }
    }
}

function filter() {
    let tabs = Array.from(document.getElementsByClassName("tab"));

    if (!search.value.startsWith("/")) {
        search.value = "/" + search.value;
    }

    if (search.dataset.mode === "regex") {
        let regex = new RegExp(
            search.value.substring(1),
            search.dataset.case === "nocase" ? "i" : ""
        );
        tabs.forEach(item => {
            if (item.dataset.name.match(regex) || item.dataset.url.match(regex)) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });
    } else if (search.dataset.mode === "string") {
        tabs.forEach(item => {
            let terms = [search.value.substring(1), item.dataset.url, item.dataset.name];
            if (search.dataset.case === "nocase") {
                terms = terms.map(x => x.toLowerCase());
            }
            if (terms[1].indexOf(terms[0]) !== -1 || terms[2].indexOf(terms[0]) !== -1) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });
    }
    if (tabs.some(item => !item.classList.contains("hidden"))) {
        search.classList.remove("invalid");
    } else {
        search.classList.add("invalid");
    }
}

async function main() {
    let tabs = await browser.tabs.query({ currentWindow: true });
    await tabs.forEach(createTabs);
    getOnScreen();

    let res = await browser.storage.local.get();
    if (res.theme === "dark") {
        document.body.classList.add("dark");
        search.classList.add("dark");
        Array.from(document.getElementsByClassName("tab")).forEach(item =>
            item.classList.add("dark")
        );
    }
    search.dataset.mode = res.searchMode;
    search.dataset.case = res.caseSensitivity;
}

document.addEventListener("keydown", switchTab);
search.addEventListener("input", filter);
document.addEventListener("DOMContentLoaded", main);
