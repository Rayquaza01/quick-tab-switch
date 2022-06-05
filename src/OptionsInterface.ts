export enum SearchModes {
    STRING = "string",
    REGEX = "regex"
}

export enum Themes {
    SYSTEM = "system",
    LIGHT = "light",
    DARK = "dark"
}

export interface OptionsInterface {
    shortcut: string;
    searchMode: SearchModes;
    caseSensitivity: boolean;
    theme: Themes;
    showDead: boolean;
    maxDead: number;
}

export class Options implements OptionsInterface {
    shortcut: string;
    searchMode: SearchModes;
    caseSensitivity: boolean;
    theme: Themes;
    showDead: boolean;
    maxDead: number;

    constructor(obj: Partial<OptionsInterface>) {
        this.shortcut = obj.shortcut ?? "Ctrl+Shift+B";
        this.searchMode = obj.searchMode ?? SearchModes.STRING;
        this.caseSensitivity = obj.caseSensitivity ?? false;
        this.theme = obj.theme ?? Themes.SYSTEM;
        this.showDead = obj.showDead ?? false;
        this.maxDead = obj.maxDead ?? 5;
    }
}
