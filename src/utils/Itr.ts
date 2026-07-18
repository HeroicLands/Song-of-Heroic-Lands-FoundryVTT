/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * A lazy iterator wrapper that adds array-style combinators (`map`, `filter`,
 * `take`, `reduce`, etc.) over any iterable. Transformations are evaluated
 * lazily and return new `Itr` instances, so chains do not materialize
 * intermediate arrays.
 *
 * @typeParam T - The element type produced by the iterator.
 */
export class Itr<T> implements IterableIterator<T> {
    /** Underlying source iterator. @internal */
    private iterator: Iterator<T>;

    /**
     * Wrap a source iterable, capturing its iterator for lazy consumption.
     * @param iterable - The source iterable to wrap.
     */
    constructor(iterable: Iterable<T>) {
        this.iterator = iterable[Symbol.iterator]();
    }

    /**
     * Create a new Itr instance from an iterable.
     * @param iterable - The source iterable to wrap.
     * @returns A new {@link Itr} over the iterable.
     */
    static from<U>(iterable: Iterable<U>): Itr<U> {
        return new Itr(iterable);
    }

    /**
     * Default iterator to enable `for...of` usage.
     * @yields Each element of the underlying iterator in order.
     */
    *[Symbol.iterator](): IterableIterator<T> {
        let result = this.iterator.next();
        while (!result.done) {
            yield result.value;
            result = this.iterator.next();
        }
    }

    /**
     * Return the next element in the iterator.
     * @param args - Optional value forwarded to the underlying iterator's `next`.
     * @returns The next iterator result.
     */
    next(...args: [] | [undefined]): IteratorResult<T> {
        return this.iterator.next(...args);
    }

    /**
     * Convert to an array.
     * @returns An array of all remaining elements.
     */
    toArray(): T[] {
        return Array.from(this);
    }

    /**
     * Take the first `n` elements.
     * @param n - The maximum number of elements to yield.
     * @returns A new {@link Itr} over the first `n` elements.
     */
    take(n: number): Itr<T> {
        /**
         * Yield up to `n` elements from the source.
         * @param iter - The source iterable.
         * @yields The first `n` elements.
         */
        function* generator(iter: Iterable<T>) {
            let i = 0;
            for (const item of iter) {
                if (i++ >= n) break;
                yield item;
            }
        }
        return new Itr(generator(this));
    }

    /**
     * Skip the first `n` elements.
     * @param n - The number of leading elements to skip.
     * @returns A new {@link Itr} over the elements after the first `n`.
     */
    drop(n: number): Itr<T> {
        /**
         * Yield elements after skipping the first `n`.
         * @param iter - The source iterable.
         * @yields Each element past the first `n`.
         */
        function* generator(iter: Iterable<T>) {
            let i = 0;
            for (const item of iter) {
                if (i++ >= n) yield item;
            }
        }
        return new Itr(generator(this));
    }

    /**
     * Apply a function to each element.
     * @param callback - Invoked with each element and its index.
     */
    forEach(callback: (value: T, index: number) => void): void {
        let index = 0;
        for (const item of this) {
            callback(item, index++);
        }
    }

    /**
     * Map values to a new Itr.
     * @param callback - Maps each element and its index to a new value.
     * @returns A new {@link Itr} over the mapped values.
     */
    map<U>(callback: (value: T, index: number) => U): Itr<U> {
        /**
         * Yield each source element transformed by `callback`.
         * @param iter - The source iterable.
         * @yields The mapped value for each element.
         */
        function* generator(iter: Iterable<T>) {
            let index = 0;
            for (const item of iter) {
                yield callback(item, index++);
            }
        }
        return new Itr(generator(this));
    }

    /**
     * Filter values to a new Itr.
     * @param callback - Returns `true` for each element to keep.
     * @returns A new {@link Itr} over the matching elements.
     */
    filter(callback: (value: T, index: number) => boolean): Itr<T> {
        /**
         * Yield only the source elements for which `callback` returns `true`.
         * @param iter - The source iterable.
         * @yields Each element that passes the predicate.
         */
        function* generator(iter: Iterable<T>) {
            let index = 0;
            for (const item of iter) {
                if (callback(item, index++)) yield item;
            }
        }
        return new Itr(generator(this));
    }

    /**
     * Reduce to a single value.
     * @param callback - Combines the accumulator with each element and its index.
     * @param initialValue - The initial accumulator value.
     * @returns The final accumulated value.
     */
    reduce<U>(
        callback: (accumulator: U, value: T, index: number) => U,
        initialValue: U,
    ): U {
        let index = 0;
        let accumulator = initialValue;
        for (const item of this) {
            accumulator = callback(accumulator, item, index++);
        }
        return accumulator;
    }

    /**
     * Find the first element that matches a condition.
     * @param callback - Returns `true` for the element to find.
     * @returns The first matching element, or `undefined` if none match.
     */
    find(callback: (value: T, index: number) => boolean): T | undefined {
        let index = 0;
        for (const item of this) {
            if (callback(item, index++)) return item;
        }
        return undefined;
    }

    /**
     * Check if some elements match a condition.
     * @param callback - Returns `true` for a matching element.
     * @returns `true` if at least one element matches.
     */
    some(callback: (value: T, index: number) => boolean): boolean {
        let index = 0;
        for (const item of this) {
            if (callback(item, index++)) return true;
        }
        return false;
    }

    /**
     * Check if any element matches the specified value
     * @param value - The value to search for (strict equality).
     * @returns `true` if the value is present.
     */
    includes(value: T): boolean {
        for (const item of this) {
            if (item === value) return true;
        }
        return false;
    }

    /**
     * Check if all elements match a condition.
     * @param callback - Returns `true` for an element that satisfies the condition.
     * @returns `true` if every element matches.
     */
    every(callback: (value: T, index: number) => boolean): boolean {
        let index = 0;
        for (const item of this) {
            if (!callback(item, index++)) return false;
        }
        return true;
    }
}
