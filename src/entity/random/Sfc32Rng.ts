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
 * The **default** SoHL generator: `sfc32` (Small Fast Counter), 128-bit state
 * across four 32-bit words. Small, fast, and statistically strong far beyond
 * anything a tabletop system needs (passes PractRand to deep sizes).
 *
 * All state is held in the four instance fields — no static or shared state, so
 * instances are fully independent and reentrant (see {@link sohl.entity.random.Rng}).
 *
 * @remarks `mulberry32` is an acceptable single-word fallback if the absolute
 * minimum is ever wanted; it is not needed here. {@link sohl.entity.random.Xoshiro128Rng}
 * is the interchangeable alternative behind the same interface.
 */
export class Sfc32Rng extends RngBase {
    /** State word `a`. */
    private a = 0;
    /** State word `b`. */
    private b = 0;
    /** State word `c`. */
    private c = 0;
    /** Counter word `d`. */
    private d = 0;

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
        this.a = a >>> 0;
        this.b = b >>> 0;
        this.c = c >>> 0;
        this.d = d >>> 0;
        // Discard a few outputs so low-entropy seeds diffuse before first use.
        for (let i = 0; i < 15; i++) {
            this.nextUint32();
        }
    }

    /** @inheritdoc */
    getState(): number[] {
        return [this.a >>> 0, this.b >>> 0, this.c >>> 0, this.d >>> 0];
    }

    /** @inheritdoc */
    setState(state: number[]): void {
        if (state.length !== 4) {
            throw new RangeError(
                `Sfc32Rng.setState requires 4 words, got ${state.length}`,
            );
        }
        const [a, b, c, d] = guardZeroState([
            state[0] >>> 0,
            state[1] >>> 0,
            state[2] >>> 0,
            state[3] >>> 0,
        ]);
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    /** @inheritdoc */
    protected nextUint32(): number {
        // sfc32 (Small Fast Counter). All arithmetic is 32-bit via `| 0`.
        const t = (((this.a + this.b) | 0) + this.d) | 0;
        this.d = (this.d + 1) | 0;
        this.a = this.b ^ (this.b >>> 9);
        this.b = (this.c + (this.c << 3)) | 0;
        this.c = (this.c << 21) | (this.c >>> 11);
        this.c = (this.c + t) | 0;
        return t >>> 0;
    }
}
