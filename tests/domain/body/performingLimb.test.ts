/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    NO_FREE_LIMB,
    NO_SUCH_LIMB,
    NO_USABLE_LIMB,
    resolvePerformingLimbs,
} from "@src/entity/body/performingLimb";
import { BODY_ROLE, BODY_SIDE } from "@src/utils/constants";

/** A body part stand-in carrying only what the rule reads. */
interface Part {
    shortcode: string;
    roles: string[];
    canHoldItemBase: boolean;
    heldItemId: string | null;
    immobilized: boolean;
    canHoldItem: boolean;
}

/**
 * Build a part, defaulting to a healthy empty limb.
 * @param shortcode - The part's shortcode, which also gives it its side.
 * @param roles - The roles the part carries.
 * @param over - Fields to override.
 * @returns The part stand-in.
 */
function part(shortcode: string, roles: string[], over: Partial<Part> = {}): Part {
    const canHoldItemBase = over.canHoldItemBase ?? roles.includes(BODY_ROLE.MANIPULATOR);
    const immobilized = over.immobilized ?? false;
    return {
        shortcode,
        roles,
        canHoldItemBase,
        heldItemId: over.heldItemId ?? null,
        immobilized,
        // `canHoldItem` is the persisted capability minus being out of action;
        // the real getter derives it the same way.
        canHoldItem: over.canHoldItem ?? (canHoldItemBase && !immobilized),
    };
}

/**
 * A structure stand-in exposing the one lookup the rule makes, with each part
 * carrying the back-reference `bodyPartSide` reads to find its mirror twin.
 */
function structure(parts: Part[]) {
    const struct = {
        parts,
        getPartsByRole: (role: string) => parts.filter((p) => p.roles.includes(role)),
    } as any;
    for (const p of parts) (p as any).structure = struct;
    return struct;
}

/** Two arms, two legs and a torso — a person. */
function person(over: { left?: Partial<Part>; right?: Partial<Part> } = {}) {
    return structure([
        part("larmpart", [BODY_ROLE.MANIPULATOR], over.left),
        part("rarmpart", [BODY_ROLE.MANIPULATOR], over.right),
        part("llegpart", [BODY_ROLE.LOCOMOTOR]),
        part("rlegpart", [BODY_ROLE.LOCOMOTOR]),
        part("torsopart", [BODY_ROLE.CORE]),
    ]);
}

/**
 * A wolf, shaped as `Bestiary/Animal/Gray_Wolf.md` authors it: the head carries
 * `manipulator` because the bite is how a wolf takes hold of things, and no
 * part of it can grip.
 */
function wolf() {
    return structure([
        part("headpart", [BODY_ROLE.VITAL, BODY_ROLE.MANIPULATOR], {
            canHoldItemBase: false,
        }),
        part("lforelegpart", [BODY_ROLE.LOCOMOTOR]),
        part("rforelegpart", [BODY_ROLE.LOCOMOTOR]),
        part("torsopart", [BODY_ROLE.CORE]),
    ]);
}

/** Resolve for a one-limb manipulator technique (Grab, Punch, Limb Block). */
function manipulatorTechnique(struct: any, minParts = 1) {
    return resolvePerformingLimbs({
        structure: struct,
        roles: [BODY_ROLE.MANIPULATOR],
        minParts,
        dominantSide: BODY_SIDE.RIGHT,
    });
}

