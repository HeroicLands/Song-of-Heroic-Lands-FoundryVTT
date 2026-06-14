/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    resolveStrikeModeML,
    resolveStrikeModeImpact,
    resolveSkillMasteryLevel,
    collectBlockableStrikeModes,
    collectAttackableStrikeModes,
    hasMeleeAttackStrikeMode,
    firstStatusIn,
    hasAnyStatus,
    ATTACK_BLOCKING_STATUSES,
    DEFENSE_DISABLING_STATUSES,
    classifyMissileRange,
    indexOfBestMastery,
    buildDamageCardData,
    buildAttackResult,
    buildAttackCardData,
    buildCombatCardData,
    resolveTargetCombatant,
} from "@src/document/actor/logic/combat-actions";
import {
    IMPACT_ASPECT,
    MARGINAL_SUCCESS,
    TEST_TYPE,
} from "@src/utils/constants";
import { AttackResult } from "@src/domain/result/AttackResult";
import { DefendResult } from "@src/domain/result/DefendResult";
import { CombatResult } from "@src/domain/result/CombatResult";
import { CombatModifier } from "@src/domain/modifier/CombatModifier";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { instanceFromJSON } from "@src/utils/helpers";

const attackerParent = {
    data: { kind: "weapongear" },
    name: "Broadsword",
    label: "Broadsword",
    item: { logic: { availableFate: [] } },
} as any;

/**
 * Adapt the legacy `{ itemTypes: { kind: [{ id, name, system, logic }] } }`
 * mock shape into the {@link SohlActorLogic} surface the combat helpers now
 * consume: `logicTypes[kind]` arrays of item logics (with `id`/`name`/`data`)
 * and `getItemLogic(shortcode, kind)`.
 */
function asActorLogic(input: any): any {
    const itemTypes: Record<string, any[]> = input?.itemTypes ?? input ?? {};
    const logicTypes: Record<string, any[]> = {};
    for (const [kind, arr] of Object.entries(itemTypes)) {
        logicTypes[kind] = (arr ?? []).map((it) => ({
            ...it.logic,
            id: it.id ?? it.logic?.id,
            name: it.name ?? it.logic?.name,
            data: {
                kind,
                shortcode: it.system?.shortcode,
                ...(it.logic?.data ?? {}),
            },
        }));
    }
    return {
        logicTypes: new Proxy(logicTypes, {
            get: (t, k) => (t as any)[k] ?? [],
        }),
        getItemLogic: (shortcode: string, kind: string) =>
            (logicTypes[kind] ?? []).find(
                (l) => l.data?.shortcode === shortcode,
            ),
    };
}

function makeActor(items: any[]): any {
    return {
        items: {
            get: (id: string) => items.find((i) => i.id === id),
        },
    };
}

function makeWeaponWithModes(weaponId: string, modes: any[]): any {
    return {
        id: weaponId,
        logic: { strikeModes: modes },
    };
}

const ATK_MOD = Symbol("attack");
const BLK_MOD = Symbol("block");
const CX_MOD = Symbol("counterstrike");

const meleeMode = (id: string) => ({
    id,
    attack: ATK_MOD,
    defense: { block: BLK_MOD, counterstrike: CX_MOD },
});

const missileMode = (id: string) => ({
    id,
    attack: ATK_MOD,
});

