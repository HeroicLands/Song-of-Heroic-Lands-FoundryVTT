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
import {
    ARCHETYPE_TIER,
    buildArchetypeOptions,
    resolveArchetypes,
    stripDocArchetypeFlag,
    type ArchetypeCandidate,
} from "@src/entity/archetype/archetype";

/**
 * Build an archetype candidate with sensible defaults so a test only spells out
 * the axis it exercises.
 */
function cand(over: Partial<ArchetypeCandidate> = {}): ArchetypeCandidate {
    return {
        uuid: "Compendium.sohl.actors.aaaa",
        name: "Human",
        shortcode: "human",
        type: "being",
        subType: "",
        priority: 0,
        tier: ARCHETYPE_TIER.SYSTEM,
        ...over,
    };
}

describe("resolveArchetypes — filter", () => {
    it("keeps only candidates matching the (type, subType) selection", () => {
        const list = [
            cand({ uuid: "a", type: "being", subType: "", shortcode: "a" }),
            cand({ uuid: "b", type: "being", subType: "", shortcode: "b" }),
            cand({ uuid: "c", type: "entity", subType: "", shortcode: "c" }),
        ];
        const out = resolveArchetypes(list, "being", "");
        expect(out.map((w) => w.uuid).sort()).toEqual(["a", "b"]);
    });

    it("matches subType exactly (treats missing subType as blank)", () => {
        const list = [
            cand({ uuid: "a", type: "item", subType: "melee", shortcode: "a" }),
            cand({ uuid: "b", type: "item", subType: "", shortcode: "b" }),
            cand({
                uuid: "c",
                type: "item",
                subType: undefined,
                shortcode: "c",
            }),
        ];
        expect(
            resolveArchetypes(list, "item", "melee").map((w) => w.uuid),
        ).toEqual(["a"]);
        // Blank selection matches both the explicit "" and the missing subType.
        expect(
            resolveArchetypes(list, "item", "")
                .map((w) => w.uuid)
                .sort(),
        ).toEqual(["b", "c"]);
    });
});

describe("resolveArchetypes — dedup by shortcode", () => {
    it("collapses same-shortcode candidates to one winner", () => {
        const list = [
            cand({ uuid: "x", shortcode: "john", name: "John" }),
            cand({ uuid: "y", shortcode: "john", name: "Juan" }),
        ];
        const out = resolveArchetypes(list, "being", "");
        expect(out).toHaveLength(1);
        expect(out[0].shortcode).toBe("john");
    });

    it("does not collapse blank-shortcode candidates together", () => {
        const list = [
            cand({ uuid: "x", shortcode: "" }),
            cand({ uuid: "y", shortcode: "" }),
        ];
        expect(resolveArchetypes(list, "being", "")).toHaveLength(2);
    });
});

describe("resolveArchetypes — winner selection (priority, tier, uuid)", () => {
    it("higher priority wins regardless of tier", () => {
        const sohl = cand({
            uuid: "sohl",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.SYSTEM,
        });
        const mod = cand({
            uuid: "mod",
            shortcode: "human",
            priority: 5,
            tier: ARCHETYPE_TIER.MODULE,
        });
        expect(resolveArchetypes([sohl, mod], "being", "")[0].uuid).toBe("mod");
    });

    it("at equal priority, lower tier (world < system < module) wins", () => {
        const world = cand({
            uuid: "world",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.WORLD,
        });
        const sohl = cand({
            uuid: "sohl",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.SYSTEM,
        });
        const mod = cand({
            uuid: "mod",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.MODULE,
        });
        expect(resolveArchetypes([mod, sohl, world], "being", "")[0].uuid).toBe(
            "world",
        );
    });

    it("a module at priority 0 does NOT shadow a system archetype", () => {
        const sohl = cand({
            uuid: "sohl",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.SYSTEM,
        });
        const mod = cand({
            uuid: "mod",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.MODULE,
        });
        expect(resolveArchetypes([mod, sohl], "being", "")[0].uuid).toBe(
            "sohl",
        );
    });

    it("a module needs priority > 0 to override a system archetype", () => {
        const sohl = cand({
            uuid: "sohl",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.SYSTEM,
        });
        const mod = cand({
            uuid: "mod",
            shortcode: "human",
            priority: 1,
            tier: ARCHETYPE_TIER.MODULE,
        });
        expect(resolveArchetypes([sohl, mod], "being", "")[0].uuid).toBe("mod");
    });

    it("equal priority and tier resolves by stable uuid ascending", () => {
        const a = cand({
            uuid: "aaa",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.MODULE,
        });
        const b = cand({
            uuid: "bbb",
            shortcode: "human",
            priority: 0,
            tier: ARCHETYPE_TIER.MODULE,
        });
        expect(resolveArchetypes([b, a], "being", "")[0].uuid).toBe("aaa");
    });
});

describe("resolveArchetypes — ordering of the returned winners", () => {
    it("sorts winners by the composite (priority desc, tier asc, uuid asc)", () => {
        const hi = cand({ uuid: "hi", shortcode: "hi", priority: 9 });
        const world = cand({
            uuid: "w",
            shortcode: "w",
            priority: 0,
            tier: ARCHETYPE_TIER.WORLD,
        });
        const sys = cand({
            uuid: "s",
            shortcode: "s",
            priority: 0,
            tier: ARCHETYPE_TIER.SYSTEM,
        });
        const out = resolveArchetypes([sys, world, hi], "being", "");
        expect(out.map((w) => w.uuid)).toEqual(["hi", "w", "s"]);
    });
});

describe("buildArchetypeOptions", () => {
    it("emits UUID-valued options labelled with name and shortcode, plus (none)", () => {
        const winners = [
            cand({ uuid: "u1", name: "Human", shortcode: "human" }),
            cand({ uuid: "u2", name: "Dwarf", shortcode: "dwarf" }),
        ];
        const { options } = buildArchetypeOptions(winners, "(none)");
        expect(options).toEqual([
            { value: "u1", label: "Human (human)", shortcode: "human" },
            { value: "u2", label: "Dwarf (dwarf)", shortcode: "dwarf" },
            { value: "", label: "(none)", shortcode: "" },
        ]);
    });

    it("defaults to the first (top-priority) winner when one exists", () => {
        const winners = [cand({ uuid: "u1" }), cand({ uuid: "u2" })];
        expect(buildArchetypeOptions(winners, "(none)").defaultValue).toBe(
            "u1",
        );
    });

    it("defaults to (none) when no archetype exists", () => {
        expect(buildArchetypeOptions([], "(none)").defaultValue).toBe("");
    });
});

describe("stripDocArchetypeFlag", () => {
    it("removes only flags.sohl.docArchetype, preserving other sohl flags", () => {
        const data = {
            name: "Seed",
            flags: { sohl: { docArchetype: 3, keepMe: "yes" }, core: { x: 1 } },
        };
        stripDocArchetypeFlag(data);
        expect((data.flags.sohl as any).docArchetype).toBeUndefined();
        expect(data.flags.sohl.keepMe).toBe("yes");
        expect(data.flags.core.x).toBe(1);
    });

    it("is a no-op when the flag is absent", () => {
        const data = { name: "Seed", flags: { sohl: { other: 1 } } };
        expect(() => stripDocArchetypeFlag(data)).not.toThrow();
        expect(data.flags.sohl.other).toBe(1);
    });

    it("tolerates missing flags entirely", () => {
        const data = { name: "Seed" };
        expect(() => stripDocArchetypeFlag(data)).not.toThrow();
    });
});
