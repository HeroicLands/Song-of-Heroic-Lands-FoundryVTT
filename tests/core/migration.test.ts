import { describe, it, expect } from "vitest";
import { traitMeasuredUpdate } from "@src/core/foundry/migration";

describe("traitMeasuredUpdate — isNumeric → measured subtype (#532)", () => {
    it("migrates a numeric trait to the measured subtype and drops isNumeric", () => {
        expect(
            traitMeasuredUpdate({ isNumeric: true, subType: "physique" }),
        ).toEqual({
            "system.-=isNumeric": null,
            "system.subType": "measured",
        });
    });

    it("drops isNumeric on a descriptive trait without changing its subtype", () => {
        expect(
            traitMeasuredUpdate({ isNumeric: false, subType: "personality" }),
        ).toEqual({ "system.-=isNumeric": null });
    });

    it("is a no-op once the trait has already been migrated (no isNumeric key)", () => {
        expect(traitMeasuredUpdate({ subType: "measured" })).toBeNull();
        expect(traitMeasuredUpdate({})).toBeNull();
        expect(traitMeasuredUpdate(null)).toBeNull();
        expect(traitMeasuredUpdate(undefined)).toBeNull();
    });
});
