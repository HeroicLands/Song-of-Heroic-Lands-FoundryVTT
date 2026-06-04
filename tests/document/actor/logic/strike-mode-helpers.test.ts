import { describe, it, expect } from "vitest";
import {
    isStrikeModeAvailable,
    selectAvailableStrikeModes,
    type StrikeModeCandidate,
} from "@src/document/actor/logic/strike-mode-helpers";

/** An intrinsic mode (combat technique): always available. */
const intrinsic = (tag: string, minParts = 1): StrikeModeCandidate<string> => ({
    strikeMode: tag,
    minParts,
    heldLimbs: null,
});

/** A weapon mode held in `heldLimbs` limbs, needing `minParts`. */
const wielded = (
    tag: string,
    minParts: number,
    heldLimbs: number,
): StrikeModeCandidate<string> => ({ strikeMode: tag, minParts, heldLimbs });

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
    it("returns the strike modes of available candidates, in order", () => {
        const candidates: StrikeModeCandidate<string>[] = [
            intrinsic("technique"),
            wielded("sword-thrust", 1, 1),
            wielded("greatsword-swing", 2, 1), // not enough limbs
            wielded("spear-thrust", 1, 2),
        ];
        expect(selectAvailableStrikeModes(candidates)).toEqual([
            "technique",
            "sword-thrust",
            "spear-thrust",
        ]);
    });

    it("always includes intrinsic modes regardless of minParts", () => {
        expect(
            selectAvailableStrikeModes([intrinsic("technique", 5)]),
        ).toEqual(["technique"]);
    });

    it("excludes every weapon mode when the weapon is unheld", () => {
        expect(
            selectAvailableStrikeModes([
                wielded("swing", 1, 0),
                wielded("thrust", 1, 0),
            ]),
        ).toEqual([]);
    });

    it("returns an empty array for no candidates", () => {
        expect(selectAvailableStrikeModes([])).toEqual([]);
    });
});
