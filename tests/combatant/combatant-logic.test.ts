import { describe, it, expect } from "vitest";
import {
    areCombatantsEnemies,
    isThreatening,
    THREAT_NEGATING_STATUSES,
} from "@src/document/combatant/logic/CombatantLogic";

describe("areCombatantsEnemies", () => {
    it("returns false when comparing a combatant to itself", () => {
        expect(areCombatantsEnemies("red", "red", true)).toBe(false);
        expect(areCombatantsEnemies("red", "blue", true)).toBe(false);
    });

    it("returns false for the same non-null group", () => {
        expect(areCombatantsEnemies("red", "red", false)).toBe(false);
    });

    it("returns true for different groups", () => {
        expect(areCombatantsEnemies("red", "blue", false)).toBe(true);
    });

    it("treats a missing group on either side as enemy (defensive)", () => {
        expect(areCombatantsEnemies(null, "blue", false)).toBe(true);
        expect(areCombatantsEnemies("red", null, false)).toBe(true);
        expect(areCombatantsEnemies(null, null, false)).toBe(true);
        expect(areCombatantsEnemies(undefined, undefined, false)).toBe(true);
    });

    it("is symmetric", () => {
        expect(areCombatantsEnemies("red", "blue", false)).toBe(
            areCombatantsEnemies("blue", "red", false),
        );
        expect(areCombatantsEnemies("red", "red", false)).toBe(
            areCombatantsEnemies("red", "red", false),
        );
    });
});

describe("isThreatening", () => {
    const base = {
        isEnemy: true,
        isDefeated: false,
        isIncapacitated: false,
        isHidden: false,
        reaches: true,
    };

    it("returns true for an alive, conscious, capable, visible enemy in reach", () => {
        expect(isThreatening(base)).toBe(true);
    });

    it("returns false when not an enemy", () => {
        expect(isThreatening({ ...base, isEnemy: false })).toBe(false);
    });

    it("returns false when defeated", () => {
        expect(isThreatening({ ...base, isDefeated: true })).toBe(false);
    });

    it("returns false when incapacitated", () => {
        expect(isThreatening({ ...base, isIncapacitated: true })).toBe(false);
    });

    it("returns false when hidden", () => {
        expect(isThreatening({ ...base, isHidden: true })).toBe(false);
    });

    it("returns false when out of reach", () => {
        expect(isThreatening({ ...base, reaches: false })).toBe(false);
    });
});

describe("THREAT_NEGATING_STATUSES", () => {
    it("uses Foundry's canonical ids (stun, not stunned) and omits prone", () => {
        expect(THREAT_NEGATING_STATUSES).toContain("stun");
        expect(THREAT_NEGATING_STATUSES).not.toContain("stunned");
        expect(THREAT_NEGATING_STATUSES).not.toContain("prone");
        expect([...THREAT_NEGATING_STATUSES]).toEqual([
            "unconscious",
            "sleep",
            "stun",
            "restrain",
            "paralysis",
            "frozen",
        ]);
    });
});
