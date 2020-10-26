export class TabElement {
    private element: HTMLDivElement;
    private name: string;
    private url: string;
    private id: string;
    private dead: boolean;
    private active: boolean;
    private hidden: boolean = false;

    constructor(id: string, name: string, url: string, favicon: string, dead: boolean, active: boolean) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.dead = dead;
        this.active = active;

        this.element = document.createElement("div");

        if (favicon !== "") {
            let img: HTMLImageElement = document.createElement("img");
            img.src = favicon;
            this.element.appendChild(img);
        }

        let text: HTMLSpanElement = document.createElement("span");
        text.innerText = name + " | " + url;
        this.element.appendChild(text);

        if (active) {
            this.element.classList.add("active");
        }

        if (dead) {
            this.element.classList.add("dead");
        }
    }

    get getName() {
        return this.name;
    }

    get getURL() {
        return this.url;
    }

    set setActive(val: boolean) {
        this.active = val;
        if (val) {
            this.element.classList.add("active");
        } else {
            this.element.classList.remove("active");
        }
    }

    get getID() {
        return this.id;
    }

    get isActive() {
        return this.active;
    }

    get isDead() {
        return this.dead;
    }

    get isHidden() {
        return this.hidden;
    }

    set setHidden(val: boolean) {
        this.hidden = val;
        if (val) {
            this.element.classList.add("hidden");
        } else {
            this.element.classList.remove("hidden");
        }
    }

    get getElement() {
        return this.element;
    }
}