describe("resolveStrikeModeML", () => {
    it("returns the attack modifier for testKind 'attack'", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "attack")).toBe(
            ATK_MOD,
        );
    });

    it("returns the block modifier for testKind 'block'", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "block")).toBe(BLK_MOD);
    });

    it("returns the counterstrike modifier for testKind 'counterstrike'", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "counterstrike")).toBe(
            CX_MOD,
        );
    });

    it("returns null when the item does not exist on the actor", () => {
        const actor = makeActor([]);
        expect(
            resolveStrikeModeML(actor, "missing", "sm1", "attack"),
        ).toBeNull();
    });

    it("returns null when the item has no logic.strikeModes array", () => {
        const actor = makeActor([{ id: "wp1", logic: {} }]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "attack")).toBeNull();
    });

    it("returns null when the strike mode id is not found", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "other", "attack")).toBeNull();
    });

    it("returns null for 'block' on a missile strike mode without defense", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [missileMode("sm1")]),
        ]);
        expect(resolveStrikeModeML(actor, "wp1", "sm1", "block")).toBeNull();
    });

    it("returns null for 'counterstrike' on a missile strike mode", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [missileMode("sm1")]),
        ]);
        expect(
            resolveStrikeModeML(actor, "wp1", "sm1", "counterstrike"),
        ).toBeNull();
    });

    it("returns null for an unknown testKind", () => {
        const actor = makeActor([
            makeWeaponWithModes("wp1", [meleeMode("sm1")]),
        ]);
        expect(
            resolveStrikeModeML(actor, "wp1", "sm1", "bogus" as any),
        ).toBeNull();
    });

    it("works with combat techniques (items without a 'weapon' role)", () => {
        // Combat techniques carry strike modes the same way weapons do.
        const actor = makeActor([
            makeWeaponWithModes("ct1", [meleeMode("brawl")]),
        ]);
        expect(resolveStrikeModeML(actor, "ct1", "brawl", "attack")).toBe(
            ATK_MOD,
        );
    });

    it("finds the right mode when an item has multiple strike modes", () => {
        const m1 = meleeMode("m1");
        const m2 = meleeMode("m2");
        (m2 as any).attack = Symbol("m2-attack");
        const actor = makeActor([makeWeaponWithModes("wp1", [m1, m2])]);
        expect(resolveStrikeModeML(actor, "wp1", "m2", "attack")).toBe(
            (m2 as any).attack,
        );
    });
});

const impactMode = (id: string, impact: any) => ({ id, impact });

describe("resolveStrikeModeImpact", () => {
    it("returns the impact modifier for a live strike mode", () => {
        const impact = { disabled: "" };
        const actor = makeActor([
            makeWeaponWithModes("wp1", [impactMode("sm1", impact)]),
        ]);
        expect(resolveStrikeModeImpact(actor, "wp1", "sm1")).toBe(impact);
    });

    it("returns null when the impact modifier is disabled", () => {
        const impact = { disabled: "SOHL.ImpactModifier.DISABLED" };
        const actor = makeActor([
            makeWeaponWithModes("wp1", [impactMode("sm1", impact)]),
        ]);
        expect(resolveStrikeModeImpact(actor, "wp1", "sm1")).toBeNull();
    });

    it("returns null when the item, strike mode, or impact is missing", () => {
        expect(resolveStrikeModeImpact(makeActor([]), "wp1", "sm1")).toBeNull();
        const actor = makeActor([makeWeaponWithModes("wp1", [{ id: "sm1" }])]);
        expect(resolveStrikeModeImpact(actor, "wp1", "sm1")).toBeNull();
        expect(resolveStrikeModeImpact(actor, "wp1", "nope")).toBeNull();
    });
});

describe("resolveSkillMasteryLevel", () => {
    const dodgeML = Symbol("dodge-ml");
    const actor = asActorLogic({
        skill: [
            { system: { shortcode: "shk" }, logic: { masteryLevel: {} } },
            {
                system: { shortcode: "dge" },
                logic: { masteryLevel: dodgeML },
            },
        ],
    });

    it("returns the mastery level of the skill with the given shortcode", () => {
        expect(resolveSkillMasteryLevel(actor, "dge")).toBe(dodgeML);
    });

    it("returns null when no skill has that shortcode", () => {
        expect(resolveSkillMasteryLevel(actor, "nope")).toBeNull();
        expect(resolveSkillMasteryLevel(asActorLogic({}), "dge")).toBeNull();
    });
});

describe("collectBlockableStrikeModes", () => {
    const blkMod = { disabled: "" };
    const noBlk = { disabled: "SOHL.INFO.disabled" };
    const actor = {
        itemTypes: {
            weapongear: [
                {
                    id: "shield",
                    name: "Round Shield",
                    logic: {
                        strikeModes: [
                            {
                                id: "b1",
                                name: "Block",
                                defense: { block: blkMod },
                            },
                        ],
                    },
                },
                {
                    id: "bow",
                    name: "Bow",
                    // missile mode: no defense → not blockable
                    logic: { strikeModes: [{ id: "shoot", name: "Shoot" }] },
                },
            ],
            combattechnique: [
                {
                    id: "ct",
                    name: "Brawling",
                    logic: {
                        strikeMode: {
                            id: "ct",
                            name: "Punch",
                            defense: { block: noBlk }, // noBlock → excluded
                        },
                    },
                },
            ],
        },
    } as any;

    it("lists only melee modes with an enabled block", () => {
        const entries = collectBlockableStrikeModes(asActorLogic(actor));
        expect(entries).toHaveLength(1);
        expect(entries[0]).toMatchObject({
            itemId: "shield",
            smId: "b1",
            itemName: "Round Shield",
            label: "Round Shield — Block",
        });
        expect(entries[0].ml).toBe(blkMod);
    });

    it("returns [] when nothing can block", () => {
        expect(collectBlockableStrikeModes(asActorLogic({}))).toEqual([]);
    });
});

