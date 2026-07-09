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

import { describe, it, expect } from "vitest";
import {
    groupBySubType,
    attributeDescriptor,
    buildContainerTree,
    buildStatusPills,
    buildBodyPartLozenges,
    clampHealthPct,
    splitWeaponsByRange,
    selectStrikeModeModifier,
    filterHeldWeapons,
} from "@src/document/actor/logic/being-sheet-view";
import { STATUS_EFFECT, ITEM_KIND, IMPACT_ASPECT } from "@src/utils/constants";
import { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { makeItemLogic } from "@tests/mocks/logicHarness";

describe("being-sheet-view", () => {
    describe("groupBySubType", () => {
        interface Item {
            subType?: string;
            name: string;
        }
        const sub = (i: Item) => i.subType;

        it("groups items by their subtype key", () => {
            const a: Item = { subType: "social", name: "A" };
            const b: Item = { subType: "physical", name: "B" };
            const c: Item = { subType: "social", name: "C" };
            const groups = groupBySubType([a, b, c], sub);
            expect(groups).toEqual({ social: [a, c], physical: [b] });
        });

        it("buckets items with no subtype under 'other'", () => {
            const a: Item = { name: "A" };
            const b: Item = { subType: "", name: "B" };
            const groups = groupBySubType([a, b], sub);
            expect(groups).toEqual({ other: [a, b] });
        });

        it("preserves insertion order within a bucket without a comparator", () => {
            const items: Item[] = [
                { subType: "s", name: "Zed" },
                { subType: "s", name: "Ana" },
            ];
            expect(groupBySubType(items, sub).s).toEqual(items);
        });

        it("sorts within each bucket when a comparator is given", () => {
            const zed: Item = { subType: "s", name: "Zed" };
            const ana: Item = { subType: "s", name: "Ana" };
            const groups = groupBySubType([zed, ana], sub, (x, y) =>
                x.name.localeCompare(y.name),
            );
            expect(groups.s).toEqual([ana, zed]);
        });

        it("returns an empty object for empty input", () => {
            expect(groupBySubType([] as Item[], sub)).toEqual({});
        });
    });

    describe("attributeDescriptor", () => {
        const bands = [
            { label: "Poor", maxValue: 8 },
            { label: "Average", maxValue: 12 },
            { label: "Good", maxValue: 16 },
        ];

        it("returns '' when there are no bands", () => {
            expect(attributeDescriptor(14, [])).toBe("");
        });

        it("picks the first band whose maxValue >= score", () => {
            expect(attributeDescriptor(14, bands)).toBe("Good");
            expect(attributeDescriptor(10, bands)).toBe("Average");
            expect(attributeDescriptor(5, bands)).toBe("Poor");
        });

        it("matches on the band's inclusive maxValue", () => {
            expect(attributeDescriptor(8, bands)).toBe("Poor");
            expect(attributeDescriptor(12, bands)).toBe("Average");
        });

        it("falls back to the highest band when the score exceeds all bands", () => {
            expect(attributeDescriptor(99, bands)).toBe("Good");
        });

        it("sorts bands by maxValue regardless of input order", () => {
            const unordered = [
                { label: "Good", maxValue: 16 },
                { label: "Poor", maxValue: 8 },
                { label: "Average", maxValue: 12 },
            ];
            expect(attributeDescriptor(10, unordered)).toBe("Average");
        });
    });

    describe("buildContainerTree", () => {
        interface Gear {
            id: string;
            containerId?: string | null;
        }
        const id = (i: Gear) => i.id;
        const cid = (i: Gear) => i.containerId;

        it("nests gear under its container and leaves loose gear On Body", () => {
            const pack: Gear = { id: "pack" };
            const sword: Gear = { id: "sword", containerId: "pack" };
            const ring: Gear = { id: "ring", containerId: null };
            const tree = buildContainerTree(
                [pack],
                [pack, sword, ring],
                id,
                cid,
            );
            expect(tree.containers).toEqual([
                { container: pack, items: [sword] },
            ]);
            // pack has no containerId → On Body; ring has none → On Body.
            expect(tree.onBodyItems).toEqual([pack, ring]);
        });

        it("routes gear with an unknown containerId to On Body", () => {
            const sword: Gear = { id: "sword", containerId: "ghost" };
            const tree = buildContainerTree([] as Gear[], [sword], id, cid);
            expect(tree.containers).toEqual([]);
            expect(tree.onBodyItems).toEqual([sword]);
        });

        it("yields an empty contents list for a container with no items", () => {
            const pack: Gear = { id: "pack" };
            const tree = buildContainerTree([pack], [pack], id, cid);
            expect(tree.containers).toEqual([{ container: pack, items: [] }]);
        });

        it("nests a container inside another container", () => {
            const pack: Gear = { id: "pack" };
            const pouch: Gear = { id: "pouch", containerId: "pack" };
            const tree = buildContainerTree(
                [pack, pouch],
                [pack, pouch],
                id,
                cid,
            );
            const packNode = tree.containers.find((n) => n.container === pack)!;
            expect(packNode.items).toEqual([pouch]);
            // pouch is nested, not On Body; pack (no containerId) is On Body.
            expect(tree.onBodyItems).toEqual([pack]);
        });
    });

    describe("buildStatusPills", () => {
        it("returns the seven pills in display order", () => {
            const pills = buildStatusPills(new Set());
            expect(pills.map((p) => p.id)).toEqual([
                STATUS_EFFECT.SLEEP,
                STATUS_EFFECT.PRONE,
                STATUS_EFFECT.STUN,
                STATUS_EFFECT.AURAL_SHOCK,
                STATUS_EFFECT.INCAPACITATED,
                STATUS_EFFECT.UNCONSCIOUS,
                STATUS_EFFECT.DEAD,
            ]);
        });

        it("marks only the active status ids active", () => {
            const pills = buildStatusPills(
                new Set([STATUS_EFFECT.STUN, STATUS_EFFECT.DEAD]),
            );
            const active = pills.filter((p) => p.active).map((p) => p.id);
            expect(active).toEqual([STATUS_EFFECT.STUN, STATUS_EFFECT.DEAD]);
        });

        it("carries abbr and label for each pill", () => {
            const stun = buildStatusPills(new Set()).find(
                (p) => p.id === STATUS_EFFECT.STUN,
            )!;
            expect(stun).toMatchObject({ abbr: "STN", label: "Stun" });
        });
    });

    describe("buildBodyPartLozenges", () => {
        it("maps each body part to its shortcode", () => {
            const bodyStructure = {
                parts: [{ shortcode: "HEAD" }, { shortcode: "TORSO" }],
            };
            expect(buildBodyPartLozenges(bodyStructure)).toEqual([
                { shortcode: "HEAD" },
                { shortcode: "TORSO" },
            ]);
        });

        it("returns an empty array for undefined or empty structure", () => {
            expect(buildBodyPartLozenges(undefined)).toEqual([]);
            expect(buildBodyPartLozenges({})).toEqual([]);
            expect(buildBodyPartLozenges({ parts: [] })).toEqual([]);
        });
    });

    describe("clampHealthPct", () => {
        it("clamps below 0 and above 100", () => {
            expect(clampHealthPct(-25)).toBe(0);
            expect(clampHealthPct(150)).toBe(100);
        });

        it("rounds to the nearest integer", () => {
            expect(clampHealthPct(42.4)).toBe(42);
            expect(clampHealthPct(42.6)).toBe(43);
        });

        it("treats null/undefined as 0", () => {
            expect(clampHealthPct(undefined)).toBe(0);
            expect(clampHealthPct(null)).toBe(0);
        });
    });

    describe("splitWeaponsByRange", () => {
        const modes = (w: {
            strikeModes: { isMelee?: boolean; isMissile?: boolean }[];
        }) => w.strikeModes;

        it("places a melee-only weapon in the melee list", () => {
            const w = { strikeModes: [{ isMelee: true }] };
            const split = splitWeaponsByRange([w], modes);
            expect(split.meleeWeapons).toEqual([
                { weapon: w, strikeModes: w.strikeModes },
            ]);
            expect(split.missileWeapons).toEqual([]);
        });

        it("places a missile-only weapon in the missile list", () => {
            const w = { strikeModes: [{ isMissile: true }] };
            const split = splitWeaponsByRange([w], modes);
            expect(split.missileWeapons).toEqual([
                { weapon: w, strikeModes: w.strikeModes },
            ]);
            expect(split.meleeWeapons).toEqual([]);
        });

        it("places a dual-range weapon in both lists with only matching modes", () => {
            const melee = { isMelee: true };
            const missile = { isMissile: true };
            const w = { strikeModes: [melee, missile] };
            const split = splitWeaponsByRange([w], modes);
            expect(split.meleeWeapons).toEqual([
                { weapon: w, strikeModes: [melee] },
            ]);
            expect(split.missileWeapons).toEqual([
                { weapon: w, strikeModes: [missile] },
            ]);
        });

        it("omits a weapon with neither range band", () => {
            const w = { strikeModes: [{}] };
            const split = splitWeaponsByRange([w], modes);
            expect(split.meleeWeapons).toEqual([]);
            expect(split.missileWeapons).toEqual([]);
        });
    });

    describe("selectStrikeModeModifier (#178)", () => {
        function makeMeleeMode(blockMod = 0, cxMod = 0): MeleeStrikeMode {
            const logic = makeItemLogic(WeaponGearLogic, ITEM_KIND.WEAPONGEAR, {
                quantity: 1,
                weightBase: 2,
                valueBase: 10,
                isCarried: true,
                isEquipped: true,
                qualityBase: 10,
                durabilityBase: 10,
                sharedWithCohortIds: [],
                containerId: null,
                encumbrance: 1,
                heftBase: 5,
                strikeModes: {
                    m1: {
                        type: "melee",
                        name: "Cut",
                        minParts: 1,
                        assocSkillCode: "swd",
                        lengthBase: 3,
                        attack: { disabled: false, spread: 10, modifier: 5 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: IMPACT_ASPECT.EDGED,
                        },
                        traits: {},
                        defense: {
                            block: { modifier: blockMod },
                            counterstrike: { modifier: cxMod },
                        },
                    },
                },
            });
            logic.initialize();
            logic.evaluate();
            return logic.strikeModes[0] as MeleeStrikeMode;
        }

        it("attack → sm.attack", () => {
            const sm = makeMeleeMode(2, 3);
            expect(selectStrikeModeModifier(sm, "attack")).toBe(sm.attack);
        });

        it("block → sm.defense.block (not sm.attack)", () => {
            const sm = makeMeleeMode(2, 3);
            const mod = selectStrikeModeModifier(sm, "block");
            expect(mod).toBe(sm.defense.block);
            expect(mod).not.toBe(sm.attack);
        });

        it("counterstrike → sm.defense.counterstrike (not sm.attack)", () => {
            const sm = makeMeleeMode(2, 3);
            const mod = selectStrikeModeModifier(sm, "counterstrike");
            expect(mod).toBe(sm.defense.counterstrike);
            expect(mod).not.toBe(sm.attack);
        });

        it("unknown kind → undefined", () => {
            const sm = makeMeleeMode();
            expect(selectStrikeModeModifier(sm, "impact")).toBeUndefined();
        });
    });

    describe("filterHeldWeapons (#180)", () => {
        function weapon(heldBy: unknown[]) {
            return { logic: { heldBy } };
        }

        it("includes weapons held by at least one part", () => {
            const w = weapon([{}]);
            expect(
                filterHeldWeapons([w], (x) => (x as any).logic.heldBy),
            ).toEqual([w]);
        });

        it("excludes weapons with an empty heldBy array", () => {
            const w = weapon([]);
            expect(
                filterHeldWeapons([w], (x) => (x as any).logic.heldBy),
            ).toEqual([]);
        });

        it("returns only held weapons from a mixed list", () => {
            const held = weapon([{}]);
            const unheld = weapon([]);
            expect(
                filterHeldWeapons(
                    [held, unheld],
                    (x) => (x as any).logic.heldBy,
                ),
            ).toEqual([held]);
        });

        it("returns empty array when input is empty", () => {
            expect(filterHeldWeapons([], () => [])).toEqual([]);
        });
    });
});
