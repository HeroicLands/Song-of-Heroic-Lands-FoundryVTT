import { describe, it, expect } from "vitest";
import {
    getGroupStancesForGroup,
    allyGroups,
    enemyGroups,
    withGroupStanceSet,
    withGroupRemoved,
} from "@src/document/combat/combat-logic";
import { GROUP_STANCE } from "@src/utils/constants";

const ALLY = GROUP_STANCE.ALLY;
const ENEMY = GROUP_STANCE.ENEMY;
const NEUTRAL = GROUP_STANCE.NEUTRAL;

describe("getGroupStancesForGroup", () => {
    it("returns stances for an existing group", () => {
        const stances = { red: { blue: ENEMY, green: ALLY } };
        expect(getGroupStancesForGroup(stances, "red")).toEqual({
            blue: ENEMY,
            green: ALLY,
        });
    });

    it("returns empty object for unknown group", () => {
        const stances = {};
        expect(getGroupStancesForGroup(stances, "unknown")).toEqual({});
    });
});

describe("allyGroups", () => {
    it("returns only ally-stanced groups", () => {
        const stances = { red: { blue: ALLY, green: ENEMY, yellow: ALLY } };
        expect(allyGroups(stances, "red")).toEqual(
            expect.arrayContaining(["blue", "yellow"]),
        );
        expect(allyGroups(stances, "red")).toHaveLength(2);
    });

    it("excludes enemy and neutral groups", () => {
        const stances = { red: { blue: ENEMY, green: NEUTRAL } };
        expect(allyGroups(stances, "red")).toEqual([]);
    });

    it("returns empty array for unknown group", () => {
        expect(allyGroups({}, "unknown")).toEqual([]);
    });
});

describe("enemyGroups", () => {
    it("returns only enemy-stanced groups", () => {
        const stances = { red: { blue: ENEMY, green: ALLY, yellow: ENEMY } };
        expect(enemyGroups(stances, "red")).toEqual(
            expect.arrayContaining(["blue", "yellow"]),
        );
        expect(enemyGroups(stances, "red")).toHaveLength(2);
    });

    it("excludes ally and neutral groups", () => {
        const stances = { red: { blue: ALLY, green: NEUTRAL } };
        expect(enemyGroups(stances, "red")).toEqual([]);
    });

    it("returns empty array for unknown group", () => {
        expect(enemyGroups({}, "unknown")).toEqual([]);
    });
});

describe("withGroupStanceSet", () => {
    it("adds a new stance entry", () => {
        const stances = {};
        const result = withGroupStanceSet(stances, "red", "blue", ALLY);
        expect(result.red?.blue).toBe(ALLY);
    });

    it("overwrites an existing stance", () => {
        const stances = { red: { blue: ALLY } };
        const result = withGroupStanceSet(stances, "red", "blue", ENEMY);
        expect(result.red?.blue).toBe(ENEMY);
    });

    it("does not mutate the input", () => {
        const stances = { red: { blue: ALLY } };
        withGroupStanceSet(stances, "red", "blue", ENEMY);
        expect(stances.red.blue).toBe(ALLY);
    });

    it("preserves other groups unchanged", () => {
        const stances = { green: { yellow: NEUTRAL } };
        const result = withGroupStanceSet(stances, "red", "blue", ALLY);
        expect(result.green?.yellow).toBe(NEUTRAL);
    });
});

describe("withGroupRemoved", () => {
    it("removes the specified group", () => {
        const stances = { red: { blue: ALLY }, green: { yellow: NEUTRAL } };
        const result = withGroupRemoved(stances, "red");
        expect(result.red).toBeUndefined();
        expect(result.green).toBeDefined();
    });

    it("is a no-op for a missing group", () => {
        const stances = { red: { blue: ALLY } };
        const result = withGroupRemoved(stances, "nonexistent");
        expect(result).toEqual({ red: { blue: ALLY } });
    });

    it("does not mutate the input", () => {
        const stances = { red: { blue: ALLY } };
        withGroupRemoved(stances, "red");
        expect(stances.red).toBeDefined();
    });
});
