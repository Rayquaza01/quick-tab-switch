import { browser, Tabs } from "webextension-polyfill-ts";
import { TabElement } from "./TabElement";
import { TabList } from "./TabList";
import { OptionsInterface } from "../OptionsInterface";

let tabList: TabList;

const tabs_ele: HTMLDivElement = document.querySelector("#tabs");
const search: HTMLInputElement = document.querySelector("#search");
const overlay: HTMLDivElement = document.querySelector("#overlay");

function getOnScreen() {
    // scroll to the active element

    // https://stackoverflow.com/a/10445639
    if (tabList.getActiveIndex() < 10) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    } else {
        let rect = tabList.getActive().getElement.getBoundingClientRect();
        window.scrollTo({
            top: rect.top + window.pageYOffset - document.documentElement.clientTop,
            left: 0,
            behavior: "smooth"
        });
    }
}

function createTabs(info: Tabs.Tab): TabElement {
    let id: string;
    let name: string = info.title;
    let url: string = info.url;
    let favicon: string = "";
    let dead: boolean = false;
    let active: boolean = false;

    if (info.active) {
        active = true;
    }

    if (Object.prototype.hasOwnProperty.call(info, "id")) {
        id = info.id.toString();
    } else if (Object.prototype.hasOwnProperty.call(info, "sessionId")) {
        id = info.sessionId;
        dead = true
    }

    if (info.favIconUrl !== undefined && info.favIconUrl !== "") {
        let url = new URL(info.favIconUrl);
        if (url.protocol.match(/data|https?/)) {
            favicon = info.favIconUrl;
        }
    }

    return new TabElement(id, name, url, favicon, dead, active);
}

function switchTab(e: KeyboardEvent) {
    if (document.activeElement !== search) {
        e.preventDefault();
        let active = tabList.getActive();
        let activeIdx = tabList.getActiveIndex();
        if (e.key.toLowerCase() === "j" || e.key === "ArrowDown") {
            // scroll down with j, J or down arrow
            active.setActive = false;
            tabList.at(activeIdx + 1).setActive = true;
            getOnScreen();
        } else if (e.key.toLowerCase() === "k" || e.key === "ArrowUp") {
            // scroll up with k, K or up arrow
            active.setActive = false;
            tabList.at(activeIdx - 1).setActive = true;
            getOnScreen();
        } else if (e.key === "g") {
            // scroll to top
            active.setActive = false;
            tabList.at(0).setActive = true;
            getOnScreen();
        } else if (e.key === "G") {
            // scroll to bottom
            active.setActive = false;
            tabList.at(-1).setActive = true;
            getOnScreen();
            // } else if (e.key.toLowerCase() === "x") {
        } else if (e.key === "Enter") {
            // select tab
            if (active.isDead) {
                // restore session if tab is dead
                browser.sessions.restore(active.getID);
            } else {
                // switch to tab if tab is alive
                browser.tabs.update(Number(active.getID), { active: true });
            }
            window.close();
        } else if (e.key === "/") {
            // select search box
            if (search.value !== "") {
                e.preventDefault();
            }
            search.focus();
            active.setActive = false;
        } else if (e.key === "?") {
            // open help page
            browser.tabs.create({ url: "help.pdf", active: true });
            window.close();
        } else if (e.key === "s") {
            // open options page
            browser.runtime.openOptionsPage();
            window.close();
        }
    } else if (e.key === "Enter") {
        // move back to tab list from search box

        // move cursor to first visible item
        if (tabList.getList(true).length > 0) {
            tabList.at(0).setActive = true;
            search.blur();
        }
        // grey out search bar
        if (search.value === "/") {
            search.value = "";
        }
    }
}

function filter(): void {
    // filter tabs based on search box
    if (!search.value.startsWith("/")) {
        search.value = "/" + search.value;
    }

    tabList.filter(search.value.substring(1));

    // mark search as invalid if there are no results
    if (tabList.getList().some(item => !item.isHidden)) {
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
    let tabEles = tabs.map(createTabs);

    let res: OptionsInterface = await browser.storage.local.get() as OptionsInterface;

    if (res.showDead) {
        // get recently closed, with limit or unlimited if maxDead is 0
        let recentlyClosed = await browser.sessions.getRecentlyClosed(
            res.maxDead > 0 ? { maxResults: res.maxDead } : {}
        );

        tabEles = tabEles.concat(
            recentlyClosed
                .filter(item => Object.prototype.hasOwnProperty.call(item, "tab")) // filter out recently closed windows
                .map(item => item.tab) // move tab element to top
                .map(createTabs)
        );
    }

    tabEles.forEach(item => tabs_ele.appendChild(item.getElement));

    // make things dark
    if (res.theme === "dark") {
        document.body.classList.add("dark");
        search.classList.add("dark");
        overlay.classList.add("dark");
        tabEles.forEach(item => item.getElement.classList.add("dark"));
    }

    tabList = new TabList(tabEles, res.searchMode, res.caseSensitivity)
}

document.addEventListener("keydown", switchTab);
search.addEventListener("input", filter);
document.addEventListener("DOMContentLoaded", main);
document.addEventListener("focus", () => (overlay.style.display = "none"));
document.addEventListener("blur", () => (overlay.style.display = "flex"));
