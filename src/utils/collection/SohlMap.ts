/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SohlBase } from "@logic/common/core";
import { Itr } from "@utils";
import { CollectionType, DataField, RegisterClass } from "@utils/decorators";

/**
 * SohlMap - An extension of Map that returns Itr instances for iterator methods
 * and provides functional transformations with change tracking.
 */
@RegisterClass("SohlMap", "0.6.0")
export class SohlMap<K extends string, V> extends SohlBase<SohlBase> {
    @DataField("mapData", {
        collection: CollectionType.MAP,
        validator: (value): value is V => true,
    })
    private mapData!: Map<K, V>;

    /**
     * @summary Notify the parent that a value was changed or updated.
     * @param value - The value that triggered the change.
     */
    private markChanged(key: K): void {
        if (this.parent && this.fieldName) {
            // FIXME: this.parent.markForPersistence(this.fieldName, key);
        }
    }

    /**
     * @summary Adds or updates a key-value pair in the map.
     * @description
     * Associates the specified value with the given key. If the key already exists,
     * its value is overwritten. If not, a new entry is added.
     *
     * @param key - The key of the entry to add or update.
     * @param value - The value to associate with the key.
     * @returns The map itself (for chaining).
     *
     * @example
     * const map = new Map<string, number>();
     * map.set("a", 1).set("b", 2); // chaining works
     * console.log(map.get("b"));  // 2
     *
     * @remarks
     * In custom implementations like `SohlMap`, `set()` may also perform runtime type validation
     * or mark the map for persistence.
     */
    set(key: K, value: V): this {
        this.mapData.set(key, value);
        if (
            value &&
            typeof value === "object" &&
            "setTracking" in value &&
            typeof value.setTracking === "function"
        ) {
            (value as any).setTracking(this.parent, this.fieldName, key);
        }
        this.markChanged(key);
        return this;
    }

    /**
     * @summary Removes the specified key and its associated value from the map.
     * @description
     * If the key exists in the map, the entry is removed and the method returns `true`.
     * Otherwise, no change is made and `false` is returned.
     *
     * @param key - The key of the entry to delete.
     * @returns `true` if the entry existed and was removed, or `false` if the key was not found.
     *
     * @example
     * const map = new Map([["x", 10]]);
     * map.delete("x"); // true
     * map.delete("y"); // false
     */
    delete(key: K): boolean {
        const result = this.mapData.delete(key);
        if (result) this.markChanged(key);
        return result;
    }

    /**
     * @summary Removes all key-value pairs from the map.
     * @description
     * Deletes all entries from the map, resetting its size to zero. After calling this method,
     * `map.size === 0` and `map.has(key)` will return `false` for all previously stored keys.
     *
     * @returns void
     *
     * @example
     * const map = new Map([["a", 1], ["b", 2]]);
     * map.clear();
     * console.log(map.size); // 0
     *
     * @remarks
     * This operation is destructive and cannot be undone. It will also trigger persistence logic
     * if your custom map implementation tracks data changes (e.g. `SohlMap`).
     */
    clear(): void {
        for (const key of this.keys()) {
            this.markChanged(key);
        }
        this.mapData.clear();
    }

    /**
     * @summary Determines whether a given key exists in the map.
     * @description
     * Returns `true` if the map contains an entry with the specified key,
     * or `false` if no such key exists.
     *
     * @param key - The key to check for existence.
     * @returns `true` if the key exists, otherwise `false`.
     *
     * @example
     * const map = new Map([["id", 100]]);
     * console.log(map.has("id"));   // true
     * console.log(map.has("name")); // false
     */
    has(key: K): boolean {
        return this.mapData.has(key);
    }

    /**
     * @summary Retrieves the value associated with the specified key.
     * @description
     * Returns the value mapped to the given key, or `undefined` if the key is not present.
     *
     * @param key - The key to retrieve a value for.
     * @returns The associated value, or `undefined` if the key is missing.
     *
     * @example
     * const map = new Map([["mode", "hardcore"]]);
     * console.log(map.get("mode"));    // "hardcore"
     * console.log(map.get("missing")); // undefined
     *
     * @remarks
     * Unlike arrays, using a missing key will not throw an error — you'll simply get `undefined`.
     */
    get(key: K): V | undefined {
        return this.mapData.get(key);
    }