describe("collectAttackableStrikeModes", () => {
    const melee = (id: string, reach: number) => ({
        id,
        name: id,
        attack: { disabled: "" },
        isMissile: false,
        reach: { effective: reach },
    });
    const missile = (id: string, baseRange: number) => ({
        id,
        name: id,
        attack: { disabled: "" },
        isMissile: true,
        baseRange: { effective: baseRange },
    });
    const actor = {
        itemTypes: {
            weapongear: [
                {
                    id: "sword",
                    name: "Sword",
                    logic: { strikeModes: [melee("swing", 5)] },
                },
                {
                    id: "bow",
                    name: "Bow",
                    logic: { strikeModes: [missile("shoot", 50)] },
                },
            ],
            combattechnique: [
                {
                    id: "ct",
                    name: "Brawl",
                    logic: { strikeMode: melee("punch", 4) },
                },
            ],
        },
    } as any;

    it("includes melee in reach + missile within base range", () => {
        // distance 4: swing (reach 5), punch (reach 4), shoot (range 50) all in.
        const ids = collectAttackableStrikeModes(asActorLogic(actor), 4)
            .map((e) => e.smId)
            .sort();
        expect(ids).toEqual(["punch", "shoot", "swing"].sort());
    });

    it("drops melee out of reach (missile still in base range)", () => {
        const ids = collectAttackableStrikeModes(asActorLogic(actor), 30).map(
            (e) => e.smId,
        );
        expect(ids).toEqual(["shoot"]);
    });

    it("returns [] when the target is out of range of every mode (volley excluded)", () => {
        expect(collectAttackableStrikeModes(asActorLogic(actor), 100)).toEqual(
            [],
        );
    });

    it("excludes noAttack modes", () => {
        const a = {
            itemTypes: {
                weapongear: [
                    {
                        id: "w",
                        name: "W",
                        logic: {
                            strikeModes: [
                                {
                                    id: "x",
                                    name: "x",
                                    attack: { disabled: "no" },
                                    isMissile: false,
                                    reach: { effective: 5 },
                                },
                            ],
                        },
                    },
                ],
            },
        } as any;
        expect(collectAttackableStrikeModes(asActorLogic(a), 1)).toEqual([]);
    });
});

describe("hasMeleeAttackStrikeMode", () => {
    const mode = (over: any) => ({
        id: "m",
        name: "m",
        attack: { disabled: "" },
        isMissile: false,
        isMelee: true,
        ...over,
    });

    it("true when a usable melee attack mode exists", () => {
        const a = {
            itemTypes: {
                weapongear: [
                    { id: "w", name: "W", logic: { strikeModes: [mode({})] } },
                ],
            },
        } as any;
        expect(hasMeleeAttackStrikeMode(asActorLogic(a))).toBe(true);
    });

    it("true via a combat technique's melee mode", () => {
        const a = {
            itemTypes: {
                combattechnique: [
                    {
                        id: "ct",
                        name: "Brawl",
                        logic: { strikeMode: mode({}) },
                    },
                ],
            },
        } as any;
        expect(hasMeleeAttackStrikeMode(asActorLogic(a))).toBe(true);
    });

    it("false when the only modes are missile (no melee counterstrike)", () => {
        const a = {
            itemTypes: {
                weapongear: [
                    {
                        id: "bow",
                        name: "Bow",
                        logic: {
                            strikeModes: [
                                mode({ isMelee: false, isMissile: true }),
                            ],
                        },
                    },
                ],
            },
        } as any;
        expect(hasMeleeAttackStrikeMode(asActorLogic(a))).toBe(false);
    });

    it("false when the melee mode is noAttack (attack disabled)", () => {
        const a = {
            itemTypes: {
                weapongear: [
                    {
                        id: "w",
                        name: "W",
                        logic: {
                            strikeModes: [mode({ attack: { disabled: "no" } })],
                        },
                    },
                ],
            },
        } as any;
        expect(hasMeleeAttackStrikeMode(asActorLogic(a))).toBe(false);
    });

    it("false for an actor with no items", () => {
        expect(hasMeleeAttackStrikeMode(asActorLogic({}))).toBe(false);
    });
});

