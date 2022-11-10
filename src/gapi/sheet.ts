import { resolveEndpoint } from "./utils";
import { Constructor } from "../types";
import { getIndexes } from "../decorator/indexing";

const PLACEHOLDERS = {
    spreadsheet: "spreadsheetId",
    range: "range",
};

interface Endpoints {
    sheet: string;
}

export class SheetClient {

    constructor(
        public readonly apiKey: string,
        public readonly version: string,
        public readonly base: string,
        public readonly endpoints: Endpoints,
    ) {
    }

    static async create(apiKey: string, version = "v4") {
        return new Promise<SheetClient>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", `https://sheets.googleapis.com/$discovery/rest?version=${ version }`);
            xhr.responseType = "json";
            xhr.onerror = reject;
            xhr.onload = () => {
                const discovery: GAPI.Discovery.Response = xhr.response;
                if (discovery.version !== version) {
                    reject("version mismatch");
                }

                const endpoints: Endpoints = {
                    sheet: discovery.resources.spreadsheets.resources.values.methods.get.path,
                };

                resolve(new SheetClient(apiKey, version, discovery.baseUrl, endpoints));
            };
            xhr.send();
        });
    }

    endpoint<K extends keyof Endpoints>(key: K) {
        return `${ this.base }/${ this.endpoints[key] }?key=${ this.apiKey }`;
    }

    spreadsheet(id: string) {
        return new Spreadsheet(this, id);
    }
}


export class Spreadsheet {
    constructor(public readonly client: SheetClient, public readonly id: string) {}

    sheet<T>(id: string, clazz?: Constructor<T>): Promise<Sheet<T>> {
        const url = resolveEndpoint(this.client.endpoint("sheet"), {
            [PLACEHOLDERS.spreadsheet]: this.id,
            [PLACEHOLDERS.range]: id,
        });

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onerror = reject;
            xhr.onload = () => resolve(new Sheet(xhr.response.values, clazz));
            xhr.responseType = "json";
            xhr.send();
        });
    }
}

function compareValue<T>(a: T, b: T) {
    if (typeof a === "string" && typeof b === "string") {
        return a.toLowerCase() === b.toLowerCase();
    } else {
        return a === b;
    }
}

export class Sheet<T> {
    readonly headers: string[];
    readonly values: string[][];
    readonly items: T[];
    readonly indexes: Record<keyof T, Map<any, T[]>>;

    constructor(data?: string[][], private readonly clazz?: Constructor<T> & { from?: Function }) {
        this.items = [];
        this.indexes = {} as Record<keyof T, Map<any, T[]>>;

        if (data) {
            this.headers = data[0]?.map(value => value.toLowerCase()) || [];
            this.values = data.slice(1).filter(entry => entry.length > 0) || [];

            for (let i = 0; i < this.rowCount; i++) {
                this.items.push(this.row(i));
            }
            if (clazz) {
                for (const key of getIndexes(clazz)) {
                    const index = this.indexes[key] = new Map();
                    for (const item of this.items) {
                        const values = index.get(item[key]) || [];
                        values.push(item);
                        index.set(item[key], values);
                    }
                }
            }
        } else {
            this.headers = [];
            this.values = [];
        }
    }

    get columnCount() { return this.headers.length; }

    get rowCount() { return this.values.length; }

    get(x: number, y: number): string;
    get(y: number, name: string): string;
    get(...args: [ number, number ] | [ number, string ]) {
        if (typeof args[1] === "number") {
            const [ x, y ] = args;
            return this.values[y][x];
        } else {
            const [ y, name ] = args;
            const x = this.headers.indexOf(name.toLowerCase());
            if (x === -1) {
                throw new Error("No column matching " + name);
            }

            return this.values[y][x];
        }
    }

    row(y: number): T {
        const map: Record<string, any> = this.values[y]
            .map((value, index) => [ this.headers[index], value ])
            .reduce((obj, [ key, value ]) => Object.assign(obj, { [key]: value }), {});

        for (let i = this.values[y].length; i < this.headers.length; i++) {
            map[this.headers[i]] = "";
        }

        if (this.clazz) {
            if (typeof this.clazz.from !== "function") throw new Error(this.clazz.name + " does not have a method 'from'");
            return this.clazz.from(map);
        } else {
            return map as T;
        }
    }

    findBy<K extends keyof T>(key: K, value: T[K]): T[] {
        const index = this.indexes[key];
        if (index) {
            return index.get(value) || [];
        }

        const results: T[] = [];

        for (let i = 0; i < this.rowCount; i++) {
            const item = this.row(i);
            if (compareValue(item[key], value)) {
                results.push(item);
            }
        }

        return results;
    }

    get all() {
        return this.items;
    }
}
