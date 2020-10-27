export interface OptionsInterface {
    shortcut: string;
    searchMode: "string" | "regex";
    caseSensitivity: boolean;
    theme: "light" | "dark";
    showDead: boolean;
    maxDead: number;
}

export const DefaultOptions: OptionsInterface = {
    shortcut: "Ctrl+Shift+B",
    searchMode: "string",
    caseSensitivity: false,
    theme: "light",
    showDead: false,
    maxDead: 5
};