describe("combat status invariants", () => {
    it("firstStatusIn returns the first forbidden status present (Set or array)", () => {
        expect(firstStatusIn(new Set(["fly", "frozen"]), ["frozen"])).toBe(
            "frozen",
        );
        expect(firstStatusIn(["prone", "sleep"], ["dead", "sleep"])).toBe(
            "sleep",
        );
    });

    it("firstStatusIn returns null when none are present", () => {
        expect(
            firstStatusIn(new Set(["prone"]), ["dead", "frozen"]),
        ).toBeNull();
        expect(firstStatusIn([], ["dead"])).toBeNull();
    });

    it("hasAnyStatus mirrors firstStatusIn as a boolean", () => {
        expect(hasAnyStatus(["sleep"], DEFENSE_DISABLING_STATUSES)).toBe(true);
        expect(hasAnyStatus(["prone"], DEFENSE_DISABLING_STATUSES)).toBe(false);
    });

    it("ATTACK_BLOCKING_STATUSES covers the attacker invariant (incl. DEFEATED=vanquished)", () => {
        for (const s of [
            "dead",
            "vanquished",
            "unconscious",
            "sleep",
            "restrain",
            "paralysis",
            "frozen",
            "incapacitated",
        ]) {
            expect(ATTACK_BLOCKING_STATUSES).toContain(s);
        }
    });

    it("DEFENSE_DISABLING_STATUSES is the IGNORE-only set (no DEAD, no DEFEATED)", () => {
        expect([...DEFENSE_DISABLING_STATUSES].sort()).toEqual(
            [
                "unconscious",
                "sleep",
                "restrain",
                "paralysis",
                "frozen",
                "incapacitated",
            ].sort(),
        );
        expect(DEFENSE_DISABLING_STATUSES).not.toContain("dead");
        expect(DEFENSE_DISABLING_STATUSES).not.toContain("vanquished");
    });
});

describe("classifyMissileRange", () => {
    it("point blank at <= half base range: spread 6, impact +2", () => {
        const r = classifyMissileRange(20, 40);
        expect(r).toEqual({
            direct: true,
            pointBlank: true,
            spread: 6,
            impactRangeBonus: 2,
        });
    });
    it("normal direct within base range: spread 8, no bonus", () => {
        const r = classifyMissileRange(30, 40);
        expect(r).toEqual({
            direct: true,
            pointBlank: false,
            spread: 8,
            impactRangeBonus: 0,
        });
    });
    it("beyond base range is a volley (not direct)", () => {
        expect(classifyMissileRange(50, 40).direct).toBe(false);
    });
});

describe("indexOfBestMastery", () => {
    it("returns the index of the highest mastery level", () => {
        expect(
            indexOfBestMastery([{ ml: 3 }, { ml: 9 }, { ml: 5 }], (e) => e.ml),
        ).toBe(1);
    });
    it("returns -1 for an empty list", () => {
        expect(indexOfBestMastery([], (e: any) => e.ml)).toBe(-1);
    });
});

describe("buildDamageCardData", () => {
    const base = {
        title: "Broadsword – Cut",
        actorId: "atk1",
        sourceActorUuid: "Actor.atk1",
        impactLabel: "2d6+3e",
        rollResult: "[3, 5] + 3",
        impact: 11,
        aspect: IMPACT_ASPECT.EDGED,
    };

    it("serializes only impact + aspect into the injury request (assisted)", () => {
        const data = buildDamageCardData({
            ...base,
            target: { name: "Goblin", actorUuid: "Actor.def1" },
        });
        expect(data).toMatchObject({
            title: "Broadsword – Cut",
            impactLabel: "2d6+3e",
            rollResult: "[3, 5] + 3",
            impact: 11,
            aspect: IMPACT_ASPECT.EDGED,
            hasTarget: true,
            targetName: "Goblin",
            handlerUuid: "Actor.def1",
        });
        expect(JSON.parse(data.testResultJson as string)).toEqual({
            impact: 11,
            aspect: IMPACT_ASPECT.EDGED,
        });
    });

    it("omits target wiring when nothing is targeted", () => {
        const data = buildDamageCardData({ ...base, target: null });
        expect(data.hasTarget).toBe(false);
        expect(data.handlerUuid).toBe("");
        expect(data.targetName).toBe("");
    });
});

