/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    resolveSkillMasteryLevel,
    collectBlockableStrikeModes,
    ATTACK_BLOCKING_STATUSES,
    DEFENSE_DISABLING_STATUSES,
    classifyMissileRange,
    resolveTargetCombatant,
} from "@src/document/combatant/logic/SohlCombatantLogic";
import {
    hasMeleeAttackStrikeMode,
    hasAnyStatus,
} from "@src/document/chat/chat-card-gating";

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
        allLogics: Object.values(logicTypes).flat(),
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
            // Combat techniques now source from combattechnique-subtype skills.
            skill: [
                {
                    id: "ct",
                    name: "Brawling",
                    logic: {
                        strikeModes: [
                            {
                                id: "ct",
                                name: "Punch",
                                isMelee: true,
                                defense: { block: noBlk }, // noBlock → excluded
                            },
                        ],
                    },
                },
            ],
        },
    } as any;

    it("returns [] when nothing can block", () => {
        expect(collectBlockableStrikeModes(asActorLogic({}))).toEqual([]);
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
                // Combat techniques now source from combattechnique-subtype skills.
                skill: [
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
    it("hasAnyStatus reports whether a forbidden status is present (Set or array)", () => {
        expect(hasAnyStatus(["sleep"], DEFENSE_DISABLING_STATUSES)).toBe(true);
        expect(hasAnyStatus(["prone"], DEFENSE_DISABLING_STATUSES)).toBe(false);
        expect(
            hasAnyStatus(new Set(["frozen"]), DEFENSE_DISABLING_STATUSES),
        ).toBe(true);
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
