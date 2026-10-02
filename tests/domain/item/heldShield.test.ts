/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    PRESS_TECHNIQUE_CODE,
    applyHeldShieldDefense,
    heldShieldMod,
} from "@src/document/item/logic/heldShield";
import { SHIELD_DEFENSE_ABBREV } from "@src/entity/strikemode/shieldDefense";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { ITEM_KIND, SKILL_CODE } from "@src/utils/constants";

/** A delta-recording modifier standing in for a `CombatModifier`. */
function modifier() {
    const deltas: Array<{ abbrev: string; value: number }> = [];
    return {
        deltas,
        add(_name: string, abbrev: string, value: number) {
            deltas.push({ abbrev, value });
        },
    };
}

/** The shield bonus recorded on a modifier, or `undefined` when none is. */
function shieldDelta(mod: { deltas: Array<{ abbrev: string; value: number }> }) {
    return mod.deltas.find((d) => d.abbrev === SHIELD_DEFENSE_ABBREV)?.value;
}

/**
 * A melee strike mode carrying only the fields the wiring touches. Built
 * through `Object.create` so `instanceof MeleeStrikeMode` holds without
 * standing up the whole entity registry.
 */
function meleeMode(traits: Record<string, unknown> = {}) {
    const sm = Object.create(MeleeStrikeMode.prototype) as MeleeStrikeMode;
    sm.traits = traits;
    (sm as { attack: unknown }).attack = modifier();
    (sm as { defense: unknown }).defense = { block: modifier() };
    return sm as MeleeStrikeMode & {
        attack: ReturnType<typeof modifier>;
        defense: { block: ReturnType<typeof modifier> };
    };
}

/** A wielder whose held and stowed weapons carry the given shield mods. */
function wielder(weapons: Array<{ held: boolean; shieldMod: number }>) {
    return {
        logicTypes: {
            [ITEM_KIND.WEAPONGEAR]: weapons.map((w) => ({
                heldBy: w.held ? [{}] : [],
                strikeModes: [meleeMode({ shieldMod: w.shieldMod })],
            })),
        },
    };
}

describe("heldShieldMod", () => {
    it("is nothing without a wielder", () => {
        expect(heldShieldMod(undefined)).toBe(0);
    });

    it("is nothing for a wielder with no weapons at all", () => {
        expect(heldShieldMod({ logicTypes: {} })).toBe(0);
    });

    it("reads a held shield's Shield Mod", () => {
        expect(heldShieldMod(wielder([{ held: true, shieldMod: 20 }]))).toBe(20);
    });

    it("a stowed shield grants nothing", () => {
        expect(heldShieldMod(wielder([{ held: false, shieldMod: 20 }]))).toBe(0);
    });

    it("two held shields grant the higher, not the sum", () => {
        expect(
            heldShieldMod(
                wielder([
                    { held: true, shieldMod: 10 },
                    { held: true, shieldMod: 15 },
                ]),
            ),
        ).toBe(15);
    });

    it("a held weapon that is not a shield grants nothing", () => {
        expect(heldShieldMod(wielder([{ held: true, shieldMod: 0 }]))).toBe(0);
    });
});

describe("applyHeldShieldDefense", () => {
    it("adds nothing to an unowned item", () => {
        const sword = meleeMode();
        applyHeldShieldDefense({ strikeModes: [sword] });
        expect(shieldDelta(sword.defense.block)).toBeUndefined();
    });

    it("assists a block made with the weapon in the other hand", () => {
        const sword = meleeMode();
        applyHeldShieldDefense({
            strikeModes: [sword],
            actorLogic: wielder([{ held: true, shieldMod: 20 }]),
        });
        expect(shieldDelta(sword.defense.block)).toBe(20);
    });

    it("leaves the weapon's own attack alone", () => {
        const sword = meleeMode();
        applyHeldShieldDefense({
            strikeModes: [sword],
            actorLogic: wielder([{ held: true, shieldMod: 20 }]),
        });
        expect(shieldDelta(sword.attack)).toBeUndefined();
    });

    it("adds nothing when the shield is stowed", () => {
        const sword = meleeMode();
        applyHeldShieldDefense({
            strikeModes: [sword],
            actorLogic: wielder([{ held: false, shieldMod: 20 }]),
        });
        expect(shieldDelta(sword.defense.block)).toBeUndefined();
    });

    it("reaches the wielder's Dodge, which carries no strike mode", () => {
        const dodge = { shortcode: SKILL_CODE.DODGE };
        const masteryLevel = modifier();
        applyHeldShieldDefense({
            strikeModes: [],
            data: dodge,
            masteryLevel: masteryLevel as never,
            actorLogic: wielder([{ held: true, shieldMod: 15 }]),
        });
        expect(shieldDelta(masteryLevel)).toBe(15);
    });

    it("leaves another skill's mastery level alone", () => {
        const masteryLevel = modifier();
        applyHeldShieldDefense({
            strikeModes: [],
            data: { shortcode: SKILL_CODE.CLIMBING },
            masteryLevel: masteryLevel as never,
            actorLogic: wielder([{ held: true, shieldMod: 15 }]),
        });
        expect(shieldDelta(masteryLevel)).toBeUndefined();
    });

    it("reaches a Press attack", () => {
        const press = meleeMode();
        applyHeldShieldDefense({
            strikeModes: [press],
            data: { shortcode: PRESS_TECHNIQUE_CODE },
            actorLogic: wielder([{ held: true, shieldMod: 5 }]),
        });
        expect(shieldDelta(press.attack)).toBe(5);
    });

    it("leaves another technique's attack alone", () => {
        const punch = meleeMode();
        applyHeldShieldDefense({
            strikeModes: [punch],
            data: { shortcode: "punch" },
            actorLogic: wielder([{ held: true, shieldMod: 5 }]),
        });
        expect(shieldDelta(punch.attack)).toBeUndefined();
    });

    it("restates rather than stacks across repeated preparation", () => {
        const sword = meleeMode();
        const owner = wielder([{ held: true, shieldMod: 10 }]);
        applyHeldShieldDefense({ strikeModes: [sword], actorLogic: owner });
        applyHeldShieldDefense({ strikeModes: [sword], actorLogic: owner });
        expect(sword.defense.block.deltas).toHaveLength(1);
        expect(shieldDelta(sword.defense.block)).toBe(10);
    });
});
