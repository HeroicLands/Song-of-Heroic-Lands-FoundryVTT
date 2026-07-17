/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { deriveNext, elapsedCheckpoints } from "@src/entity/event/scheduling";

const DAY = 86400;

describe("deriveNext (#481)", () => {
    it("returns the anchor plus the interval", () => {
        expect(deriveNext(1000, 5 * DAY)).toBe(1000 + 5 * DAY);
    });
    it("does not read the clock — pure function of its inputs", () => {
        expect(deriveNext(0, DAY)).toBe(DAY);
        expect(deriveNext(-DAY, DAY)).toBe(0);
    });
});

describe("elapsedCheckpoints (#481)", () => {
    it("lists every occurrence in (lastAnchor, worldTime] in order", () => {
        // last check at 5d, jump to 60d, every 5d -> 10d..60d (11 checkpoints)
        const cps = elapsedCheckpoints(5 * DAY, 60 * DAY, 5 * DAY);
        expect(cps).toEqual(
            Array.from({ length: 11 }, (_, i) => (i + 2) * 5 * DAY),
        );
    });

    it("includes a checkpoint exactly at worldTime (half-open lower, closed upper)", () => {
        expect(elapsedCheckpoints(0, 10, 5)).toEqual([5, 10]);
    });

    it("is empty when nothing is due yet", () => {
        expect(elapsedCheckpoints(100, 100, 5)).toEqual([]);
        expect(elapsedCheckpoints(100, 103, 5)).toEqual([]);
    });

    it("guards against a non-advancing loop on non-positive interval", () => {
        expect(elapsedCheckpoints(0, 1_000_000, 0)).toEqual([]);
        expect(elapsedCheckpoints(0, 1_000_000, -5)).toEqual([]);
    });

    it("the catch-up loop and deriveNext compose: next occurrence sits beyond worldTime", () => {
        const interval = 5 * DAY;
        const worldTime = 60 * DAY;
        const cps = elapsedCheckpoints(5 * DAY, worldTime, interval);
        const newAnchor = cps.length ? cps[cps.length - 1] : 5 * DAY;
        expect(newAnchor).toBe(60 * DAY);
        expect(deriveNext(newAnchor, interval)).toBeGreaterThan(worldTime);
    });
});
