export class Cursor {
    private length: number = 0;
    private current: number = 0;

    constructor(n: number) {
        this.length = n;
    }

    move(val: number) {
        this.current = (this.length + val) % this.length;
    }

    get getCurrent() {
        return this.current;
    }

    reset() {
        this.current = 0;
    }
}
