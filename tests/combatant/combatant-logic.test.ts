import { describe, it, expect } from "vitest";
import {
    areCombatantsEnemies,
    THREAT_NEGATING_STATUSES,
} from "@src/document/combatant/logic/SohlCombatantLogic";
import { makeCombatantLogic } from "@tests/mocks/logicHarness";

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
    /**
     * Build a subject/candidate pair for `subject.isThreatening(candidate)`.
     * Defaults describe an alive, conscious, visible enemy in reach:
     * both combatants are ungrouped (so `areCombatantsEnemies` treats them as
     * enemies), the candidate is not defeated/hidden and carries no
     * threat-negating status, and its `reaches()` is stubbed to `true` (the
     * real reach test is scene-coupled and covered elsewhere).
     */
    function makePair(
        candidateOverrides: {
            groupId?: string | null;
            isDefeated?: boolean;
            statuses?: Set<string>;
            isHidden?: boolean;
            reaches?: boolean;
        } = {},
    ) {
        const subject = makeCombatantLogic();
        const candidate = makeCombatantLogic();
        const {
            groupId = null,
            isDefeated = false,
            statuses = new Set<string>(),
            isHidden = false,
            reaches = true,
        } = candidateOverrides;
        candidate.data.groupId = groupId;
        candidate.data.isDefeated = isDefeated;
        candidate.data.statuses = statuses;
        candidate.data.isHidden = isHidden;
        // `isThreatening` consults `candidate.reaches(subject)`; the underlying
        // grid-distance check needs a live scene, so stub the reach outcome.
        candidate.reaches = () => reaches;
        return { subject, candidate };
    }

    it("returns true for an alive, conscious, capable, visible enemy in reach", () => {
        const { subject, candidate } = makePair();
        expect(subject.isThreatening(candidate)).toBe(true);
    });

    it("returns false when not an enemy (same group)", () => {
        const { subject, candidate } = makePair({ groupId: "red" });
        subject.data.groupId = "red";
        expect(subject.isThreatening(candidate)).toBe(false);
    });

    it("returns false against itself", () => {
        const { subject } = makePair();
        subject.reaches = () => true;
        expect(subject.isThreatening(subject)).toBe(false);
    });

    it("returns false when defeated", () => {
        const { subject, candidate } = makePair({ isDefeated: true });
        expect(subject.isThreatening(candidate)).toBe(false);
    });

    it("returns false when incapacitated (threat-negating status)", () => {
        const { subject, candidate } = makePair({
            statuses: new Set([THREAT_NEGATING_STATUSES[0]]),
        });
        expect(subject.isThreatening(candidate)).toBe(false);
    });

    it("returns false when hidden", () => {
        const { subject, candidate } = makePair({ isHidden: true });
        expect(subject.isThreatening(candidate)).toBe(false);
    });

    it("returns false when out of reach", () => {
        const { subject, candidate } = makePair({ reaches: false });
        expect(subject.isThreatening(candidate)).toBe(false);
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
