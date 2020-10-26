let $ = q => document.querySelector(q);
let $$ = q => [...document.querySelectorAll(q)];
const tabs_ele = $("#tabs");
const search = $("#search");
const overlay = $("#overlay");

function getOnScreen() {
    // scroll to the active element

    // https://stackoverflow.com/a/10445639
    let tabs = getTabList(true);
    let active = $(".active");
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
    if (Object.prototype.hasOwnProperty.call(info, "id")) {
        tab.dataset.id = info.id;
    } else if (Object.prototype.hasOwnProperty.call(info, "sessionId")) {
        tab.dataset.id = info.sessionId;
        tab.classList.add("dead");
    }
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
    // Get the active tab in a direction
    // dir is the direction, +1 (down) or -1 (up)
    // active is the active tab

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

function getTabList(filtered = false) {
    // get the list of tabs
    // if filtered is false, it returns all tabs, even hidden ones
    // if filtered is true, it returns only visible tabs
    let tabList = $$(".tab");
    return filtered
        ? tabList.filter(item => !item.classList.contains("hidden"))
        : tabList;
}

function switchTab(e) {
    if (document.activeElement !== search) {
        let active = $(".active");
        if (e.key.toLowerCase() === "j" || e.key === "ArrowDown") {
            // scroll down with j, J or down arrow
            active.classList.remove("active");
            let newActive = findNextTab(1, active);
            newActive.classList.add("active");
            getOnScreen();
        } else if (e.key.toLowerCase() === "k" || e.key === "ArrowUp") {
            // scroll up with k, K or up arrow
            active.classList.remove("active");
            let newActive = findNextTab(-1, active);
            newActive.classList.add("active");
            getOnScreen();
        } else if (e.key === "g") {
            // scroll to top
            let tabs = getTabList(true);
            active.classList.remove("active");
            tabs[0].classList.add("active");
            getOnScreen();
        } else if (e.key === "G") {
            // scroll to bottom
            let tabs = getTabList(true);
            active.classList.remove("active");
            tabs[tabs.length - 1].classList.add("active");
            getOnScreen();
            // } else if (e.key.toLowerCase() === "x") {
        } else if (e.key === "Enter") {
            // select tab
            let active = $(".active");
            if (active.classList.contains("dead")) {
                // restore session if tab is dead
                browser.sessions.restore(active.dataset.id);
            } else {
                // switch to tab if tab is alive
                browser.tabs.update(Number(active.dataset.id), { active: true });
            }
            window.close();
        } else if (e.key === "/") {
            // select search box
            if (search.value !== "") {
                e.preventDefault();
            }
            search.focus();
            active.classList.remove("active");
        } else if (e.key === "?") {
            // open help page
            browser.tabs.create({ url: "help/index.html", active: true });
            window.close();
        } else if (e.key === "s") {
            // open options page
            browser.runtime.openOptionsPage();
            window.close();
        }
    } else if (e.key === "Enter") {
        // move back to tab list from search box

        let filtered = getTabList(true);
        // move cursor to first visible item
        if (filtered.length !== 0) {
            filtered[0].classList.add("active");
            search.blur();
        }
        // grey out search bar
        if (search.value === "/") {
            search.value = "";
        }
    }
}

function filter() {
    // filter tabs based on search box
    let tabs = getTabList(false);

    if (!search.value.startsWith("/")) {
        search.value = "/" + search.value;
    }

    if (search.dataset.mode === "regex") {
        // create regex
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
            // create array of search term, url, and title
            let terms = [search.value.substring(1), item.dataset.url, item.dataset.name];
            // switch to lowercase if case insensitive
            if (search.dataset.case === "nocase") {
                terms = terms.map(x => x.toLowerCase());
            }
            // if url contains term OR title contains term
            if (terms[1].indexOf(terms[0]) !== -1 || terms[2].indexOf(terms[0]) !== -1) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });
    }
    // mark search as invalid if there are no results
    if (tabs.some(item => !item.classList.contains("hidden"))) {
        search.classList.remove("invalid");
    } else {
        search.classList.add("invalid");
    }
}

async function main() {
    // hide overlay if in focus
    if (document.hasFocus()) {
        overlay.style.display = "none";
    }

    let tabs = await browser.tabs.query({ currentWindow: true });
    await tabs.forEach(createTabs);
    getOnScreen();

    let res = await browser.storage.local.get();

    if (res.showDead) {
        // get recently closed, with limit or unlimited if maxDead is 0
        let recentlyClosed = await browser.sessions.getRecentlyClosed(
            res.maxDead > 0 ? { maxResults: res.maxDead } : {}
        );

        recentlyClosed
            .filter(item => item.tab) // filter out recently closed windows
            .map(item => item.tab) // move tab element to top
            .forEach(createTabs);
    }

    // make things dark
    if (res.theme === "dark") {
        document.body.classList.add("dark");
        search.classList.add("dark");
        overlay.classList.add("dark");
        getTabList(false).forEach(item => item.classList.add("dark"));
    }
    search.dataset.mode = res.searchMode;
    search.dataset.case = res.caseSensitivity;
}

document.addEventListener("keydown", switchTab);
search.addEventListener("input", filter);
document.addEventListener("DOMContentLoaded", main);
document.addEventListener("focus", () => (overlay.style.display = "none"));
document.addEventListener("blur", () => (overlay.style.display = "flex"));