describe("buildAttackResult", () => {
    function makeAttackML(base: number): CombatModifier {
        return new CombatModifier({ baseValue: base } as any, {
            parent: attackerParent,
        });
    }
    function makeImpact(): ImpactModifier {
        return new ImpactModifier(
            {
                roll: { numDice: 2, dieFaces: 6, modifier: 5 },
                aspect: IMPACT_ASPECT.EDGED,
            } as any,
            { parent: attackerParent },
        );
    }

    it("assembles an AttackResult from the strike-mode attack ML and impact", () => {
        const attackML = makeAttackML(54);
        const impact = makeImpact();
        const roll = new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [44] });

        const ar = buildAttackResult({
            attackML,
            impact,
            parent: attackerParent,
            token: null,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            aimBodyPartCode: "head",
            roll,
        });

        expect(ar).toBeInstanceOf(AttackResult);
        expect(ar.testType).toBe(TEST_TYPE.AUTOCOMBATMELEE.id);
        expect(ar.roll.total).toBe(44);
        expect(ar.masteryLevelModifier.constrainedEffective).toBe(54);
        expect(ar.impact.die).toBe(6);
        expect(ar.impact.numDice).toBe(2);
        expect(ar.aimBodyPartCode).toBe("head");
    });

    it("clones the modifiers so mutating the result does not touch the strike mode", () => {
        const attackML = makeAttackML(54);
        const impact = makeImpact();

        const ar = buildAttackResult({
            attackML,
            impact,
            parent: attackerParent,
            token: null,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            roll: new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [1] }),
        });

        expect(ar.masteryLevelModifier).not.toBe(attackML);
        expect(ar.impact).not.toBe(impact);
        // Independent: mutating the result's modifier leaves the source alone.
        ar.masteryLevelModifier.successLevelMod = 3;
        expect(attackML.successLevelMod).toBe(0);
        expect(ar.masteryLevelModifier.constrainedEffective).toBe(54);
    });
});

describe("buildAttackCardData", () => {
    function makeAttack(aimBodyPartCode = "mid"): AttackResult {
        const attackML = new CombatModifier({ baseValue: 54 } as any, {
            parent: attackerParent,
        });
        const impact = new ImpactModifier(
            {
                roll: { numDice: 2, dieFaces: 6, modifier: 5 },
                aspect: IMPACT_ASPECT.EDGED,
            } as any,
            { parent: attackerParent },
        );
        return buildAttackResult({
            attackML,
            impact,
            parent: attackerParent,
            token: null,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            aimBodyPartCode,
            roll: new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [44] }),
        });
    }

    it("surfaces the attacker's choices and resolved AML (transparency)", () => {
        const data = buildAttackCardData({
            attackResult: makeAttack("mid"),
            title: "Broadsword Melee Attack",
            attackerName: "Char1",
            actorId: "atk1",
            aimLabel: "Mid",
            target: { name: "Char2", actorUuid: "Actor.def1" },
        });
        expect(data).toMatchObject({
            title: "Broadsword Melee Attack",
            attackerName: "Char1",
            defenderName: "Char2",
            handlerActorUuid: "Actor.def1",
            hasTarget: true,
            aim: "mid",
            aimLabel: "Mid",
            aspect: IMPACT_ASPECT.EDGED,
            aml: 54,
            hasDodge: true,
            hasBlock: true,
            hasCounterstrike: true,
            hasIgnore: true,
        });
    });

    it("always emits all four defense buttons (render-time gating handles capability)", () => {
        const data = buildAttackCardData({
            attackResult: makeAttack("mid"),
            title: "t",
            attackerName: "a",
            actorId: null,
            aimLabel: "Mid",
            target: null,
        });
        expect(data.hasDodge).toBe(true);
        expect(data.hasIgnore).toBe(true);
        expect(data.hasBlock).toBe(true);
        expect(data.hasCounterstrike).toBe(true);
        expect(data.hasTarget).toBe(false);
        expect(data.handlerActorUuid).toBe("");
    });

    it("embeds the AttackResult so the defender's client can rehydrate it", () => {
        const data = buildAttackCardData({
            attackResult: makeAttack("mid"),
            title: "t",
            attackerName: "a",
            actorId: null,
            aimLabel: "Mid",
            target: null,
        });
        // The defender's client rehydrates with its own logic as the parent.
        const revived = instanceFromJSON<AttackResult>(
            JSON.stringify(data.attackResultData),
            attackerParent,
        );
        expect(revived).toBeInstanceOf(AttackResult);
        expect(revived.roll.total).toBe(44);
        expect(revived.masteryLevelModifier.constrainedEffective).toBe(54);
        expect(revived.aimBodyPartCode).toBe("mid");
        expect(revived.impact.numDice).toBe(2);
    });
});

