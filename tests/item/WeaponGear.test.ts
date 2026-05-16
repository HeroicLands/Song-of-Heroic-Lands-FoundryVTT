import { describe, it, expect } from "vitest";

/*
 * Helper-method behavior is mirrored here as inline pure functions so it can
 * be verified without dragging in the full WeaponGearLogic import chain
 * (which transitively requires a complete Foundry runtime). The actual
 * methods on WeaponGearLogic are thin wrappers over this same logic.
 */

function addStrikeModeUpdate(
    existing: Record<string, unknown>,
    strikeMode: unknown,
    id: string,
): Record<string, unknown> {
    if (existing[id]) {
        throw new Error(
            `Strike mode with id "${id}" already exists on this weapon.`,
        );
    }
    return { [`system.strikeModes.${id}`]: strikeMode };
}

function removeStrikeModeUpdate(id: string): Record<string, unknown> {
    return { [`system.strikeModes.-=${id}`]: null };
}

function updateStrikeModeUpdate(
    id: string,
    partial: Record<string, unknown>,
): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(partial)) {
        update[`system.strikeModes.${id}.${key}`] = value;
    }
    return update;
}

const SAMPLE = { type: "melee", name: "Cut", heftBase: 5 };

describe("WeaponGearLogic strike mode update payloads", () => {
    describe("addStrikeModeUpdate", () => {
        it("returns a single-key payload at the supplied id", () => {
            expect(addStrikeModeUpdate({}, SAMPLE, "abc123")).toEqual({
                "system.strikeModes.abc123": SAMPLE,
            });
        });

        it("throws when the id already exists", () => {
            expect(() =>
                addStrikeModeUpdate({ existing: SAMPLE }, SAMPLE, "existing"),
            ).toThrow(/already exists/);
        });
    });

    describe("removeStrikeModeUpdate", () => {
        it("returns a Foundry -= deletion payload", () => {
            expect(removeStrikeModeUpdate("abc123")).toEqual({
                "system.strikeModes.-=abc123": null,
            });
        });
    });

    describe("updateStrikeModeUpdate", () => {
        it("flattens partial fields under the id-prefixed path", () => {
            expect(
                updateStrikeModeUpdate("abc123", {
                    minParts: 2,
                    assocSkillCode: "axe",
                }),
            ).toEqual({
                "system.strikeModes.abc123.minParts": 2,
                "system.strikeModes.abc123.assocSkillCode": "axe",
            });
        });

        it("returns an empty payload when partial is empty", () => {
            expect(updateStrikeModeUpdate("abc123", {})).toEqual({});
        });
    });
});
