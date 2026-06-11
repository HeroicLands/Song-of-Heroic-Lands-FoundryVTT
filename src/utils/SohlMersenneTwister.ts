/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * A seedable Mersenne Twister (MT19937) pseudo-random number generator.
 *
 * Provides deterministic, reproducible sequences from a 32-bit integer seed —
 * useful for tests and seeded world generation where `Math.random` would
 * be non-reproducible. Instances may be created directly, or a process-wide
 * singleton can be used via the static helpers ({@link getInstance},
 * {@link setSeed}, {@link useMock}, {@link reset} and the static
 * {@link SohlMersenneTwister.int int}/{@link SohlMersenneTwister.random random}/
 * {@link SohlMersenneTwister.normal normal} shortcuts).
 */
export class SohlMersenneTwister {
    /** Degree of recurrence (size of the state vector). @internal */
    private static readonly N = 624;
    /** Middle word offset used by the twist. @internal */
    private static readonly M = 397;
    /** Twist matrix constant `a`. @internal */
    private static readonly MATRIX_A = 0x9908b0df;
    /** Mask selecting the most-significant bit (w-r bits). @internal */
    private static readonly UPPER_MASK = 0x80000000;
    /** Mask selecting the least-significant 31 bits. @internal */
    private static readonly LOWER_MASK = 0x7fffffff;
    /** 2^32, used to scale 32-bit integers into floating-point ranges. @internal */
    private static readonly MAX_INT = 4294967296.0;

    /** The generator's internal state vector. @internal */
    private mt: number[] = new Array(SohlMersenneTwister.N);
    /** Index of the next word to consume from {@link mt}. @internal */
    private mti = SohlMersenneTwister.N + 1;
    /** The most recently applied seed. @internal */
    private _seed: number;

    /**
     * Create a generator initialized from a seed.
     * @param seed The 32-bit integer seed; defaults to the current timestamp.
     */
    constructor(seed: number = Date.now()) {
        this._seed = this.seed(seed);
    }

