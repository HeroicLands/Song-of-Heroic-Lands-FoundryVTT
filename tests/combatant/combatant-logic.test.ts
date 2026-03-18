import { describe, it, expect } from "vitest";
import { expandAllyGroups } from "@src/document/combatant/combatant-logic";

describe("expandAllyGroups", () => {
    it("returns the same groups when no allies exist", () => {
        const myGroups = new Set(["red"]);
        const result = expandAllyGroups(myGroups, () => []);
        expect([...result]).toEqual(["red"]);
    });

    it("adds ally groups to the set", () => {
        const myGroups = new Set(["red"]);
        const allyGroupsFn = (group: string) =>
            group === "red" ? ["blue"] : [];
        const result = expandAllyGroups(myGroups, allyGroupsFn);
        expect(result.has("red")).toBe(true);
        expect(result.has("blue")).toBe(true);
    });

    it("handles multiple ally groups", () => {
        const myGroups = new Set(["red"]);
        const allyGroupsFn = (group: string) =>
            group === "red" ? ["blue", "green"] : [];
        const result = expandAllyGroups(myGroups, allyGroupsFn);
        expect(result.has("blue")).toBe(true);
        expect(result.has("green")).toBe(true);
        expect(result.size).toBe(3);
    });

    it("handles multiple input groups", () => {
        const myGroups = new Set(["red", "orange"]);
        const allyGroupsFn = (group: string) =>
            group === "red" ? ["blue"]
            : group === "orange" ? ["purple"]
            : [];
        const result = expandAllyGroups(myGroups, allyGroupsFn);
        expect(result.has("blue")).toBe(true);
        expect(result.has("purple")).toBe(true);
    });

    it("does not loop infinitely on mutual alliances (A allies B, B allies A)", () => {
        const myGroups = new Set(["red"]);
        const allyGroupsFn = (group: string) =>
            group === "red" ? ["blue"]
            : group === "blue" ? ["red"]
            : [];
        // Should terminate without infinite loop
        const result = expandAllyGroups(myGroups, allyGroupsFn);
        expect(result.has("red")).toBe(true);
        expect(result.has("blue")).toBe(true);
    });

    it("does not mutate the input set", () => {
        const myGroups = new Set(["red"]);
        expandAllyGroups(myGroups, () => ["blue"]);
        expect(myGroups.size).toBe(1);
        expect(myGroups.has("blue")).toBe(false);
    });

    it("returns a new Set instance", () => {
        const myGroups = new Set(["red"]);
        const result = expandAllyGroups(myGroups, () => []);
        expect(result).not.toBe(myGroups);
    });
});
