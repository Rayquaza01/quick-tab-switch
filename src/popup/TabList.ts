import { OptionsInterface } from "../OptionsInterface";
import { TabElement } from "./TabElement";

export class TabList {
    private list: TabElement[];
    private searchMode: OptionsInterface["searchMode"];
    private caseSensitivity: OptionsInterface["caseSensitivity"];

    constructor(list: TabElement[], searchMode: OptionsInterface["searchMode"], caseSensitivity: OptionsInterface["caseSensitivity"]) {
        this.list = list;
        this.searchMode = searchMode;
        this.caseSensitivity = caseSensitivity;
    }

    filter(filterText: string) {
        if (this.searchMode === "regex") {
            // create regex
            let regex = new RegExp(
                filterText,
                this.caseSensitivity ? "" : "i"
            );
            this.list.forEach(item => {
                if (item.getName.match(regex) || item.getURL.match(regex)) {
                    item.setHidden = false;
                } else {
                    item.setHidden = true;
                }
            })
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
    }

    getList(filtered: boolean = false): TabElement[] {
        if (filtered) {
            return this.list.filter(item => !item.isHidden)
        } else {
            return this.list;
        }
    }

    getActive(): TabElement {
        return this.getList(true).find(item => item.isActive);
    }

    getActiveIndex(): number {
        return this.getList(true).findIndex(item => item.isActive);
    }

    at(pos: number): TabElement {
        let list = this.getList(true);
        if (pos < 0) {
            pos = list.length - 1;
        } else if (pos > list.length - 1) {
            pos = 0
        }
        return list[pos];
    }
}
