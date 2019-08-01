const tabs_ele = document.getElementById("tabs");
const search = document.getElementById("search");

function getOnScreen() {
    // https://stackoverflow.com/a/10445639
    let tabs = getTabList(true);
    let active = getActive();
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
    tab.dataset.id = info.hasOwnProperty("id") ? info.id : info.sessionId;
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
    return tab;
}

function findNextTab(dir, active) {
    let tabs = getTabList(true);
    let idx = tabs.indexOf(active);

    let newActive;
    let newIdx = idx + dir;
    if (newIdx === -1) {
        newActive = tabs[tabs.length - 1];
    } else if (newIdx === tabs.length) {
        newActive = tabs[0];
    } else {
        newActive = tabs[newIdx];
    }
    return newActive;
}

function getActive() {
    return document.getElementsByClassName("active")[0];
}

function getTabList(filtered = false) {
    let tabList = Array.from(document.getElementsByClassName("tab"));
    return filtered
        ? tabList.filter(item => !item.classList.contains("hidden"))
        : tabList;
}

function switchTab(e) {
    if (document.activeElement !== search) {
        let active = getActive();
        if (e.key === "j" || e.key === "ArrowDown") {
            active.classList.remove("active");
            let newActive = findNextTab(1, active);
            newActive.classList.add("active");
            getOnScreen();
        } else if (e.key === "k" || e.key === "ArrowUp") {
            active.classList.remove("active");
            let newActive = findNextTab(-1, active);
            newActive.classList.add("active");
            getOnScreen();
        } else if (e.key === "g") {
            let tabs = getTabList(true);
            active.classList.remove("active");
            tabs[0].classList.add("active");
        } else if (e.key === "G") {
            let tabs = getTabList(true);
            active.classList.remove("active");
            tabs[tabs.length - 1].classList.add("active");
        } else if (e.key === "Enter") {
            let active = getActive();
            if (active.classList.contains("dead")) {
                browser.sessions.restore(active.dataset.id);
            } else {
                browser.tabs.update(Number(active.dataset.id), { active: true });
            }
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
        let filtered = getTabList(true);
        if (filtered.length !== 0) {
            filtered[0].classList.add("active");
            search.blur();
        }
        if (search.value === "/") {
            search.value = ""
        }
    }
}

function filter() {
    let tabs = getTabList(false);

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

    let recentlyClosed = await browser.sessions.getRecentlyClosed(
        res.maxDead > 0 ? { maxResults: res.maxDead } : {}
    );
    recentlyClosed
        .filter(item => item.tab)
        .map(item => item.tab)
        .map(createTabs)
        .forEach(item => item.classList.add("dead"));

    if (res.theme === "dark") {
        document.body.classList.add("dark");
        search.classList.add("dark");
        getTabList(false).forEach(item => item.classList.add("dark"));
    }
    search.dataset.mode = res.searchMode;
    search.dataset.case = res.caseSensitivity;
}

document.addEventListener("keydown", switchTab);
search.addEventListener("input", filter);
document.addEventListener("DOMContentLoaded", main);
