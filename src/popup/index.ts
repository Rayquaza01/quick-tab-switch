require("./index.css");
import browser, { Tabs } from "webextension-polyfill";
import { TabElement } from "./TabElement";
import { TabList } from "./TabList";
import { Options, SortModes, Themes } from "../OptionsInterface";

/** List of tabs on the page */
let tabList: TabList;

const tabs_ele = document.querySelector("#tabs") as HTMLDivElement;
const search = document.querySelector("#search") as HTMLInputElement;
const overlay = document.querySelector("#overlay") as HTMLDivElement;

/** Scroll to the active element */
function getOnScreen() {
    // https://stackoverflow.com/a/10445639
    if (tabList.getActiveIndex() < 10) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    } else {
        const rect = tabList.getActive().getElement.getBoundingClientRect();
        window.scrollTo({
            top: rect.top + window.scrollY - document.documentElement.clientTop,
            left: 0,
            behavior: "smooth"
        });
    }
}

/** Create tab elements from tab query */
function createTabs(info: Tabs.Tab): TabElement {
    let id = "";
    const name = info.title ?? "";
    const url = info.url ?? "";
    let favicon = "";
    let dead = false;
    let active = false;

    if (info.active) {
        active = true;
    }

    if (Object.prototype.hasOwnProperty.call(info, "id")) {
        id = info.id?.toString() ?? "";
    } else if (Object.prototype.hasOwnProperty.call(info, "sessionId")) {
        id = info.sessionId ?? "";
        dead = true;
    }

    if (info.favIconUrl !== undefined && info.favIconUrl !== "") {
        const url = new URL(info.favIconUrl);
        if (url.protocol.match(/data|https?/)) {
            favicon = info.favIconUrl;
        }
    }

    return new TabElement(id, name, url, favicon, dead, active);
}

/** Keyboard listener */
function switchTab(e: KeyboardEvent) {
    if (document.activeElement !== search) {
        e.preventDefault();
        // const active = tabList.getActive();
        // const activeIdx = tabList.getActiveIndex();
        if (e.key.toLowerCase() === "j" || e.key === "ArrowDown") {
            // scroll down with j, J or down arrow
            tabList.next(1);
            getOnScreen();
        } else if (e.key.toLowerCase() === "k" || e.key === "ArrowUp") {
            // scroll up with k, K or up arrow
            tabList.prev(1);
            getOnScreen();
        } else if (e.key === "g") {
            // scroll to top
            tabList.selectFirst();
            getOnScreen();
        } else if (e.key === "G") {
            // scroll to bottom
            tabList.setActive(-1);
            getOnScreen();
        } else if (e.key === "Enter") {
            // select tab
            tabList.open();
            window.close();
        } else if (e.key === "/") {
            // select search box
            if (search.value !== "") {
                e.preventDefault();
            }
            search.focus();
            // tabList.clearActive();
        } else if (e.key === "w") {
            // remove active tab from tab list
            const closingSelected = tabList.removeActive();

            // close window if current tab is selected
            if (closingSelected) window.close();

            // if every item in the tab list is hidden, mark search as invalid
            if (tabList.getList(true).length === 0) {
                search.classList.add("invalid");
                search.focus();
            }
        } else if (e.key === "?") {
            // open help page
            browser.tabs.create({ url: "help.pdf", active: true });
            window.close();
        } else if (e.key === "s") {
            // open options page
            browser.runtime.openOptionsPage();
            window.close();
        }
    } else {
        if (e.key === "Enter") {
            if (e.ctrlKey) {
                tabList.open();
                window.close();
            } else {
                // move back to tab list from search box

                // move cursor to first visible item
                if (tabList.getList(true).length > 0) {
                    // tabList.setActive(0);
                    search.blur();
                }
                // grey out search bar
                if (search.value === "/") {
                    search.value = "";
                }
            }

        }

        if (e.ctrlKey) {
            if (e.key.toLowerCase() === "j") {
                e.preventDefault();
                // scroll down with j, J or down arrow
                tabList.next(1);
                getOnScreen();
            } else if (e.key.toLowerCase() === "k") {
                e.preventDefault();
                // scroll up with k, K or up arrow
                tabList.prev(1);
                getOnScreen();
            } else if (e.key === "g") {
                e.preventDefault();
                // scroll to top
                tabList.selectFirst();
                getOnScreen();
            } else if (e.key === "G") {
                e.preventDefault();
                // scroll to bottom
                tabList.setActive(-1);
                getOnScreen();
            }
        }
    }
}

/** Filter tabList using value from search box */
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

async function main(): Promise<void> {
    // get options
    const res = new Options(await browser.storage.local.get());

    // hide overlay if in focus
    if (document.hasFocus()) {
        overlay.style.display = "none";
    }

    // get tabs
    let tabs = await browser.tabs.query({ currentWindow: true });
    if (res.sortMode === SortModes.LAST_ACCESSED) {
        tabs.sort((a, b) => {
            // sort based on last accessed key for tabs
            // typecast used since ts says lastAccessed could be undefined,
            // but according to the docs, this isn't true!
            return (b.lastAccessed as number) - (a.lastAccessed as number);
        });
    }

    // remove firefox view tabs
    if (res.filterFirefoxView) {
        // remove firefox view from the list
        tabs = tabs.filter(item => item.url !== "about:firefoxview-next" && item.url !== "about:firefoxview");

        // if firefox view is selected when opened, then there will be no active tab
        // if there's no active tab, set first tab to active
        const focus = tabs.find(item => item.active);
        if (focus === undefined) {
            tabs[0].active = true;
        }
    }

    // create html elements from tab query
    let tabEles = tabs.map(createTabs);

    if (res.showDead) {
        // get recently closed, with limit or unlimited if maxDead is 0
        const recentlyClosed = await browser.sessions.getRecentlyClosed(
            res.maxDead > 0 ? { maxResults: res.maxDead } : {}
        );

        tabEles = tabEles.concat(
            recentlyClosed
                .filter(item => Object.prototype.hasOwnProperty.call(item, "tab")) // filter out recently closed windows
                .map(item => item.tab as Tabs.Tab) // move tab element to top; typecast since element cannot be undefined
                .filter(item => item)
                .map(createTabs)
        );
    }

    tabEles.forEach(item => {
        if (item !== undefined)
            tabs_ele.appendChild(item.getElement);
    });

    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // make things dark
    // Sets dark class if theme is set to dark, or if theme is set to follow system and system is set to dark.
    // Uses light theme otherwise
    if (res.theme === Themes.DARK || res.theme === Themes.SYSTEM && systemDark) {
        document.body.dataset.theme = "dark";
    }

    // only enable skip first if sorted by last accessed
    const skipFirst = res.skipFirst && res.sortMode === SortModes.LAST_ACCESSED;

    tabList = new TabList(tabEles, res.searchMode, res.caseSensitivity, skipFirst);

    if (res.autofocusSearch) {
        search.focus();
        tabList.getActive().setActive = false;
    }
}

// keyboard event
document.addEventListener("keydown", switchTab);
// filter when updating search box
search.addEventListener("input", filter);
// show / hide out of focus error
document.addEventListener("focus", () => (overlay.style.display = "none"));
document.addEventListener("blur", () => (overlay.style.display = "flex"));

document.addEventListener("DOMContentLoaded", main);