describe("resolveTargetCombatant", () => {
    // Map a token to its combatant: tokens whose id starts with "c" are
    // combatants (returning a stand-in combatant), others are not.
    const toCombatant = (t: { id: string }) =>
        t.id.startsWith("c") ? { id: `combatant-${t.id}` } : null;

    it("returns the combatant of the single targeted combatant token", () => {
        expect(resolveTargetCombatant([{ id: "c1" }], toCombatant)).toEqual({
            id: "combatant-c1",
        });
    });

    it("ignores targeted tokens that are not combatants", () => {
        // Two tokens targeted, but only one is a combatant → unambiguous.
        expect(
            resolveTargetCombatant([{ id: "x1" }, { id: "c2" }], toCombatant),
        ).toEqual({ id: "combatant-c2" });
    });

    it("throws when no targeted token is a combatant", () => {
        expect(() =>
            resolveTargetCombatant([{ id: "x1" }, { id: "x2" }], toCombatant),
        ).toThrow(/exactly one combatant/i);
    });

    it("throws when nothing is targeted", () => {
        expect(() => resolveTargetCombatant([], toCombatant)).toThrow(
            /exactly one combatant/i,
        );
    });

    it("throws when more than one targeted token is a combatant", () => {
        expect(() =>
            resolveTargetCombatant([{ id: "c1" }, { id: "c2" }], toCombatant),
        ).toThrow(/exactly one combatant/i);
    });
});

describe("buildCombatCardData — Ignore", () => {
    function makeIgnoreCombat(): CombatResult {
        const attackML = new CombatModifier({ baseValue: 54 } as any, {
            parent: attackerParent,
        });
        const impact = new ImpactModifier(
            {
                roll: { numDice: 2, dieFaces: 6, modifier: 5 },
                aspect: IMPACT_ASPECT.EDGED,
            } as any,
            { parent: attackerParent },
        );
        const ar = buildAttackResult({
            attackML,
            impact,
            parent: attackerParent,
            token: null,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            aimBodyPartCode: "mid",
            roll: new SimpleRoll({ numDice: 1, dieFaces: 100, rolls: [44] }),
        });
        // The attacker's result crosses as an already-evaluated snapshot.
        (ar as any)._successLevel = MARGINAL_SUCCESS;
        const def = new DefendResult(
            { testType: TEST_TYPE.IGNORE.id, situationalModifier: 0 } as any,
            { parent: attackerParent },
        );
        const cr = new CombatResult(
            {
                attackResult: ar,
                defendResult: def,
                sourceTestResult: ar,
                targetTestResult: def,
                speaker: ar.speaker,
            } as any,
            { parent: attackerParent },
        );
        cr.opposedTestEvaluate();
        return cr;
    }

    it("dashes the defender column and offers the injury button on a hit", () => {
        const cr = makeIgnoreCombat();
        const data = buildCombatCardData({
            combatResult: cr,
            title: "Attack Result",
            actorId: "def1",
            attackerName: "Char1",
            defenderName: "Char2",
            attackWeapon: "Broadsword",
            defenseLabel: "Ignore",
            attackTarget: { name: "Char2", actorUuid: "Actor.def" },
        });
        // Ignore: defender did not contest → its column is empty (template dashes it).
        expect(data.defense).toBe("Ignore");
        expect(data.effDML).toBe("");
        expect(data.defenseRoll).toBe("");
        // Attacker side is populated.
        expect(data.effAML).toBe(54);
        expect(data.attackRoll).toBe(44);
        // The unopposed attack succeeded (roll 44 <= AML 54) → it lands.
        expect(data.hasAttackHit).toBe(true);
        expect(data.hasAttackInjury).toBe(true);
        expect(data.attackInjuryHandlerUuid).toBe("Actor.def");
        const inj = JSON.parse(data.attackInjuryJson as string);
        expect(inj.aspect).toBe(IMPACT_ASPECT.EDGED);
        expect(typeof inj.impact).toBe("number");
        // No defender impact in an Ignore exchange.
        expect(data.hasDefendInjury).toBe(false);
    });
});
