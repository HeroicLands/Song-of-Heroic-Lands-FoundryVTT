import { describe, it, expect } from "vitest";
import {
    computeActorReach,
    type MeleeReachOption,
} from "@src/document/actor/logic/reach-helpers";

/** A combat-technique mode: intrinsic, always available. */
const technique = (reach: number, minParts = 1): MeleeReachOption => ({
    reach,
    minParts,
    heldLimbs: null,
});

/** A weapon mode held in `heldLimbs` limbs, needing `minParts`. */
const weapon = (
    reach: number,
    minParts: number,
    heldLimbs: number,
): MeleeReachOption => ({ reach, minParts, heldLimbs });

describe("computeActorReach", () => {
    it("returns 0 when there are no melee strike modes", () => {
        expect(computeActorReach([])).toBe(0);
    });

    it("uses combat-technique reach (intrinsic, always available)", () => {
        expect(computeActorReach([technique(0), technique(2)])).toBe(2);
    });

    it("includes a weapon mode held in at least minParts limbs", () => {
        // 1-handed weapon held in one hand.
        expect(computeActorReach([weapon(5, 1, 1)])).toBe(5);
        // 2-handed weapon held in two hands.
        expect(computeActorReach([weapon(8, 2, 2)])).toBe(8);
        // held in more limbs than required.
        expect(computeActorReach([weapon(5, 1, 2)])).toBe(5);
    });

    it("excludes a weapon mode not held in enough limbs", () => {
        // 2-handed weapon held in only one hand → unavailable.
        expect(computeActorReach([weapon(8, 2, 1)])).toBe(0);
        // weapon not held at all → unavailable.
        expect(computeActorReach([weapon(5, 1, 0)])).toBe(0);
    });

    it("takes the maximum reach across all available modes", () => {
        const reach = computeActorReach([
            technique(1), // available, reach 1
            weapon(5, 1, 1), // available, reach 5
            weapon(10, 2, 1), // unavailable (held 1 < 2)
        ]);
        expect(reach).toBe(5);
    });

    it("falls back to available modes when the longest weapon is unavailable", () => {
        const reach = computeActorReach([
            technique(0), // brawl, reach 0
            weapon(12, 2, 0), // dropped polearm — not held
        ]);
        expect(reach).toBe(0);
    });
});