    /**
     * Re-initialize the generator's state from a single integer seed.
     * @param seed The 32-bit integer seed.
     * @returns The seed that was applied.
     */
    seed(seed: number): number {
        this.mt[0] = seed >>> 0;
        for (this.mti = 1; this.mti < SohlMersenneTwister.N; this.mti++) {
            const prev = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] =
                ((((prev & 0xffff0000) >>> 16) * 1812433253) << 16) +
                (prev & 0x0000ffff) * 1812433253 +
                this.mti;
            this.mt[this.mti] >>>= 0;
        }
        return (this._seed = seed);
    }

    /**
     * Initialize the generator's state from an array of seed values, giving a
     * larger seed space than a single 32-bit integer.
     * @param vector The array of seed values to mix into the state.
     */
    seedArray(vector: number[]): void {
        let i = 1,
            j = 0,
            k = Math.max(SohlMersenneTwister.N, vector.length);
        this.seed(19650218);
        while (k--) {
            const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] =
                (this.mt[i] ^
                    ((((s >>> 16) * 1664525) << 16) + (s & 0xffff) * 1664525)) +
                vector[j] +
                j;
            this.mt[i] >>>= 0;
            i = (i + 1) % SohlMersenneTwister.N;
            j = (j + 1) % vector.length;
        }
        for (k = SohlMersenneTwister.N - 1; k > 0; k--) {
            const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] =
                (this.mt[i] ^
                    ((((s >>> 16) * 1566083941) << 16) +
                        (s & 0xffff) * 1566083941)) -
                i;
            this.mt[i] >>>= 0;
            i = (i + 1) % SohlMersenneTwister.N;
        }
        this.mt[0] = 0x80000000;
    }

    /**
     * Generate the next pseudo-random 32-bit unsigned integer.
     * @returns An integer in the range `[0, 2^32 - 1]`.
     */
    int(): number {
        if (this.mti >= SohlMersenneTwister.N) this.twist();

        let y = this.mt[this.mti++];
        y ^= y >>> 11;
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= y >>> 18;
        return y >>> 0;
    }

    /** Regenerate the full state vector (the MT19937 "twist" step). @internal */
    private twist(): void {
        const { N, M, UPPER_MASK, LOWER_MASK, MATRIX_A } = SohlMersenneTwister;
        const mag01 = [0, MATRIX_A];
        let y: number;
        let kk = 0;

        for (; kk < N - M; kk++) {
            y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
            this.mt[kk] = this.mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1];
        }
        for (; kk < N - 1; kk++) {
            y = (this.mt[kk] & UPPER_MASK) | (this.mt[kk + 1] & LOWER_MASK);
            this.mt[kk] = this.mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1];
        }
        y = (this.mt[N - 1] & UPPER_MASK) | (this.mt[0] & LOWER_MASK);
        this.mt[N - 1] = this.mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1];
        this.mti = 0;
    }

    /**
     * Generate the next pseudo-random 31-bit unsigned integer.
     * @returns An integer in the range `[0, 2^31 - 1]`.
     */
    int31(): number {
        return this.int() >>> 1;
    }

    /**
     * Generate a float in the closed interval `[0, 1]` (both endpoints
     * inclusive), with 32-bit resolution.
     * @returns A number in `[0, 1]`.
     */
    real(): number {
        return this.int() * (1.0 / (SohlMersenneTwister.MAX_INT - 1));
    }

    /**
     * Generate a float in the open interval `(0, 1)` (both endpoints excluded),
     * with 32-bit resolution.
     * @returns A number in `(0, 1)`.
     */
    realx(): number {
        return (this.int() + 0.5) * (1.0 / SohlMersenneTwister.MAX_INT);
    }

    /**
     * Generate a float in the half-open interval `[0, 1)`, with 32-bit
     * resolution.
     * @returns A number in `[0, 1)`.
     */
    rnd(): number {
        return this.int() * (1.0 / SohlMersenneTwister.MAX_INT);
    }

    /**
     * Drop-in replacement for `Math.random`: a float in `[0, 1)`.
     * @returns A number in `[0, 1)`. Alias of {@link rnd}.
     */
    random(): number {
        return this.rnd();
    }

    /**
     * Generate a float in `[0, 1)` with full 53-bit double precision, by
     * combining two 32-bit draws.
     * @returns A high-resolution number in `[0, 1)`.
     */
    rndHiRes(): number {
        return (
            ((this.int() >>> 5) * 67108864 + (this.int() >>> 6)) /
            9007199254740992
        );
    }

    /**
     * Generate a normally-distributed value using the Box–Muller transform.
     * @param mu The mean of the distribution.
     * @param sigma The standard deviation of the distribution.
     * @returns A sample drawn from `N(mu, sigma^2)`.
     */
    normal(mu: number, sigma: number): number {
        let u = 0,
            v = 0;
        while (u === 0) u = this.random();
        while (v === 0) v = this.random();
        return (
            Math.sqrt(-2.0 * Math.log(u)) *
                Math.cos(2.0 * Math.PI * v) *
                sigma +
            mu
        );
    }

    /** The process-wide singleton instance, if created. @internal */
    private static instance: SohlMersenneTwister | null = null;

    /**
     * Return the shared singleton generator, creating one seeded from the
     * current timestamp on first access.
     * @returns The singleton {@link SohlMersenneTwister}.
     */
    static getInstance(): SohlMersenneTwister {
        if (!this.instance) this.instance = new SohlMersenneTwister(Date.now());
        return this.instance;
    }

    /**
     * Replace the singleton with a fresh generator seeded from `seed`,
     * yielding a reproducible global sequence.
     * @param seed The 32-bit integer seed.
     */
    static setSeed(seed: number): void {
        this.instance = new SohlMersenneTwister(seed);
    }

    /**
     * Replace the singleton with a supplied (typically mock) generator, for
     * deterministic testing.
     * @param mock The generator to install as the singleton.
     */
    static useMock(mock: SohlMersenneTwister): void {
        this.instance = mock;
    }

    /** Clear the singleton so the next access creates a fresh, timestamp-seeded instance. */
    static reset(): void {
        this.instance = null;
    }

    /**
     * Convenience accessor for {@link int} on the singleton instance.
     * @returns An integer in the range `[0, 2^32 - 1]`.
     */
    static int(): number {
        return this.getInstance().int();
    }

    /**
     * Convenience accessor for {@link random} on the singleton instance.
     * @returns A number in `[0, 1)`.
     */
    static random(): number {
        return this.getInstance().random();
    }

    /**
     * Convenience accessor for {@link normal} on the singleton instance.
     * @param mu The mean of the distribution.
     * @param sigma The standard deviation of the distribution.
     * @returns A sample drawn from `N(mu, sigma^2)`.
     */
    static normal(mu: number, sigma: number): number {
        return this.getInstance().normal(mu, sigma);
    }
}
