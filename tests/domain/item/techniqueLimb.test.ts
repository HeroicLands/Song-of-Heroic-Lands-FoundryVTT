/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    applyTechniqueLimbGate,
    techniquePerformingLimbs,
} from "@src/document/item/logic/techniqueLimb";
import { NO_FREE_LIMB } from "@src/entity/body/performingLimb";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { BODY_ROLE, BODY_SIDE } from "@src/utils/constants";

/** A modifier standing in for the `CombatModifier` the gate disables. */
function modifier() {
    return { disabledReason: "" };
}

/**
 * A melee strike mode carrying only the fields the wiring touches, built
 * through `Object.create` so `instanceof MeleeStrikeMode` holds without
 * standing up the entity registry.
 */
function meleeMode(minParts = 1) {
    const sm = Object.create(MeleeStrikeMode.prototype) as MeleeStrikeMode;
    (sm as { minParts: number }).minParts = minParts;
    (sm as { attack: unknown }).attack = modifier();
    (sm as { defense: unknown }).defense = {
        block: modifier(),
        counterstrike: modifier(),
    };
    return sm as MeleeStrikeMode & {
        attack: ReturnType<typeof modifier>;
        defense: {
            block: ReturnType<typeof modifier>;
            counterstrike: ReturnType<typeof modifier>;
        };
    };
}

/** A two-armed wielder, each arm holding whatever is given. */
function wielder(holding: { left?: string | null; right?: string | null } = {}) {
    const parts = [
        { shortcode: "larmpart", heldItemId: holding.left ?? null },
        { shortcode: "rarmpart", heldItemId: holding.right ?? null },
    ].map((p) => ({
        ...p,
        roles: [BODY_ROLE.MANIPULATOR] as string[],
        canHoldItemBase: true,
        canHoldItem: true,
        immobilized: false,
    }));
    const structure: any = {
        parts,
        getPartsByRole: (role: string) => parts.filter((p) => p.roles.includes(role)),
    };
    for (const p of parts) (p as any).structure = structure;
    return {
        body: { structure },
        dominantSide: BODY_SIDE.RIGHT,
    };
}

/** A combat-technique skill logic stand-in. */
function technique(
    sm: ReturnType<typeof meleeMode> | undefined,
    actorLogic: unknown,
    roles: string[] = [BODY_ROLE.MANIPULATOR],
) {
    return { strikeMode: sm, actorLogic, data: { impairedByRoles: roles } };
}

describe("techniquePerformingLimbs", () => {
    it("declines to answer for a skill with no strike mode", () => {
        expect(techniquePerformingLimbs(technique(undefined, wielder()))).toBeUndefined();
    });

    it("declines to answer for an unowned technique", () => {
        expect(techniquePerformingLimbs(technique(meleeMode(), undefined))).toBeUndefined();
    });

    it("declines to answer for a wielder with no body", () => {
        expect(techniquePerformingLimbs(technique(meleeMode(), {}))).toBeUndefined();
    });

    it("declines to answer for a technique naming no role", () => {
        expect(techniquePerformingLimbs(technique(meleeMode(), wielder(), []))).toBeUndefined();
    });

    it("names the dominant hand of a wielder with both free", () => {
        const resolved = techniquePerformingLimbs(technique(meleeMode(), wielder()));
        expect(resolved?.performingLimb?.shortcode).toBe("rarmpart");
        expect(resolved?.disabledReason).toBe("");
    });
});

describe("applyTechniqueLimbGate", () => {
    it("leaves a performable technique alone", () => {
        const sm = meleeMode();
        applyTechniqueLimbGate(technique(sm, wielder({ right: "sword" })));
        expect(sm.attack.disabledReason).toBe("");
        expect(sm.defense.block.disabledReason).toBe("");
        expect(sm.defense.counterstrike.disabledReason).toBe("");
    });

    it("disables attack and both defences with the reason when no hand is free", () => {
        const sm = meleeMode();
        applyTechniqueLimbGate(technique(sm, wielder({ left: "shield", right: "sword" })));
        expect(sm.attack.disabledReason).toBe(NO_FREE_LIMB);
        expect(sm.defense.block.disabledReason).toBe(NO_FREE_LIMB);
        expect(sm.defense.counterstrike.disabledReason).toBe(NO_FREE_LIMB);
    });

    it("restates the reason rather than compounding it when run again", () => {
        const sm = meleeMode();
        const logic = technique(sm, wielder({ left: "shield", right: "sword" }));
        applyTechniqueLimbGate(logic);
        applyTechniqueLimbGate(logic);
        expect(sm.attack.disabledReason).toBe(NO_FREE_LIMB);
    });

    it("is a no-op for a skill carrying no strike mode", () => {
        expect(() => applyTechniqueLimbGate(technique(undefined, wielder()))).not.toThrow();
    });
});
