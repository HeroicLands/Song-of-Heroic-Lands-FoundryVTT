import { describe, it, expect } from "vitest";
import {
    isStrikeModeAvailable,
    selectAvailableStrikeModes,
    computeAvailableStrikeModes,
} from "@src/document/actor/logic/strike-mode-helpers";
import type { BodyStructure } from "@src/domain/body/BodyStructure";

/** A minimal strike-mode stand-in: only `minParts` is read by the helpers. */
const mode = (name: string, minParts: number) => ({ name, minParts });

/** A body-structure stub answering only `limbsHolding`. */
const body = (held: Record<string, number>) =>
    ({
        limbsHolding: (id: string) => held[id] ?? 0,
    }) as unknown as BodyStructure;

describe("isStrikeModeAvailable", () => {
    it("treats intrinsic modes (heldLimbs null) as always available", () => {
        expect(isStrikeModeAvailable(null, 1)).toBe(true);
        expect(isStrikeModeAvailable(null, 3)).toBe(true);
    });

    it("is available when held in at least minParts limbs", () => {
        expect(isStrikeModeAvailable(1, 1)).toBe(true);
        expect(isStrikeModeAvailable(2, 2)).toBe(true);
        expect(isStrikeModeAvailable(2, 1)).toBe(true);
    });

    it("is unavailable when not held in enough limbs", () => {
        expect(isStrikeModeAvailable(1, 2)).toBe(false);
        expect(isStrikeModeAvailable(0, 1)).toBe(false);
    });
});

describe("selectAvailableStrikeModes", () => {
    it("returns the strike modes of available candidates, in order, reading minParts off each mode", () => {
        const technique = mode("technique", 1);
        const swordThrust = mode("sword-thrust", 1);
        const greatswordSwing = mode("greatsword-swing", 2);
        const spearThrust = mode("spear-thrust", 1);
        const result = selectAvailableStrikeModes([
            { strikeMode: technique, heldLimbs: null },
            { strikeMode: swordThrust, heldLimbs: 1 },
            { strikeMode: greatswordSwing, heldLimbs: 1 }, // needs 2 limbs
            { strikeMode: spearThrust, heldLimbs: 2 },
        ]);
        expect(result).toEqual([technique, swordThrust, spearThrust]);
    });

    it("always includes intrinsic modes regardless of minParts", () => {
        const technique = mode("technique", 5);
        expect(
            selectAvailableStrikeModes([
                { strikeMode: technique, heldLimbs: null },
            ]),
        ).toEqual([technique]);
    });

    it("excludes every weapon mode when the weapon is unheld", () => {
        expect(
            selectAvailableStrikeModes([
                { strikeMode: mode("swing", 1), heldLimbs: 0 },
                { strikeMode: mode("thrust", 1), heldLimbs: 0 },
            ]),
        ).toEqual([]);
    });

    it("returns an empty array for no candidates", () => {
        expect(selectAvailableStrikeModes([])).toEqual([]);
    });
});

describe("computeAvailableStrikeModes", () => {
    it("includes every technique mode plus weapon modes held in enough limbs", () => {
        const punch = mode("punch", 1);
        const swing = mode("swing", 1);
        const thrust2h = mode("polearm-thrust", 2);
        const result = computeAvailableStrikeModes(
            body({ sword: 1, polearm: 2 }),
            [punch],
            [
                { id: "sword", strikeModes: [swing] }, // held 1, needs 1 → in
                { id: "polearm", strikeModes: [thrust2h] }, // held 2, needs 2 → in
            ],
        );
        expect(result).toEqual([punch, swing, thrust2h]);
    });

    it("excludes weapon modes not held in enough limbs", () => {
        const swing2h = mode("swing", 2);
        expect(
            computeAvailableStrikeModes(
                body({ axe: 1 }), // only one limb on a two-handed mode
                [],
                [{ id: "axe", strikeModes: [swing2h] }],
            ),
        ).toEqual([]);
    });

    it("treats an unheld weapon (limbsHolding 0) as unavailable", () => {
        const swing = mode("swing", 1);
        expect(
            computeAvailableStrikeModes(
                body({}),
                [],
                [{ id: "axe", strikeModes: [swing] }],
            ),
        ).toEqual([]);
    });

    it("treats all weapon modes as unheld when the body structure is undefined", () => {
        const punch = mode("punch", 1);
        const swing = mode("swing", 1);
        expect(
            computeAvailableStrikeModes(
                undefined,
                [punch],
                [{ id: "axe", strikeModes: [swing] }],
            ),
        ).toEqual([punch]);
    });

    it("returns empty when there are no techniques or weapons", () => {
        expect(computeAvailableStrikeModes(body({}), [], [])).toEqual([]);
    });
});
