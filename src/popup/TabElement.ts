import { loadSVG, Star } from "../svg";

/** Represents a tab */
export class TabElement {
    private element: HTMLDivElement;
    private name: string;
    private url: string;
    private id: string;
    private dead: boolean;
    private active: boolean;
    private hidden = false;
    private selected: boolean;
    private windowId: number;

    /**
     * A tab element in the page
     * @param id - The id of the tab (from Tabs.Tab)
     * @param name - The title of the tab
     * @param url - The URL of the tab
     * @param favicon - A URL representing a favicon for the tab
     * @param dead - Whether or not the tab is recently closed (dead)
     * @param active - Whether or not the tab is currently selected
     */
    constructor(id: string, name: string, url: string, favicon: string, dead: boolean, active: boolean, windowId: number) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.dead = dead;
        this.active = active;
        this.windowId = windowId!;

        // selected represents if the tab is currently selected in the tab bar
        // this mirrors active at creation, but active changes with user input
        this.selected = active;

        // create tab element
        this.element = document.createElement("div");
        this.element.classList.add("tab");

        // add favicon if possible
        if (favicon !== "") {
            const img: HTMLImageElement = document.createElement("img");
            img.src = favicon;
            this.element.appendChild(img);
        }

        // add text to element
        const text: HTMLDivElement = document.createElement("div");
        text.innerText = name + " | " + url;
        this.element.appendChild(text);

        if (active) {
            this.element.classList.add("active");

            // add class for if the tab is selected by the browser
            this.element.classList.add("selected");

            // add an indicator on the selected tab
            this.element.appendChild(loadSVG(Star));
        }

        if (dead) {
            this.element.classList.add("dead");
        }
    }

    get getWindowId() {
        return this.windowId;
    }

    /** Title of tab */
    get getName() {
        return this.name;
    }

    /** URL of tab */
    get getURL() {
        return this.url;
    }

    /** Set tab as active/inactive */
    set setActive(val: boolean) {
        this.active = val;
        if (val) {
            this.element.classList.add("active");
        } else {
            this.element.classList.remove("active");
        }
    }

    /** ID of tab */
    get getID() {
        return this.id;
    }

    /** Whether the tab is active */
    get isActive() {
        return this.active;
    }

    /** Whether the tab is selected in the tab bar */
    get isSelected() {
        return this.selected;
    }

    /** Whether the tab is dead (recently closed) */
    get isDead() {
        return this.dead;
    }

    /** Whether the tab is hidden (from a search) */
    get isHidden() {
        return this.hidden;
    }

    /** Hide / unhide the tab on the page */
    set setHidden(val: boolean) {
        this.hidden = val;
        if (val) {
            this.element.classList.add("hidden");
        } else {
            this.element.classList.remove("hidden");
        }
    }

    /** Get the HTML element on the page */
    get getElement() {
        return this.element;
    }
}
