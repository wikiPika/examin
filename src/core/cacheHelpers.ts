import {Buffer} from "buffer";

export function readCache<T>(name: string): T | null {
    const item = sessionStorage.getItem(name);
    if(!item)
        return null;
    return JSON.parse(Buffer.from(item, 'base64').toString("utf8"));
}

export function writeCache<T>(name: string, item: T) {
    const serialized = Buffer.from(JSON.stringify(item), "utf8").toString("base64");
    sessionStorage.setItem(name, serialized);
}
