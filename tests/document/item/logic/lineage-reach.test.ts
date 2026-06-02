import { describe, it, expect } from "vitest";
import { actorLineageReach } from "@src/document/item/logic/lineage-reach";

describe("actorLineageReach", () => {
    const actorWithReach = (reach: number) =>
        ({
            name: "Test",
            items: [
                { type: "lineage", logic: { reach: { effective: reach } } },
            ],
        }) as any;

    it("returns the lineage's effective reach", () => {
        expect(actorLineageReach(actorWithReach(3))).toBe(3);
        expect(actorLineageReach(actorWithReach(0))).toBe(0);
    });

    it("returns 0 (no-op) when the actor has no Lineage item", () => {
        // A non-Being (Structure, Vehicle, …) has no lineage — not an error.
        expect(actorLineageReach({ name: "Keep", items: [] } as any)).toBe(0);
    });

    it("returns 0 for a null/undefined actor", () => {
        expect(actorLineageReach(null)).toBe(0);
        expect(actorLineageReach(undefined)).toBe(0);
    });

    it("finds the Lineage among other item types", () => {
        const actor = {
            name: "Test",
            items: [
                { type: "skill", logic: {} },
                { type: "lineage", logic: { reach: { effective: 2 } } },
            ],
        } as any;
        expect(actorLineageReach(actor)).toBe(2);
    });
});
