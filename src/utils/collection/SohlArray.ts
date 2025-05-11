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
 * @summary A tracked array that participates in the SoHL data lifecycle.
 * @description
 * `SohlArray<T>` is an extension of the native `Array<T>` that supports automatic tracking of parent context and persistence.
 * It is used to hold ordered collections of `SohlBase`-derived objects such as Effects or nested Logic items.
 *
 * @remarks
 * The array tracks its parent context (SohlEntity or SohlPerformer) and notifies it when changes occur.
 * All iterator methods return an `Itr<T>` object for functional utilities.
 *
 * ### WARNING
 * Do not assign directly to an index (e.g., `arr[0] = value`). Instead, use `setAt(index, value)` to ensure
 * proper lifecycle tracking.
 *
 * @example
 * ```ts
 * const arr = new SohlArray<ValueModifier>();
 * arr.push(new ValueModifier());
 * for (const val of arr) {
 *   console.log(val);
 * }
 * ```
 */
@RegisterClass("SohlArray", "0.6.0")
export class SohlArray<T> extends SohlBase<SohlBase> {
    @DataField("arrayData", {
        collection: CollectionType.ARRAY,
        validator: (value): value is T => true,
    })
    private arrayData!: Array<T>;

    /**
     * @summary Notify the parent that the given index has changed.
     * @param index - The array index that was modified.
     */
    private markChanged(index: number): void {
        if (this.parent && this.fieldName != null) {
            //this.parent.markForPersistence(this.fieldName, index);
        }
    }

    /**
     * @summary Returns an iterator over the array's values.
     * @description
     * Yields each element of the array in numeric index order.
     * Equivalent to the default iterator and `Symbol.iterator`.
     *
     * @returns An iterable iterator over the array's elements.
     *
     * @example
     * for (const value of myArray.values()) {
     *   console.log(value);
     * }
     */
    values(): Itr<T> {
        return new Itr(this.arrayData.values());
    }

    /**
     * @summary Returns an iterator over the array's keys (indices).
     * @description
     * Yields the numeric indices of each item in the array.
     *
     * @returns An iterable iterator over the array's indices.
     *
     * @example
     * for (const index of myArray.keys()) {
     *   console.log(index);
     * }
     */
    keys(): Itr<number> {
        return new Itr(this.arrayData.keys());
    }

