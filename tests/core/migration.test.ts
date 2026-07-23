import { describe, it, expect } from "vitest";
import { legacyTraitError } from "@src/core/foundry/migration";

describe("legacyTraitError — retired trait item type is unrecognized (#651)", () => {
    it("returns null for a non-trait document", () => {
        expect(legacyTraitError({ type: "trauma", name: "x" })).toBeNull();
        expect(legacyTraitError({ type: "skill" })).toBeNull();
        expect(legacyTraitError(null)).toBeNull();
        expect(legacyTraitError(undefined)).toBeNull();
    });

    it("flags a legacy trait document as an unrecognized retired type", () => {
        const err = legacyTraitError({ type: "trait", name: "Bloodlust" });
        expect(err).toContain('Unrecognized item type "trait"');
        expect(err).toContain('"Bloodlust"');
        expect(err).toContain("retired");
        expect(err).toContain("not migrated automatically");
    });

    it("never auto-converts — it only reports (no trauma/attribute payload)", () => {
        // The message tells the GM to resolve it by hand; it is not a conversion plan.
        const err = legacyTraitError({ type: "trait", name: "X" }) as string;
        expect(err).toContain("by hand");
    });

    it("falls back to the id, then to (unknown), when the name is absent", () => {
        expect(legacyTraitError({ type: "trait", id: "abc123" })).toContain(
            "[abc123]",
        );
        expect(legacyTraitError({ type: "trait" })).toContain("(unknown)");
    });

    it("also fires when Foundry fell the document back to base (type on _source)", () => {
        expect(
            legacyTraitError({
                type: "base",
                name: "Legacy",
                _source: { type: "trait" },
            }),
        ).toContain('Unrecognized item type "trait"');
        // A genuine base item is not flagged.
        expect(
            legacyTraitError({ type: "base", _source: { type: "base" } }),
        ).toBeNull();
    });
});
