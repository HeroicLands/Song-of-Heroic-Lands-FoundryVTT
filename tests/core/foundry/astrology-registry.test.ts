/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    astrologyRegistry,
    setAstrologyWorldProvider,
} from "@src/core/foundry/astrology-registry";
import { builtinTraditionsData } from "@tests/mocks/astrology";

/** A minimal valid self-describing tradition JSON (as a module would supply). */
function traditionJson(key: string, signShortcode = "aa") {
    return {
        shortcode: key,
        label: `${key} label`,
        signs: [
            {
                shortcode: signShortcode,
                start: { month: 1, day: 1 },
                end: { month: 6, day: 30 },
                cuspDays: 0,
                skillModifiers: { "subtype:combat": 5 },
            },
        ],
    };
}

describe("astrologyRegistry", () => {
    beforeEach(() => {
        astrologyRegistry.reset();
        setAstrologyWorldProvider(() => ({})); // no world layer by default
    });
    afterEach(() => {
        astrologyRegistry.reset();
        setAstrologyWorldProvider(() => ({}));
        vi.restoreAllMocks();
    });

    it("registers a tradition tagged with its source (default module)", () => {
        const result = astrologyRegistry.register(traditionJson("mod"));
        expect(result.installed).toEqual(["mod"]);
        expect(result.skipped).toEqual([]);
        expect(astrologyRegistry.registered()["mod"].source).toBe("module");
    });

    it("seeds the built-in default as source builtin", () => {
        astrologyRegistry.register(builtinTraditionsData(), "builtin");
        const reg = astrologyRegistry.registered();
        expect(reg["astrokyklos"]).toBeDefined();
        expect(reg["astrokyklos"].source).toBe("builtin");
        expect(reg["astrokyklos"].signs).toHaveLength(12);
    });

    it("a later registration of the same key replaces the earlier one", () => {
        astrologyRegistry.register(traditionJson("dup", "aa"), "builtin");
        astrologyRegistry.register(traditionJson("dup", "bb"), "module");
        const t = astrologyRegistry.registered()["dup"];
        expect(t.source).toBe("module");
        expect(t.signs[0].shortcode).toBe("bb");
    });

    it("unregister removes a registered tradition", () => {
        astrologyRegistry.register(traditionJson("gone"));
        expect(astrologyRegistry.unregister("gone")).toBe(true);
        expect(astrologyRegistry.registered()["gone"]).toBeUndefined();
        expect(astrologyRegistry.unregister("nope")).toBe(false);
    });

    it("all() layers the world provider over the registered traditions (world wins)", () => {
        astrologyRegistry.register(traditionJson("shared", "aa"), "builtin");
        astrologyRegistry.register(traditionJson("modonly"), "module");
        // Inject the world layer with an override of `shared` (no `game` access).
        setAstrologyWorldProvider(() => ({
            shared: {
                key: "shared",
                label: "World Shared",
                source: "world",
                signs: [
                    {
                        shortcode: "zz",
                        label: "Z",
                        start: { month: 1, day: 1 },
                        end: { month: 12, day: 30 },
                        cuspDays: 0,
                        skillModifiers: {},
                    },
                ],
            },
        }));
        const all = astrologyRegistry.all();
        expect(Object.keys(all).sort()).toEqual(["modonly", "shared"]);
        expect(all["shared"].label).toBe("World Shared"); // world overrides builtin
        expect(all["modonly"].source).toBe("module");
        expect(astrologyRegistry.get("shared")?.label).toBe("World Shared");
    });

    it("skips malformed traditions with reasons, keeping valid ones", () => {
        const result = astrologyRegistry.register([
            traditionJson("good"),
            { shortcode: "bad", label: "no signs" },
        ]);
        expect(result.installed).toEqual(["good"]);
        expect(result.skipped.map((s) => s.key)).toContain("bad");
    });
});
