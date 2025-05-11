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
import { CollectionType, DataField, RegisterClass } from "@utils";
import { Itr } from "@utils/Itr";

/**
 * @summary A Set-like collection with SoHL tracking and iterable enhancements.
 * @description
 * `SohlSet<T>` behaves like a native `Set<T>` but supports parent linkage and persistence signaling.
 * All iteration methods return `Itr<T>` for compatibility with functional helpers.
 *
 * @remarks
 * Used when order doesn't matter, but tracking of additions/removals is needed for data persistence or lifecycle.
 * Supports `expandingEntries()` to allow for dynamic set mutation during iteration.
 *
 * @example
 * ```ts
 * const s = new SohlSet<ValueModifier>();
 * s.add(new ValueModifier());
 * for (const v of s) {
 *   console.log(v);
 * }
 * ```
 */
@RegisterClass("SohlMap", "0.6.0")
export class SohlSet<T> extends SohlBase<SohlBase> {
    @DataField("mapData", {
        collection: CollectionType.SET,
        validator: (value): value is T => true,
    })
    private setData!: Set<T>;

    /**
     * @summary Notify the parent that a value was changed or updated.
     * @param value - The value that triggered the change.
     */
    private markChanged(value: T): void {
        if (this.parent && this.fieldName) {
            // FIXME:            this.parent.markForPersistence(this.fieldName, value);
        }
    }

    /**
     * @summary Default iterator for the set.
     * @description
     * Allows iteration over the set's values using `for...of`, spread syntax, or other iterable mechanisms.
     * Delegates to `.values()`, which returns an `Itr<T>`.
     *
     * @returns An iterable iterator over the set's values.
     *
     * @example
     * for (const value of mySet) {
     *   console.log(value);
     * }
     */
    [Symbol.iterator](): Itr<T> {
        return new Itr(this.setData[Symbol.iterator]());
    }

    /**
     * @summary Adds a value to the set.
     * @description
     * Inserts the specified value into the set if it does not already exist.
     * Tracks the insertion for persistence and lifecycle if supported.
     *
     * @param value - The value to add.
     * @returns The set itself, for chaining.
     *
     * @example
     * mySet.add("newItem").add("anotherItem");
     */
    add(value: T): this {
        this.setData.add(value);
        this.markChanged(value);
        return this;
    }

    /**
     * @summary Removes a value from the set.
     * @description
     * Deletes the specified value from the set if present.
     * Marks the set as changed for persistence.
     *
     * @param value - The value to remove.
     * @returns `true` if the value was found and removed, `false` otherwise.
     *
     * @example
     * const removed = mySet.delete("oldItem");
     */
    delete(value: T): boolean {
        const result = this.setData.delete(value);
        if (result) this.markChanged(value);
        return result;
    }

    /**
     * @summary Removes all values from the set.
     * @description
     * Empties the set completely. This operation marks the set as changed and
     * may notify the persistence system depending on implementation.
     *
     * @example
     * mySet.clear();
     */
    clear(): void {
        for (const value of this.setData) {
            this.markChanged(value);
        }
        this.setData.clear();
    }

    /**
     * @summary Returns an iterator over the set's values.
     * @description
     * Provides a custom `Itr<T>` instance for use with chaining and functional operations.
     *
     * @returns An `Itr<T>` representing the values in the set.
     *
     * @example
     * mySet.values().filter(v => v.active).forEach(console.log);
     */
    values(): Itr<T> {
        return new Itr(this.setData.values());
    }

    /**
     * @summary Returns an iterator over the set's keys (same as values).
     * @description
     * For compatibility with `Map`, this returns the same iterator as `.values()`.
     * This is useful for polymorphism with other collection types.
     *
     * @returns An `Itr<T>` representing the values/keys of the set.
     *
     * @example
     * for (const key of mySet.keys()) {
     *   console.log(key);
     * }
     */
    keys(): Itr<T> {
        return new Itr(this.setData.keys());
    }

    /**
     * @summary Returns an iterator over `[value, value]` pairs.
     * @description
     * Mimics the behavior of `Set.prototype.entries()` in JavaScript.
     * Each entry is a pair of `[value, value]`, for compatibility with `Map` iteration.
     *
     * @returns An `Itr<[T, T]>` for iteration with destructuring.
     *
     * @example
     * for (const [a, b] of mySet.entries()) {
     *   console.log(a, b); // a === b
     * }
     */
    entries(): Itr<[T, T]> {
        return new Itr(this.setData.entries());
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
     * const set = new SohlSet<string>();
     * set.add("one");
     *
     * for (const [value] of set.expandingEntries()) {
     *   if (value === "one") set.add("two"); // 'two' will be iterated after
     * }
     * ```
     */
    expandingEntries(): Itr<[T, T]> {
        const seen = new Set<T>();
        const queue: T[] = [...this.setData.values()];
        const self = this.setData;

        return new Itr(
            (function* (): IterableIterator<[T, T]> {
                while (queue.length > 0) {
                    const value = queue.shift();
                    if (value === undefined || seen.has(value)) continue;

                    yield [value, value];
                    seen.add(value);

                    // Check for new values added during iteration
                    for (const newValue of self.values()) {
                        if (!seen.has(newValue) && !queue.includes(newValue)) {
                            queue.push(newValue);
                        }
                    }
                }
            })(),
        );
    }
}
