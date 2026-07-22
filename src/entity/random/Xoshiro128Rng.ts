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

import {
    RngBase,
    entropySeed,
    guardZeroState,
    normalizeSeed,
} from "@src/entity/random/Rng";

/**
 * 32-bit left-rotate.
 * @param x - The value to rotate.
 * @param k - The number of bits to rotate left by.
 * @returns The rotated 32-bit word.
 */
function rotl(x: number, k: number): number {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/**
 * `xoshiro128**` — the interchangeable alternative to the default
 * {@link sohl.entity.random.Sfc32Rng}, behind the same {@link sohl.entity.random.Rng}
 * interface. 128-bit state across four 32-bit words; excellent statistical
 * quality with a well-scrambled output stage.
 *
 * All state is per-instance (no static or shared state), so it is reentrant and
 * safe to run interleaved with any number of other generators.
 */
export class Xoshiro128Rng extends RngBase {
    /** State word `s0`. */
    private s0 = 0;
    /** State word `s1`. */
    private s1 = 0;
    /** State word `s2`. */
    private s2 = 0;
    /** State word `s3`. */
    private s3 = 0;

    /**
     * Construct a generator. With no seed it draws entropy from
     * {@link entropySeed}; with a seed it is fully reproducible.
     * @param seed - Optional string / number / four-word seed.
     */
    constructor(seed?: string | number | number[]) {
        super();
        this.seed(seed ?? entropySeed());
    }

    /** @inheritdoc */
    seed(seed: string | number | number[]): void {
        const [a, b, c, d] = normalizeSeed(seed);
        this.s0 = a >>> 0;
        this.s1 = b >>> 0;
        this.s2 = c >>> 0;
        this.s3 = d >>> 0;
        for (let i = 0; i < 15; i++) {
            this.nextUint32();
        }
    }

    /** @inheritdoc */
    getState(): number[] {
        return [this.s0 >>> 0, this.s1 >>> 0, this.s2 >>> 0, this.s3 >>> 0];
    }

    /** @inheritdoc */
    setState(state: number[]): void {
        if (state.length !== 4) {
            throw new RangeError(
                `Xoshiro128Rng.setState requires 4 words, got ${state.length}`,
            );
        }
        const [a, b, c, d] = guardZeroState([
            state[0] >>> 0,
            state[1] >>> 0,
            state[2] >>> 0,
            state[3] >>> 0,
        ]);
        this.s0 = a;
        this.s1 = b;
        this.s2 = c;
        this.s3 = d;
    }

    /** @inheritdoc */
    protected nextUint32(): number {
        // xoshiro128** — the "**" scrambler on s1 gives the output.
        const result = Math.imul(rotl(Math.imul(this.s1, 5) >>> 0, 7), 9) >>> 0;
        const t = (this.s1 << 9) | 0;
        this.s2 ^= this.s0;
        this.s3 ^= this.s1;
        this.s1 ^= this.s2;
        this.s0 ^= this.s3;
        this.s2 ^= t;
        this.s3 = rotl(this.s3, 11);
        return result;
    }
}