    /**
     * @summary Returns the number of key-value pairs in the map.
     * @description
     * Reflects the total number of entries currently stored in the map.
     * This is a read-only property.
     *
     * @readonly
     *
     * @example
     * const map = new Map();
     * map.set("x", 1);
     * map.set("y", 2);
     * console.log(map.size); // 2
     */
    size(): number {
        return this.mapData.size;
    }

    /**
     * @summary Returns an iterator over the map's keys.
     * @description
     * Produces an iterable iterator that yields each key in the map in insertion order.
     *
     * This method allows you to iterate over just the keys without accessing the associated values.
     *
     * @returns An iterable iterator over the keys in the map.
     *
     * @example
     * const map = new Map([["a", 1], ["b", 2]]);
     * for (const key of map.keys()) {
     *   console.log(key); // "a", then "b"
     * }
     */

    keys(): Itr<K> {
        return Itr.from(this.mapData.keys());
    }

    /**
     * @summary Returns an iterator over the map's values.
     * @description
     * Produces an iterable iterator that yields each value in the map in insertion order,
     * ignoring the keys.
     *
     * @returns An iterable iterator over the values in the map.
     *
     * @example
     * const map = new Map([["x", 10], ["y", 20]]);
     * for (const value of map.values()) {
     *   console.log(value); // 10, then 20
     * }
     */
    values(): Itr<V> {
        return Itr.from(this.mapData.values());
    }

    /**
     * @summary Returns an iterator over the map's entries.
     * @description
     * Produces an iterable iterator that yields `[key, value]` pairs from the map,
     * in insertion order.
     *
     * This is the default iterator for Map, so it’s equivalent to `[Symbol.iterator]()`.
     *
     * @returns An iterable iterator of `[K, V]` tuples.
     *
     * @example
     * const map = new Map([["id", 42], ["status", "active"]]);
     * for (const [key, value] of map.entries()) {
     *   console.log(`${key} => ${value}`);
     * }
     */
    entries(): Itr<[K, V]> {
        return Itr.from(this.mapData.entries());
    }

    /**
     * @summary Iterates entries while allowing dynamic expansion.
     * @description
     * Provides a breadth-first iterator over all entries in the collection, including new items added
     * during the iteration itself. This allows your logic to traverse all known items and process
     * new ones as they are introduced dynamically.
     *
     * Unlike standard `.entries()` iteration, which operates over a fixed snapshot of the data,
     * `expandingEntries()` reflects **live state**. As entries are added, they are queued and
     * subsequently included in the iteration.
     *
     * @remarks
     * - This method guarantees that every element currently in the collection or added while iterating will be visited **once**.
     * - The order is breadth-first, preserving logical consistency when traversal depends on the state of prior elements.
     *
     * @returns The mutating iterator.
     *
     * @example
     * ```ts
     * const map = new SohlMap<string, Mod>();
     * map.set("a", new Mod());
     *
     * for (const [key, mod] of map.expandingEntries()) {
     *   if (key === "a") map.set("b", new Mod()); // 'b' will be picked up automatically
     * }
     * ```
     */
    expandingEntries(): Itr<[K, V]> {
        const seen = new Set<K>();
        const queue: K[] = [...this.mapData.keys()];

        const self = this.mapData;

        const iterator = (function* (): IterableIterator<[K, V]> {
            while (queue.length > 0) {
                const key = queue.shift();
                if (key === undefined || seen.has(key)) continue;

                const value = self.get(key);
                if (value !== undefined) {
                    yield [key, value];
                    seen.add(key);

                    // Capture any new keys that may have been added
                    for (const newKey of self.keys()) {
                        if (!seen.has(newKey) && !queue.includes(newKey)) {
                            queue.push(newKey);
                        }
                    }
                }
            }
        })();

        return new Itr(iterator);
    }

    /** @inheritdoc */
    [Symbol.iterator](): Itr<[K, V]> {
        return new Itr(this.mapData.entries());
    }
}
