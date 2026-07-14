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
    buildTraitGroups,
    buildSkillGroups,
    buildTraumaRows,
    traumaSeverityLabel,
    buildAfflictionGroups,
    buildAffiliationRows,
    buildHoldableGear,
    buildBodyLocationTree,
    htmlToPlainText,
    buildContainerTree,
    buildStatusPills,
    buildBodyPartLozenges,
    clampHealthPct,
    splitWeaponsByRange,
    selectStrikeModeModifier,
    filterHeldWeapons,
} from "@src/document/actor/logic/being-sheet-view";
import {
    STATUS_EFFECT,
    AFFLICTION_SUBTYPE,
    ITEM_KIND,
    IMPACT_ASPECT,
} from "@src/utils/constants";
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

    describe("buildTraitGroups", () => {
        const order = ["physique", "personality"];
        const subLabel = (s: string) => `sub:${s}`;
        const intLabel = (i: string) => `int:${i}`;
        const trait = (over: Record<string, unknown> = {}) => ({
            id: "t1",
            uuid: "Item.t1",
            name: "Brave",
            subType: "physique",
            isNumeric: true,
            masteryLevelBase: 12,
            textValue: "",
            intensity: "trait",
            notes: "n",
            ...over,
        });

        it("emits groups in the supplied subtype order with localized labels", () => {
            const a = trait({ id: "a", subType: "personality" });
            const b = trait({ id: "b", subType: "physique" });
            const groups = buildTraitGroups([a, b], order, subLabel, intLabel);
            expect(groups.map((g) => g.subType)).toEqual([
                "physique",
                "personality",
            ]);
            expect(groups[0].label).toBe("sub:physique");
        });

        it("always emits every ordered subtype, even when empty", () => {
            const a = trait({ subType: "physique" });
            const groups = buildTraitGroups([a], order, subLabel, intLabel);
            expect(groups.map((g) => g.subType)).toEqual([
                "physique",
                "personality",
            ]);
            const personality = groups.find((g) => g.subType === "personality");
            expect(personality?.traits).toEqual([]);
        });

        it("maps rows: intensity label, numeric value, notes", () => {
            const a = trait({
                isNumeric: true,
                masteryLevelBase: 9,
                intensity: "disorder",
                notes: "hi",
            });
            const [group] = buildTraitGroups([a], order, subLabel, intLabel);
            expect(group.traits[0]).toMatchObject({
                id: "t1",
                uuid: "Item.t1",
                name: "Brave",
                intensity: "int:disorder",
                value: 9,
                notes: "hi",
            });
        });

        it("uses textValue for non-numeric traits and blanks empty intensity", () => {
            const a = trait({
                isNumeric: false,
                textValue: "Left-handed",
                intensity: undefined,
            });
            const [group] = buildTraitGroups([a], order, subLabel, intLabel);
            expect(group.traits[0].value).toBe("Left-handed");
            expect(group.traits[0].intensity).toBe("");
        });

        it("appends unordered subtypes after the ordered ones", () => {
            const a = trait({ subType: "physique" });
            const b = trait({ subType: "mystery" });
            const groups = buildTraitGroups([a, b], order, subLabel, intLabel);
            expect(groups.map((g) => g.subType)).toEqual([
                "physique",
                "personality",
                "mystery",
            ]);
        });
    });

    describe("buildSkillGroups", () => {
        const order = ["social", "nature"];
        const subLabel = (s: string) => `sub:${s}`;
        const skill = (over: Record<string, unknown> = {}) => ({
            id: "s1",
            uuid: "Item.s1",
            name: "Climbing",
            subType: "social",
            sb: 5,
            ml: 40,
            index: 4,
            eml: 42,
            fate: 50,
            disabled: false,
            canImprove: true,
            improveFlag: false,
            ...over,
        });

        it("emits groups in the supplied subtype order with localized labels", () => {
            const a = skill({ id: "a", subType: "nature" });
            const b = skill({ id: "b", subType: "social" });
            const groups = buildSkillGroups([a, b], order, subLabel);
            expect(groups.map((g) => g.subType)).toEqual(["social", "nature"]);
            expect(groups[0].label).toBe("sub:social");
        });

        it("always emits every ordered subtype, even when empty", () => {
            const a = skill({ subType: "social" });
            const groups = buildSkillGroups([a], order, subLabel);
            expect(groups.map((g) => g.subType)).toEqual(["social", "nature"]);
            const nature = groups.find((g) => g.subType === "nature");
            expect(nature?.skills).toEqual([]);
        });

        it("appends unordered subtypes after the ordered ones", () => {
            const a = skill({ subType: "social" });
            const b = skill({ subType: "craft" });
            const groups = buildSkillGroups([a, b], order, subLabel);
            expect(groups.map((g) => g.subType)).toEqual([
                "social",
                "nature",
                "craft",
            ]);
        });

        it("maps every row field", () => {
            const a = skill({
                sb: 6,
                ml: 55,
                index: 5,
                eml: 58,
                fate: 60,
                disabled: true,
                canImprove: false,
                improveFlag: true,
            });
            const [group] = buildSkillGroups([a], order, subLabel);
            expect(group.skills[0]).toEqual({
                id: "s1",
                uuid: "Item.s1",
                name: "Climbing",
                sb: 6,
                ml: 55,
                index: 5,
                eml: 58,
                fate: 60,
                disabled: true,
                canImprove: false,
                improveFlag: true,
            });
        });
    });

    describe("htmlToPlainText", () => {
        it("strips tags and collapses whitespace", () => {
            expect(
                htmlToPlainText("<p>Knight  of\n the <b>Realm</b></p>"),
            ).toBe("Knight of the Realm");
        });

        it("unescapes the common entities Foundry emits", () => {
            expect(
                htmlToPlainText("Curia &amp; Council &nbsp;&quot;x&quot;"),
            ).toBe('Curia & Council "x"');
        });

        it("returns '' for empty/undefined input", () => {
            expect(htmlToPlainText("")).toBe("");
            expect(htmlToPlainText(undefined as unknown as string)).toBe("");
        });
    });

    describe("buildBodyLocationTree", () => {
        const loc = (over: Record<string, unknown> = {}) => ({
            name: "Skull",
            layers: "",
            prob: 5,
            base: { blunt: 2, edged: 3, piercing: 1, fire: 1 },
            armor: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
            shock: 5,
            impair: 0,
            ...over,
        });

        it("sums natural base + equipped armor per aspect", () => {
            const tree = buildBodyLocationTree([
                {
                    label: "Head",
                    held: "",
                    locations: [
                        loc({
                            layers: "Padded, Plate",
                            base: { blunt: 2, edged: 4, piercing: 3, fire: 3 },
                            armor: {
                                blunt: 6,
                                edged: 12,
                                piercing: 7,
                                fire: 7,
                            },
                        }),
                    ],
                },
            ]);
            const row = tree[0].locations[0];
            expect(row).toMatchObject({
                name: "Skull",
                layers: "Padded, Plate",
                prob: 5,
                blunt: 8, // 2 + 6
                edged: 16, // 4 + 12
                piercing: 10, // 3 + 7
                fire: 10, // 3 + 7
                shock: 5,
                impair: 0,
            });
        });

        it("leaves totals at the natural base when no armor covers a location", () => {
            const [part] = buildBodyLocationTree([
                { label: "Head", held: "", locations: [loc()] },
            ]);
            expect(part.locations[0]).toMatchObject({
                blunt: 2,
                edged: 3,
                piercing: 1,
                fire: 1,
                layers: "",
            });
        });

        it("carries the part label, held item, and location order", () => {
            const tree = buildBodyLocationTree([
                {
                    label: "Right Arm",
                    held: "Broadsword",
                    locations: [
                        loc({ name: "Shoulder" }),
                        loc({ name: "Elbow" }),
                    ],
                },
            ]);
            expect(tree[0].label).toBe("Right Arm");
            expect(tree[0].held).toBe("Broadsword");
            expect(tree[0].locations.map((l) => l.name)).toEqual([
                "Shoulder",
                "Elbow",
            ]);
        });

        it("returns an empty array for no parts", () => {
            expect(buildBodyLocationTree([])).toEqual([]);
        });
    });

    describe("buildHoldableGear", () => {
        const HOLDABLE = new Set(["weapongear", "miscgear"]);
        const g = (over: Record<string, unknown> = {}) => ({
            id: "g1",
            name: "Sword",
            kind: "weapongear",
            containerId: "",
            ...over,
        });
        const kind = (x: any) => x.kind;
        const cid = (x: any) => x.containerId;

        it("keeps holdable-kind items that are not in a container", () => {
            const out = buildHoldableGear(
                [
                    g({ id: "a", name: "Sword", kind: "weapongear" }),
                    g({ id: "b", name: "Torch", kind: "miscgear" }),
                ],
                kind,
                cid,
                HOLDABLE,
            );
            expect(out).toEqual([
                { id: "a", name: "Sword" },
                { id: "b", name: "Torch" },
            ]);
        });

        it("excludes items stowed inside a container (can't hold a bagged weapon)", () => {
            const out = buildHoldableGear(
                [
                    g({ id: "a", kind: "weapongear", containerId: "" }),
                    g({ id: "b", kind: "weapongear", containerId: "pack1" }),
                ],
                kind,
                cid,
                HOLDABLE,
            );
            expect(out.map((o) => o.id)).toEqual(["a"]);
        });

        it("excludes non-holdable kinds (e.g. armor)", () => {
            const out = buildHoldableGear(
                [
                    g({ id: "a", kind: "armorgear" }),
                    g({ id: "b", kind: "miscgear" }),
                ],
                kind,
                cid,
                HOLDABLE,
            );
            expect(out.map((o) => o.id)).toEqual(["b"]);
        });

        it("returns an empty array when nothing qualifies", () => {
            expect(buildHoldableGear([], kind, cid, HOLDABLE)).toEqual([]);
        });
    });

    describe("buildAffiliationRows", () => {
        const aff = (over: Record<string, unknown> = {}) => ({
            id: "a1",
            uuid: "Item.a1",
            name: "Knights",
            level: 3,
            society: "Order",
            office: "Marshal",
            title: "Sir",
            notes: "<p>brave</p>",
            ...over,
        });

        it("maps each affiliation to a row in input order", () => {
            const rows = buildAffiliationRows([
                aff({ id: "a", name: "A" }),
                aff({ id: "b", name: "B" }),
            ]);
            expect(rows.map((r) => r.name)).toEqual(["A", "B"]);
            expect(rows[0]).toMatchObject({
                id: "a",
                uuid: "Item.a1",
                level: 3,
                society: "Order",
                office: "Marshal",
                title: "Sir",
            });
        });

        it("reduces notes to a plain-text snippet", () => {
            const [row] = buildAffiliationRows([
                aff({ notes: "<p>Sworn  <em>oath</em></p>" }),
            ]);
            expect(row.notes).toBe("Sworn oath");
        });

        it("returns an empty array for no affiliations", () => {
            expect(buildAffiliationRows([])).toEqual([]);
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
        it("returns the eight pills in display order, with aural-shock and fatigue as affliction indicators (#306)", () => {
            const pills = buildStatusPills(new Set());
            expect(pills.map((p) => p.id)).toEqual([
                AFFLICTION_SUBTYPE.AURALSHOCK,
                STATUS_EFFECT.SLEEP,
                STATUS_EFFECT.PRONE,
                STATUS_EFFECT.STUN,
                AFFLICTION_SUBTYPE.FATIGUE,
                STATUS_EFFECT.INCAPACITATED,
                STATUS_EFFECT.UNCONSCIOUS,
                STATUS_EFFECT.DEAD,
            ]);
        });

        it("marks the six ActiveEffect statuses toggleable and the two affliction indicators not", () => {
            const pills = buildStatusPills(new Set());
            expect(pills.filter((p) => p.toggleable).map((p) => p.id)).toEqual([
                STATUS_EFFECT.SLEEP,
                STATUS_EFFECT.PRONE,
                STATUS_EFFECT.STUN,
                STATUS_EFFECT.INCAPACITATED,
                STATUS_EFFECT.UNCONSCIOUS,
                STATUS_EFFECT.DEAD,
            ]);
            expect(pills.filter((p) => !p.toggleable).map((p) => p.id)).toEqual(
                [AFFLICTION_SUBTYPE.AURALSHOCK, AFFLICTION_SUBTYPE.FATIGUE],
            );
        });

        it("marks only the active status ids active among toggleable pills", () => {
            const pills = buildStatusPills(
                new Set([STATUS_EFFECT.STUN, STATUS_EFFECT.DEAD]),
            );
            const active = pills.filter((p) => p.active).map((p) => p.id);
            expect(active).toEqual([STATUS_EFFECT.STUN, STATUS_EFFECT.DEAD]);
        });

        it("lights aural-shock and fatigue from active affliction subtypes, not from a toggled status", () => {
            // A toggled `auralshock` *status* must not light the indicator...
            const fromStatus = buildStatusPills(
                new Set([AFFLICTION_SUBTYPE.AURALSHOCK]),
                new Set(),
            );
            expect(
                fromStatus.find((p) => p.id === AFFLICTION_SUBTYPE.AURALSHOCK)!
                    .active,
            ).toBe(false);
            // ...an active affliction subtype does.
            const fromAffliction = buildStatusPills(
                new Set(),
                new Set([
                    AFFLICTION_SUBTYPE.AURALSHOCK,
                    AFFLICTION_SUBTYPE.FATIGUE,
                ]),
            );
            expect(
                fromAffliction.filter((p) => p.active).map((p) => p.id),
            ).toEqual([
                AFFLICTION_SUBTYPE.AURALSHOCK,
                AFFLICTION_SUBTYPE.FATIGUE,
            ]);
        });

        it("carries abbr and label for each pill", () => {
            const stun = buildStatusPills(new Set()).find(
                (p) => p.id === STATUS_EFFECT.STUN,
            )!;
            expect(stun).toMatchObject({
                abbr: "STN",
                label: "Stun",
                toggleable: true,
            });
        });
    });

    describe("buildBodyPartLozenges", () => {
        const structure = {
            parts: [
                {
                    shortcode: "HEAD",
                    name: "Head",
                    locations: [{ shortcode: "pate" }],
                },
                { shortcode: "TORSO", locations: [{ shortcode: "chest" }] },
            ],
        };

        it("maps each part to its name (falling back to shortcode) with 'none' status when uninjured", () => {
            expect(buildBodyPartLozenges(structure)).toEqual([
                { shortcode: "HEAD", name: "Head", status: "none" },
                { shortcode: "TORSO", name: "TORSO", status: "none" },
            ]);
        });

        it("colors each part by the worst injury on its locations (#464)", () => {
            const injuries = [
                { locationShortcode: "pate", level: 4, healingRate: 4 }, // grievous
                { locationShortcode: "chest", level: 1, healingRate: 5 }, // minor
            ];
            expect(buildBodyPartLozenges(structure, injuries)).toEqual([
                { shortcode: "HEAD", name: "Head", status: "unusable" },
                { shortcode: "TORSO", name: "TORSO", status: "minor" },
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

    describe("traumaSeverityLabel", () => {
        it("maps a level to its band label (M/S/G + level)", () => {
            expect(traumaSeverityLabel(1)).toBe("M1");
            expect(traumaSeverityLabel(2)).toBe("S2");
            expect(traumaSeverityLabel(3)).toBe("S3");
            expect(traumaSeverityLabel(4)).toBe("G4");
            expect(traumaSeverityLabel(5)).toBe("G5");
        });
    });

    describe("buildTraumaRows", () => {
        const base = {
            id: "t1",
            uuid: "Item.t1",
            name: "Left Arm Crush",
            img: "icons/x.svg",
            level: 2,
            healingRate: 6,
            healingRateDisabled: false,
            isTreated: false,
            isBleeding: false,
            aspect: "blunt",
            area: "Left Forearm" as string | undefined,
            notes: "<p>bruised</p>",
        };
        const label = (a: string) => a.toUpperCase();

        it("formats severity, aspect label, area, and plain-text notes", () => {
            const [row] = buildTraumaRows([base], label);
            expect(row.healed).toBe(false);
            expect(row.severity).toBe("S2");
            expect(row.aspect).toBe("BLUNT");
            expect(row.area).toBe("Left Forearm");
            expect(row.notes).toBe("bruised");
        });

        it("marks a healed trauma (level ≤ 0) with an empty severity", () => {
            const [row] = buildTraumaRows([{ ...base, level: 0 }], label);
            expect(row.healed).toBe(true);
            expect(row.severity).toBe("");
        });

        it("defaults a missing body location to an em dash", () => {
            const [row] = buildTraumaRows(
                [{ ...base, area: undefined }],
                label,
            );
            expect(row.area).toBe("—");
        });

        it("passes through healing-rate and treated/bleeding flags", () => {
            const [row] = buildTraumaRows(
                [{ ...base, healingRateDisabled: true, isBleeding: true }],
                label,
            );
            expect(row.healingRateDisabled).toBe(true);
            expect(row.isBleeding).toBe(true);
        });
    });

    describe("buildAfflictionGroups", () => {
        const aff = (over = {}) => ({
            id: "a1",
            uuid: "Item.a1",
            name: "Winter Chill",
            img: "icons/x.svg",
            subType: "fatigue",
            levelLabel: "Weary",
            healingRate: 4,
            healingRateDisabled: false,
            source: "Cold",
            notes: "<p>shivering</p>",
            ...over,
        });
        const label = (s: string) => s.toUpperCase();

        it("groups by subtype in the given order with labels and rows", () => {
            const groups = buildAfflictionGroups(
                [aff({ subType: "privation" }), aff({ subType: "fatigue" })],
                ["fatigue", "privation"],
                label,
            );
            expect(groups.map((g) => g.subType)).toEqual([
                "fatigue",
                "privation",
            ]);
            expect(groups[0].label).toBe("FATIGUE");
        });

        it("formats a row: level, source, and plain-text notes", () => {
            const [group] = buildAfflictionGroups([aff()], ["fatigue"], label);
            const [row] = group.afflictions;
            expect(row.level).toBe("Weary");
            expect(row.source).toBe("Cold");
            expect(row.notes).toBe("shivering");
        });

        it("emits only non-empty groups", () => {
            const groups = buildAfflictionGroups(
                [aff({ subType: "fatigue" })],
                ["fear", "fatigue", "privation"],
                label,
            );
            expect(groups.map((g) => g.subType)).toEqual(["fatigue"]);
        });

        it("appends populated subtypes not present in the order", () => {
            const groups = buildAfflictionGroups(
                [aff({ subType: "mystery-subtype" })],
                ["fatigue"],
                label,
            );
            expect(groups.map((g) => g.subType)).toEqual(["mystery-subtype"]);
        });
    });
});
