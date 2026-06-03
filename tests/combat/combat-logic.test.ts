import { describe, it, expect } from "vitest";
import { resolveGroupSeeding } from "@src/document/combat/combat-logic";

describe("resolveGroupSeeding", () => {
    it("creates a group for a single new combatant and assigns it", () => {
        const result = resolveGroupSeeding(
            [{ id: "c1", hasGroup: false, desiredName: "Opponents" }],
            [],
        );
        expect(result.groupsToCreate).toEqual(["Opponents"]);
        expect(result.assignments).toEqual([
            { combatantId: "c1", groupName: "Opponents" },
        ]);
    });

    it("creates a new group only once when several combatants want the same name", () => {
        const result = resolveGroupSeeding(
            [
                { id: "c1", hasGroup: false, desiredName: "Heroes" },
                { id: "c2", hasGroup: false, desiredName: "Heroes" },
                { id: "c3", hasGroup: false, desiredName: "Heroes" },
            ],
            [],
        );
        expect(result.groupsToCreate).toEqual(["Heroes"]);
        expect(result.assignments).toEqual([
            { combatantId: "c1", groupName: "Heroes" },
            { combatantId: "c2", groupName: "Heroes" },
            { combatantId: "c3", groupName: "Heroes" },
        ]);
    });

    it("matches an existing group case-insensitively without creating a new one", () => {
        const result = resolveGroupSeeding(
            [{ id: "c1", hasGroup: false, desiredName: "heroes" }],
            [{ id: "g1", name: "Heroes" }],
        );
        expect(result.groupsToCreate).toEqual([]);
        // Resolves to the existing group's name as stored.
        expect(result.assignments).toEqual([
            { combatantId: "c1", groupName: "Heroes" },
        ]);
    });

    it("deduplicates new names case-insensitively across the batch", () => {
        const result = resolveGroupSeeding(
            [
                { id: "c1", hasGroup: false, desiredName: "Bandits" },
                { id: "c2", hasGroup: false, desiredName: "bandits" },
            ],
            [],
        );
        expect(result.groupsToCreate).toEqual(["Bandits"]);
        expect(result.assignments).toEqual([
            { combatantId: "c1", groupName: "Bandits" },
            { combatantId: "c2", groupName: "Bandits" },
        ]);
    });

    it("falls back to Opponents when the desired name is empty or missing", () => {
        const result = resolveGroupSeeding(
            [
                { id: "c1", hasGroup: false, desiredName: "" },
                { id: "c2", hasGroup: false, desiredName: undefined },
            ],
            [],
        );
        expect(result.groupsToCreate).toEqual(["Opponents"]);
        expect(result.assignments).toEqual([
            { combatantId: "c1", groupName: "Opponents" },
            { combatantId: "c2", groupName: "Opponents" },
        ]);
    });

    it("skips combatants that already have a group", () => {
        const result = resolveGroupSeeding(
            [
                { id: "c1", hasGroup: true, desiredName: "Heroes" },
                { id: "c2", hasGroup: false, desiredName: "Villains" },
            ],
            [],
        );
        expect(result.groupsToCreate).toEqual(["Villains"]);
        expect(result.assignments).toEqual([
            { combatantId: "c2", groupName: "Villains" },
        ]);
    });

    it("returns nothing to do when there are no ungrouped combatants", () => {
        const result = resolveGroupSeeding(
            [{ id: "c1", hasGroup: true, desiredName: "Heroes" }],
            [{ id: "g1", name: "Heroes" }],
        );
        expect(result.groupsToCreate).toEqual([]);
        expect(result.assignments).toEqual([]);
    });
});
