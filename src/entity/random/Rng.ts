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
 * Seedable, Foundry-free pseudo-random number generators for the SoHL logic
 * layer — the reproducible RNG streams backing {@link sohl.entity.roll.SimpleRoll}
 * and hit-location selection.
 *
 * **Determinism is a frozen contract.** For a given seed, every implementation
 * here emits the same sequence forever; golden values are locked in tests. Once
 * shipped, an algorithm's output for a seed must never change.
 *
 * **32-bit by design.** These target JavaScript's 32-bit integer math
 * (`Math.imul`, `| 0`, `>>> 0`); no 64-bit generators (they need BigInt or
 * hi/lo splitting for no benefit at dice scale).
 *
 * **Reentrant / injectable.** Every generator keeps its entire state in
 * instance fields — there is **no** module-level or `static` mutable state and
 * **no** shared scratch buffer reused across instances or calls. Any number of
 * `Rng` instances therefore run interleaved (or concurrently, across async
 * flows) with zero cross-talk: each method only advances *its own* stream. A
 * flow that must not perturb another simply holds its own instance; the shared
 * {@link sohl.random} singleton is one stream, safe for atomic synchronous
 * draws but explicitly *not* isolated — inject an instance when isolation
 * matters.
 *
 * **Not cryptographic.** These are for gameplay reproducibility and tests only;
 * never use them for security. See {@link https://kb.heroiclands.org/dev/reference/randomness/}.
 */

/**
 * A seedable pseudo-random number generator. The core surface (`float` /
 * `uint32` / `int` / `die`) produces **unbiased** values; the control surface
 * (`seed` / `getState` / `setState`) lets the singleton and e2e reset and
 * snapshot the stream.
 */
export interface Rng {
    /**
     * A uniform float in `[0, 1)` at 32-bit resolution (like `Math.random`).
     * @returns A pseudo-random number, `0 <= n < 1`.
     */
    float(): number;

    /**
     * A uniform integer in `[0, bound)`, **unbiased** (rejection-sampled — no
     * modulo/rounding skew, which matters on d100-scale hit-location tables).
     * @param bound - Exclusive upper bound; must be `>= 1`.
     * @returns An integer `0 <= n < bound`.
     * @throws {RangeError} If `bound < 1`.
     */
    uint32(bound: number): number;

    /**
     * A uniform integer in `[min, max]`, inclusive on both ends.
     * @param min - Inclusive lower bound.
     * @param max - Inclusive upper bound; must be `>= min`.
     * @returns An integer `min <= n <= max`.
     * @throws {RangeError} If `max < min`.
     */
    int(min: number, max: number): number;

    /**
     * A uniform die roll in `[1, sides]`.
     * @param sides - Number of faces; must be `>= 1`.
     * @returns An integer `1 <= n <= sides`.
     * @throws {RangeError} If `sides < 1`.
     */
    die(sides: number): number;

    /**
     * Fully **reset** the stream to a known start (reset, not perturb). String
     * seeds hash through `cyrb128`, so seeding each unit test with its own name
     * gives an independent, reproducible stream for free.
     * @param seed - A string, a single number, or the four state words directly.
     */
    seed(seed: string | number | number[]): void;

    /**
     * Snapshot the internal state so it can be restored with {@link setState}
     * (e2e captures before an action, replays after).
     * @returns A copy of the generator's state words — mutating it is safe.
     */
    getState(): number[];

    /**
     * Restore state previously produced by {@link getState}. Unlike
     * {@link seed}, this sets the exact words with no re-mixing.
     * @param state - The four state words to restore.
     * @throws {RangeError} If `state` does not hold four words.
     */
    setState(state: number[]): void;
}

/**
 * Shared base deriving the whole {@link Rng} surface from a single stateful
 * primitive, `nextUint32`. Subclasses implement `nextUint32` (the raw 32-bit
 * generator) plus `seed`/`getState`/`setState`; `float`, `uint32`, `int`, and
 * `die` are unbiased by construction here.
 */
export abstract class RngBase implements Rng {
    /**
     * The raw 32-bit generator step — the one stateful primitive each algorithm
     * implements. Advances this instance's state and returns the next word as an
     * unsigned 32-bit integer.
     * @returns The next raw output, `0 <= n < 2^32`.
     */
    protected abstract nextUint32(): number;

    /** @inheritdoc */
    abstract seed(seed: string | number | number[]): void;

    /** @inheritdoc */
    abstract getState(): number[];

    /** @inheritdoc */
    abstract setState(state: number[]): void;

    /** @inheritdoc */
    float(): number {
        // Multiply by 2^-32 for a uniform [0, 1) at 32-bit resolution.
        return this.nextUint32() * 2.3283064365386963e-10;
    }

    /** @inheritdoc */
    uint32(bound: number): number {
        const range = bound >>> 0;
        if (range === 0) {
            throw new RangeError(
                `uint32(bound) requires bound >= 1, got ${bound}`,
            );
        }
        // Unbiased via rejection sampling: reject the top `2^32 mod range` raw
        // outputs so the remaining values divide evenly across `[0, range)`.
        const threshold = (0x1_0000_0000 - range) % range; // == 2^32 mod range
        let r = this.nextUint32();
        while (r < threshold) {
            r = this.nextUint32();
        }
        return r % range;
    }

    /** @inheritdoc */
    int(min: number, max: number): number {
        if (max < min) {
            throw new RangeError(
                `int(min, max) requires max >= min, got [${min}, ${max}]`,
            );
        }
        return min + this.uint32(max - min + 1);
    }

    /** @inheritdoc */
    die(sides: number): number {
        if (sides < 1) {
            throw new RangeError(
                `die(sides) requires sides >= 1, got ${sides}`,
            );
        }
        return this.uint32(sides) + 1;
    }
}

/**
 * Non-zero replacement words used whenever a seed or restored state would be
 * all-zero — a fixed point that sfc32 and xoshiro would otherwise never leave.
 * Digits of the golden ratio / π (well-known nothing-up-my-sleeve constants).
 */
const NON_ZERO_STATE: readonly [number, number, number, number] = [
    0x9e3779b9, 0x243f6a88, 0xb7e15162, 0xdeadbeef,
];

/**
 * Guard against an all-zero state: sfc32 and xoshiro128 both treat the zero
 * vector as a fixed point (they would emit only zeros forever). Returns a
 * non-zero substitute if every word is zero, otherwise the words unchanged.
 * @param words - The four candidate state words.
 * @returns A guaranteed non-zero four-word state.
 */
export function guardZeroState(
    words: [number, number, number, number],
): [number, number, number, number] {
    if ((words[0] | words[1] | words[2] | words[3]) === 0) {
        return [...NON_ZERO_STATE];
    }
    return words;
}

/**
 * Hash a string into four well-mixed 32-bit words (the `cyrb128` reference
 * algorithm). Used to turn a human-readable seed (e.g. a test name) into
 * generator state.
 * @param str - The seed string.
 * @returns Four unsigned 32-bit state words.
 */
export function cyrb128(str: string): [number, number, number, number] {
    let h1 = 1779033703;
    let h2 = 3144134277;
    let h3 = 1013904242;
    let h4 = 2773480762;
    for (let i = 0; i < str.length; i++) {
        const k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= h2 ^ h3 ^ h4;
    h2 ^= h1;
    h3 ^= h1;
    h4 ^= h1;
    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/**
 * Normalize any accepted seed form into four unsigned 32-bit state words,
 * guaranteed non-zero. Strings and single numbers hash through {@link cyrb128};
 * a four-element array is taken as the words directly (for golden-value tests);
 * any other array length is joined and hashed.
 * @param seed - A string, a single number, or state words.
 * @returns Four non-zero state words.
 */
export function normalizeSeed(
    seed: string | number | number[],
): [number, number, number, number] {
    let words: [number, number, number, number];
    if (typeof seed === "string") {
        words = cyrb128(seed);
    } else if (typeof seed === "number") {
        words = cyrb128(String(seed));
    } else if (seed.length === 4) {
        words = [seed[0] >>> 0, seed[1] >>> 0, seed[2] >>> 0, seed[3] >>> 0];
    } else {
        words = cyrb128(seed.join(","));
    }
    return guardZeroState(words);
}

/**
 * Produce four 32-bit entropy words for an unseeded generator. Prefers
 * `crypto.getRandomValues`; falls back to `Date.now()` mixed with `Math.random`
 * when Web Crypto is unavailable.
 *
 * @remarks The fallback is best-effort, non-reproducible entropy — it is never a
 * play-path *seed* (production seeds the {@link sohl.random} singleton from this
 * once, and never accepts a caller-supplied fixed seed through a play path).
 * @returns Four non-zero entropy words.
 */
export function entropySeed(): [number, number, number, number] {
    // Local buffer — allocated per call, never shared (reentrancy).
    const buf = new Uint32Array(4);
    const c = (globalThis as { crypto?: Crypto }).crypto;
    if (c && typeof c.getRandomValues === "function") {
        c.getRandomValues(buf);
    } else {
        const t = Date.now();
        for (let i = 0; i < 4; i++) {
            buf[i] =
                (Math.imul(t ^ (i + 1), 2654435761) ^
                    Math.floor(Math.random() * 0x1_0000_0000)) >>>
                0;
        }
    }
    return guardZeroState([buf[0], buf[1], buf[2], buf[3]]);
}
