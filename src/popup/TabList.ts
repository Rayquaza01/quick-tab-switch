import browser from "webextension-polyfill";

import { OptionsInterface } from "../OptionsInterface";
import { TabElement } from "./TabElement";

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

function clamp(num: number, min: number, max: number) {
    return Math.min(max, Math.max(num, min));
}

/** List of TabElements */
export class TabList {
    private list: TabElement[];
    private searchMode: OptionsInterface["searchMode"];
    private caseSensitivity: OptionsInterface["caseSensitivity"];
    private skipFirst: boolean;

    /**
     * Create list of tab elements
     * @param list - A list of tab elements
     * @param searchMode - Normal or Regex search
     * @param caseSensitivity - Is search case sensitive
     */
    constructor(list: TabElement[], searchMode: OptionsInterface["searchMode"], caseSensitivity: OptionsInterface["caseSensitivity"], skipFirst: boolean) {
        this.list = list;
        this.searchMode = searchMode;
        this.caseSensitivity = caseSensitivity;
        this.skipFirst = skipFirst;

        if (this.skipFirst) {
            this.selectFirst();
        }
    }

    /**
     * Filters list based on search term
     * @param filterText - Search term to use
     */
    filter(filterText: string): void {
        // get active before filtering
        // this the selected tab *before* applying the new string
        // active could be undefined if search was invalid
        const active = this.getActive();
        const activeIdx = this.getActiveIndex();

        if (this.searchMode === "regex") {
            // create regex
            const regex = new RegExp(
                filterText,
                this.caseSensitivity ? "" : "i"
            );
            this.list.forEach(item => {
                if (item.getName.match(regex) || item.getURL.match(regex)) {
                    item.setHidden = false;
                } else {
                    item.setHidden = true;
                }
            });
        } else if (this.searchMode === "string") {
            this.list.forEach(item => {
                // create array of search term, url, and title
                let terms = [filterText, item.getURL, item.getName];
                // switch to lowercase if case insensitive
                if (!this.caseSensitivity) {
                    terms = terms.map(x => x.toLowerCase());
                }
                // if url contains term OR title contains term
                if (terms[1].indexOf(terms[0]) !== -1 || terms[2].indexOf(terms[0]) !== -1) {
                    item.setHidden = false;
                } else {
                    item.setHidden = true;
                }
            });
        }

        const length = this.getList(true).length;
        // if search is valid
        if (length > 0) {
            // if there was a previous active, set it as blank
            if (active) active.setActive = false;

            // new active is either the currently selected item, or the last item
            // whichever comes first
            const newActive = clamp(activeIdx, 0, length - 1);
            if (newActive < 2) {
                // if new active is the first element, do select first
                // if skipFirst is set (ie tab order is last accessed), first tab is probably selected (in the browser) tab
                // so we select first to avoid moving the cursor on top of the selected tab
                // if the selected tab is NOT the first, or if skipFirst is not set,
                // this will select the first element normally
                this.selectFirst();
            } else {
                this.setActive(newActive);
            }
        }
        // if list is empty, no need to select anything. nothing is visible anyway.
    }

    /**
     * Get list of TabElements
     * @param filtered - Return filtered list
     */
    getList(filtered = false): TabElement[] {
        if (filtered) {
            return this.list.filter(item => !item.isHidden);
        } else {
            return this.list;
        }
    }

    /** Get active element from list */
    getActive(): TabElement {
        return this.getList(true).find(item => item.isActive) as TabElement;
    }

    /** Get index of active element from list */
    getActiveIndex(): number {
        return this.getList(true).findIndex(item => item.isActive);
    }

    /**
     * Get item in position on filtered list
     * @param pos - Position on list to get. Positions outside the bounds of the array wrap.
     */
    at(pos: number): TabElement {
        const list = this.getList(true);
        return list[mod(pos, list.length)];
    }

    removeActive(): boolean {
        const active = this.getActive();
        const activeIndex = this.getActiveIndex();

        if (active.isDead) {
            return false;
        }

        browser.tabs.remove(Number(active.getID));

        // remove active element from DOM
        active.getElement.parentElement?.removeChild(active.getElement);

        // set next element in list to be active
        this.at(activeIndex + 1).setActive = true;

        // remove from tab list
        // get real index (can't use getActiveIndex, since that is filtered by search)
        const absActiveIndex = this.list.indexOf(active);
        this.list.splice(absActiveIndex, 1);

        return active.isSelected;
    }

    next(num: number) {
        const active = this.getActive();
        const activeIdx = this.getActiveIndex();

        active.setActive = false;
        this.at(activeIdx + num).setActive = true;
    }

    prev(num: number) {
        const active = this.getActive();
        const activeIdx = this.getActiveIndex();

        active.setActive = false;
        this.at(activeIdx - num).setActive = true;
    }

    setActive(pos: number) {
        const active = this.getActive();
        if (active) active.setActive = false;

        this.at(pos).setActive = true;
    }

    selectFirst() {
        if (this.skipFirst && this.at(0).isSelected && !this.at(1).isDead) {
            this.setActive(1);
        } else {
            this.setActive(0);
        }
    }

    clearActive() {
        this.getActive().setActive = false;
    }

    open(pos?: number) {
        const active = pos !== undefined
            ? this.at(pos)
            : this.getActive();

        if (active.isDead) {
            // restore session if tab is dead
            browser.sessions.restore(active.getID);
        } else {
            // switch to tab if tab is alive
            browser.tabs.update(Number(active.getID), { active: true });
        }
    }
}