describe("a technique needing a free hand", () => {
    it("is available with both hands empty", () => {
        const result = manipulatorTechnique(person());
        expect(result.needsFreeLimb).toBe(true);
        expect(result.disabledReason).toBe("");
        expect(result.performingLimb?.shortcode).toBe("rarmpart");
    });

    it("is available with a sword in one hand, performed with the other", () => {
        const result = manipulatorTechnique(person({ right: { heldItemId: "sword" } }));
        expect(result.disabledReason).toBe("");
        expect(result.limbs.map((l) => l.shortcode)).toEqual(["larmpart"]);
    });

    it("is unavailable with a sword and a shield", () => {
        const result = manipulatorTechnique(
            person({ left: { heldItemId: "shield" }, right: { heldItemId: "sword" } }),
        );
        expect(result.disabledReason).toBe(NO_FREE_LIMB);
        expect(result.limbs).toEqual([]);
        expect(result.performingLimb).toBeUndefined();
    });

    it("is unavailable with a two-handed weapon occupying both arms", () => {
        const result = manipulatorTechnique(
            person({ left: { heldItemId: "poleaxe" }, right: { heldItemId: "poleaxe" } }),
        );
        expect(result.disabledReason).toBe(NO_FREE_LIMB);
    });

    it("does not count an unusable limb as free", () => {
        const result = manipulatorTechnique(
            person({
                left: { canHoldItem: false, immobilized: true },
                right: { heldItemId: "sword" },
            }),
        );
        expect(result.disabledReason).toBe(NO_FREE_LIMB);
    });

    it("does not count an immobilized limb as free, though it keeps its grip", () => {
        const result = manipulatorTechnique(person({ left: { immobilized: true } }));
        expect(result.limbs.map((l) => l.shortcode)).toEqual(["rarmpart"]);
        expect(result.disabledReason).toBe("");
    });

    it("needs as many free limbs as the technique occupies", () => {
        const both = manipulatorTechnique(person(), 2);
        expect(both.limbs.map((l) => l.shortcode)).toEqual(["rarmpart", "larmpart"]);

        const one = manipulatorTechnique(person({ left: { heldItemId: "sword" } }), 2);
        expect(one.disabledReason).toBe(NO_FREE_LIMB);
    });

    it("prefers the dominant side, and falls to the other when it is occupied", () => {
        const dominantFree = manipulatorTechnique(person());
        expect(dominantFree.performingLimb?.shortcode).toBe("rarmpart");

        const dominantBusy = manipulatorTechnique(person({ right: { heldItemId: "sword" } }));
        expect(dominantBusy.performingLimb?.shortcode).toBe("larmpart");
    });

    it("is denied to a creature whose manipulator cannot grip", () => {
        const result = manipulatorTechnique(wolf());
        expect(result.disabledReason).toBe(NO_SUCH_LIMB);
        expect(result.limbs).toEqual([]);
    });

    it("is denied to a body carrying no limb of that role at all", () => {
        const result = manipulatorTechnique(structure([part("torsopart", [BODY_ROLE.CORE])]));
        expect(result.disabledReason).toBe(NO_SUCH_LIMB);
    });

    it("leaves a wolf the techniques its own anatomy performs", () => {
        const bite = resolvePerformingLimbs({
            structure: wolf(),
            roles: [BODY_ROLE.VITAL],
            minParts: 1,
            dominantSide: undefined,
        });
        expect(bite.disabledReason).toBe("");
        expect(bite.performingLimb?.shortcode).toBe("headpart");
    });
});

describe("a technique using no hand", () => {
    it("is available to a press while both hands are full", () => {
        const result = resolvePerformingLimbs({
            structure: person({
                left: { heldItemId: "dagger" },
                right: { heldItemId: "dagger" },
            }),
            roles: [BODY_ROLE.CORE],
            minParts: 1,
            dominantSide: BODY_SIDE.RIGHT,
        });
        expect(result.needsFreeLimb).toBe(false);
        expect(result.disabledReason).toBe("");
        expect(result.performingLimb?.shortcode).toBe("torsopart");
    });

    it("names the kicking leg, dominant side first", () => {
        const result = resolvePerformingLimbs({
            structure: person(),
            roles: [BODY_ROLE.LOCOMOTOR],
            minParts: 1,
            dominantSide: BODY_SIDE.RIGHT,
        });
        expect(result.performingLimb?.shortcode).toBe("rlegpart");
    });

    it("is unavailable when every limb of that kind is out of action", () => {
        const result = resolvePerformingLimbs({
            structure: structure([
                part("llegpart", [BODY_ROLE.LOCOMOTOR], { immobilized: true }),
                part("rlegpart", [BODY_ROLE.LOCOMOTOR], { immobilized: true }),
            ]),
            roles: [BODY_ROLE.LOCOMOTOR],
            minParts: 1,
            dominantSide: BODY_SIDE.RIGHT,
        });
        expect(result.disabledReason).toBe(NO_USABLE_LIMB);
    });

    it("takes no side preference from a being with no dominant side", () => {
        const result = resolvePerformingLimbs({
            structure: person(),
            roles: [BODY_ROLE.MANIPULATOR],
            minParts: 1,
            dominantSide: undefined,
        });
        expect(result.performingLimb?.shortcode).toBe("larmpart");
    });
});