    /**
     * @summary Returns an iterator over key-value pairs [index, element].
     * @description
     * Each iteration yields a tuple containing the index and the corresponding element.
     *
     * @returns An iterable iterator of `[index, value]` pairs.
     *
     * @example
     * for (const [index, value] of myArray.entries()) {
     *   console.log(index, value);
     * }
     */
    entries(): Itr<[number, T]> {
        return new Itr(this.arrayData.entries());
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
     * const arr = new SohlArray<number>(1, 2);
     *
     * for (const [i, v] of arr.expandingEntries()) {
     *   if (v === 2) arr.push(3); // 3 will be included in this same loop
     * }
     * ```
     */
    expandingEntries(): Itr<[number, T]> {
        const self = this.arrayData;
        const seen = new Set<number>();
        let index = 0;

        return new Itr(
            (function* (): IterableIterator<[number, T]> {
                while (index < self.length) {
                    if (!seen.has(index)) {
                        const value = self[index];
                        yield [index, value];
                        seen.add(index);
                    }
                    index++;
                }
            })(),
        );
    }

    /**
     * @summary The default iterator for SohlArray.
     * @description
     * Allows the array to be iterated using `for...of`, spreading, or other iterable utilities.
     * Equivalent to `.values()`.
     *
     * @returns An iterable iterator over the array's elements.
     *
     * @example
     * for (const item of myArray) {
     *   console.log(item);
     * }
     */
    [Symbol.iterator](): Itr<T> {
        return new Itr(this.arrayData[Symbol.iterator]());
    }

    /**
     * @summary Adds one or more elements to the end of the array.
     * @description
     * Extends the array by appending new elements. Returns the new length of the array.
     *
     * @param items - One or more elements to add to the array.
     * @returns The new length of the array.
     *
     * @example
     * myArray.push("newItem");
     */
    push(...items: T[]): number {
        const indexStart = this.arrayData.length;
        const result = this.arrayData.push(...items);
        items.forEach((_, i) => this.markChanged(indexStart + i));
        return result;
    }

    /**
     * @summary Changes the contents of the array by removing or replacing existing elements.
     * @description
     * Removes elements starting at the given index and optionally inserts new elements.
     * Returns an array of the removed elements.
     *
     * @param start - Index at which to start changing the array.
     * @param deleteCount - Number of elements to remove.
     * @param items - Optional items to insert in place of the removed elements.
     * @returns An array containing the removed elements.
     *
     * @example
     * myArray.splice(1, 2, "a", "b");
     */
    splice(start: number, deleteCount?: number, ...items: T[]): T[] {
        const result = this.arrayData.splice(start, deleteCount ?? 0, ...items);
        for (let i = 0; i < items.length; i++) {
            this.markChanged(start + i);
        }
        return result;
    }

    /**
     * @summary Removes the last element from the array and returns it.
     * @description
     * If the array is empty, returns `undefined`. The length of the array is decreased by one.
     *
     * @returns The removed element, or `undefined` if the array was empty.
     *
     * @example
     * const last = myArray.pop();
     */
    pop(): T | undefined {
        const index = this.arrayData.length - 1;
        const value = this.arrayData.pop();
        this.markChanged(index);
        return value;
    }

    /**
     * @summary Removes and returns the first element of the array.
     * @description
     * Shifts all remaining elements one position to the left and returns the removed value.
     * If the array is empty, returns `undefined`.
     *
     * @returns The removed first element, or `undefined` if the array was empty.
     *
     * @example
     * const first = myArray.shift();
     * console.log(first); // Logs the removed first element
     */
    shift(): T | undefined {
        const value = this.arrayData.shift();
        this.markChanged(0);
        return value;
    }

    /**
     * @summary Adds one or more elements to the beginning of the array.
     * @description
     * Inserts the specified elements at the start of the array, shifting existing elements to the right.
     * Returns the new length of the array.
     *
     * @param items - One or more elements to add to the beginning of the array.
     * @returns The new length of the array after the elements are added.
     *
     * @example
     * myArray.unshift("a", "b");
     * console.log(myArray); // ['a', 'b', ...originalElements]
     */
    unshift(...items: T[]): number {
        const result = this.arrayData.unshift(...items);
        for (let i = 0; i < items.length; i++) {
            this.markChanged(i);
        }
        return result;
    }

    /**
     * @summary Safely assign a value at the specified index with lifecycle tracking.
     * @description
     * This method replaces the element at the given index and ensures the change is properly
     * tracked for persistence and lifecycle propagation. It integrates with the SoHL system
     * by linking the new value to its parent context and notifying the parent of the update.
     *
     * ### IMPORTANT
     * This method should always be used instead of direct assignment (`array[index] = value`).
     * Direct assignment bypasses lifecycle and persistence hooks, resulting in data that may
     * not be saved or correctly initialized.
     *
     * @remarks
     * - If the value is a subclass of `SohlBase`, `setTracking()` is called automatically.
     * - Triggers `markChanged(index)` to notify the parent that this slot has been updated.
     * - Maintains internal consistency and enables serialization, rollback, and syncing behavior.
     *
     * @param index - The index in the array to replace.
     * @param value - The new value to assign to the index.
     *
     * @example
     * const arr = new SohlArray<ValueModifier>();
     * arr.setTracking(myLogic, "modifiers");
     *
     * // Correct usage — tracked and persisted
     * arr.setAt(0, new ValueModifier());
     *
     * // Avoid — this bypasses SoHL lifecycle logic
     * arr[0] = new ValueModifier();
     */
    setAt(index: number, value: T): void {
        this.arrayData[index] = value; // Will not be tracked, so we add manual tracking below
        if (index > this.arrayData.length) {
            throw new RangeError(
                `Index ${index} is out of bounds (length: ${this.arrayData.length})`,
            );
        }

        this.markChanged(index);

        if (
            value &&
            typeof value === "object" &&
            "setTracking" in value &&
            typeof value.setTracking === "function"
        ) {
            (value as any).setTracking(this.parent, this.fieldName, index);
        }
    }

    /**
     * @summary Creates a new array with the results of calling a function on each element.
     * @description
     * Returns a new array containing the results of applying the callback function to each element.
     * Does not modify the original array.
     *
     * @param fn - A function that produces an element of the new array, taking the current item, index, and array.
     * @returns A new array with transformed elements.
     *
     * @example
     * const squared = myArray.map(n => n * n);
     */
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[] {
        return this.arrayData.map(fn);
    }

    /**
     * @summary Applies a function against an accumulator and each element to reduce to a single value.
     * @description
     * The callback is applied sequentially to each element of the array and the accumulated result is returned.
     *
     * @param fn - A reducer function taking accumulator, current value, index, and array.
     * @param initial - The initial value to start accumulation.
     * @returns The final accumulated value.
     *
     * @example
     * const sum = myArray.reduce((total, n) => total + n, 0);
     */
    reduce<U>(
        fn: (acc: U, curr: T, index: number, array: T[]) => U,
        initial: U,
    ): U {
        return this.arrayData.reduce(fn, initial);
    }

    /**
     * @summary The number of elements in the array.
     * @description
     * Reflects the total count of elements in the array. This is a read-only property.
     *
     * @readonly
     * @example
     * console.log(myArray.length); // e.g., 5
     */
    get length(): number {
        return this.arrayData.length;
    }

    /**
     * @summary Returns the element at the specified index.
     * @description
     * Allows access to an element by index, including support for negative indices to count from the end.
     *
     * @param index - The index of the element to retrieve. If negative, counts from the end of the array.
     * @returns The element at the specified index, or `undefined` if out of bounds.
     *
     * @example
     * const last = myArray.at(-1); // Gets the last element
     */
    at(index: number): T | undefined {
        return this.arrayData.at(index);
    }
}
