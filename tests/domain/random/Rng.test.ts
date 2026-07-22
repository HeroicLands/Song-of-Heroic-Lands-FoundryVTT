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

import { describe, it, expect } from "vitest";
import type { Rng } from "@src/entity/random/Rng";
import { Sfc32Rng } from "@src/entity/random/Sfc32Rng";
import { Xoshiro128Rng } from "@src/entity/random/Xoshiro128Rng";
import { createRng } from "@src/entity/random/createRng";

/**
 * The two generators are exercised against the same behavioural contract.
 * `make` seeds each from its own test name so every case gets an independent,
 * reproducible stream (no `sohl.random`, no shared state — the injectable path).
 */
const GENERATORS: Array<[string, (seed: string | number | number[]) => Rng]> = [
    ["Sfc32Rng", (seed) => new Sfc32Rng(seed)],
    ["Xoshiro128Rng", (seed) => new Xoshiro128Rng(seed)],
];

describe.each(GENERATORS)("%s — Rng contract", (_name, make) => {
    it("is reproducible: same seed ⇒ identical sequence", () => {
        const a = make("repro");
        const b = make("repro");
        const seqA = Array.from({ length: 64 }, () => a.uint32(0x7fffffff));
        const seqB = Array.from({ length: 64 }, () => b.uint32(0x7fffffff));
        expect(seqA).toEqual(seqB);
    });

    it("is independent: different seeds ⇒ divergent sequences", () => {
        const a = make("seed-A");
        const b = make("seed-B");
        const seqA = Array.from({ length: 64 }, () => a.uint32(0x7fffffff));
        const seqB = Array.from({ length: 64 }, () => b.uint32(0x7fffffff));
        expect(seqA).not.toEqual(seqB);
    });

    it("float() stays in [0, 1)", () => {
        const rng = make("float");
        for (let i = 0; i < 5000; i++) {
            const f = rng.float();
            expect(f).toBeGreaterThanOrEqual(0);
            expect(f).toBeLessThan(1);
        }
    });

    it("die(sides) covers exactly 1..sides — never 0, never sides+1", () => {
        const rng = make("die");
        const sides = 6;
        const seen = new Set<number>();
        for (let i = 0; i < 20000; i++) {
            const r = rng.die(sides);
            expect(r).toBeGreaterThanOrEqual(1);
            expect(r).toBeLessThanOrEqual(sides);
            expect(Number.isInteger(r)).toBe(true);
            seen.add(r);
        }
        // every face appears
        for (let f = 1; f <= sides; f++) expect(seen.has(f)).toBe(true);
    });

    it("int(min, max) is inclusive on both ends and stays in range", () => {
        const rng = make("int");
        const min = -3;
        const max = 4;
        const seen = new Set<number>();
        for (let i = 0; i < 20000; i++) {
            const r = rng.int(min, max);
            expect(r).toBeGreaterThanOrEqual(min);
            expect(r).toBeLessThanOrEqual(max);
            seen.add(r);
        }
        expect(seen.has(min)).toBe(true);
        expect(seen.has(max)).toBe(true);
    });

    it("int(n, n) collapses to n", () => {
        const rng = make("degenerate");
        for (let i = 0; i < 10; i++) expect(rng.int(7, 7)).toBe(7);
    });

    it("d100 is roughly uniform (bias sanity, chi-square tolerance)", () => {
        const rng = make("d100-bias");
        const sides = 100;
        const n = 200000;
        const counts = new Array(sides + 1).fill(0);
        for (let i = 0; i < n; i++) counts[rng.die(sides)]++;
        const expected = n / sides;
        let chi = 0;
        for (let f = 1; f <= sides; f++) {
            const d = counts[f] - expected;
            chi += (d * d) / expected;
        }
        // 99 d.o.f.: the 99.9th percentile of chi-square is ~148; a healthy
        // generator sits far below. Generous bound guards against gross bias.
        expect(chi).toBeLessThan(160);
    });

    it("snapshots and restores via getState/setState (replay)", () => {
        const rng = make("state");
        // advance a little so state is non-initial
        for (let i = 0; i < 5; i++) rng.uint32(1000);
        const snap = rng.getState();
        const before = Array.from({ length: 16 }, () => rng.uint32(1 << 30));
        rng.setState(snap);
        const after = Array.from({ length: 16 }, () => rng.uint32(1 << 30));
        expect(after).toEqual(before);
    });

    it("getState returns a copy — mutating it does not corrupt the stream", () => {
        const rng = make("state-copy");
        const snap = rng.getState();
        snap[0] = (snap[0] ^ 0xdeadbeef) >>> 0;
        // stream continues from real internal state, unaffected by snap mutation
        const other = make("state-copy");
        expect(rng.uint32(1 << 30)).toBe(other.uint32(1 << 30));
    });

    it("seed() fully resets the stream (reset, not perturb)", () => {
        const rng = make("initial-seed");
        rng.seed("reset-target");
        const fresh = make("reset-target");
        const seqA = Array.from({ length: 32 }, () => rng.uint32(1 << 30));
        const seqB = Array.from({ length: 32 }, () => fresh.uint32(1 << 30));
        expect(seqA).toEqual(seqB);
    });

    it("accepts a numeric seed and a four-word array seed", () => {
        const byNum = make(12345);
        const byNum2 = make(12345);
        expect(byNum.uint32(1 << 30)).toBe(byNum2.uint32(1 << 30));

        const byArr = make([1, 2, 3, 4]);
        const byArr2 = make([1, 2, 3, 4]);
        expect(byArr.uint32(1 << 30)).toBe(byArr2.uint32(1 << 30));
    });

    it("never starts fully zeroed even when seeded with all-zero words", () => {
        const rng = make([0, 0, 0, 0]);
        // A zeroed sfc32/xoshiro state is a fixed point that emits only zeros.
        const seq = Array.from({ length: 32 }, () => rng.uint32(1 << 30));
        expect(seq.some((v) => v !== 0)).toBe(true);
    });

    it("is reentrant: interleaving two instances never crosses streams", () => {
        const solo = make("interleave");
        const soloSeq = Array.from({ length: 32 }, () => solo.uint32(1 << 30));

        const a = make("interleave");
        const b = make("interleave-other");
        const interleaved: number[] = [];
        for (let i = 0; i < 32; i++) {
            interleaved.push(a.uint32(1 << 30));
            b.uint32(1 << 30); // advance the other stream between every draw
        }
        // `a`'s sequence is identical whether or not `b` is drawn between calls.
        expect(interleaved).toEqual(soloSeq);
    });
});

/**
 * Golden-value lock: the algorithms' output for a fixed seed is a **frozen
 * contract** (issue #599). If either array changes, an algorithm's stream
 * changed — that breaks reproducibility for every world and must not happen.
 */
describe("frozen golden streams (determinism contract)", () => {
    const BOUND = 4294967295; // 2^32 - 1

    it("Sfc32Rng('golden-seed') emits the locked sequence", () => {
        const rng = new Sfc32Rng("golden-seed");
        const seq = Array.from({ length: 8 }, () => rng.uint32(BOUND));
        expect(seq).toEqual([
            3577210014, 877638061, 1077770327, 1103203901, 103271497,
            2869646797, 2343387005, 2506069163,
        ]);
    });

    it("Xoshiro128Rng('golden-seed') emits the locked sequence", () => {
        const rng = new Xoshiro128Rng("golden-seed");
        const seq = Array.from({ length: 8 }, () => rng.uint32(BOUND));
        expect(seq).toEqual([
            3537367749, 1403132538, 3172035381, 2696889487, 496461123,
            3072828755, 208891655, 843523731,
        ]);
    });
});

describe("createRng factory", () => {
    it("returns an sfc32 generator by default", () => {
        const rng = createRng("factory");
        expect(rng).toBeInstanceOf(Sfc32Rng);
    });

    it("seeded factory instances are reproducible", () => {
        const a = createRng("same");
        const b = createRng("same");
        const seqA = Array.from({ length: 16 }, () => a.uint32(1 << 30));
        const seqB = Array.from({ length: 16 }, () => b.uint32(1 << 30));
        expect(seqA).toEqual(seqB);
    });

    it("unseeded factory instances draw from entropy (diverge)", () => {
        const a = createRng();
        const b = createRng();
        const seqA = Array.from({ length: 16 }, () => a.uint32(1 << 30));
        const seqB = Array.from({ length: 16 }, () => b.uint32(1 << 30));
        expect(seqA).not.toEqual(seqB);
    });
});
