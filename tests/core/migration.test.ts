import { describe, it, expect } from "vitest";
import { planTraitMigration } from "@src/core/foundry/migration";

describe("planTraitMigration — retire the trait item type (#651)", () => {
    it("returns null for a non-trait source", () => {
        expect(planTraitMigration({ type: "skill", system: {} })).toBeNull();
        expect(planTraitMigration(null)).toBeNull();
        expect(planTraitMigration(undefined)).toBeNull();
    });

    it("deletes a measured trait (now modeled on the Being)", () => {
        expect(
            planTraitMigration({
                type: "trait",
                system: { subType: "measured" },
            }),
        ).toEqual({ action: "delete" });
    });

    it("deletes a legacy numeric trait (pre-#532 isNumeric flag)", () => {
        expect(
            planTraitMigration({
                type: "trait",
                system: { subType: "physique", isNumeric: true },
            }),
        ).toEqual({ action: "delete" });
    });

    it("replaces a descriptive personality trait with a psycond trauma", () => {
        const plan = planTraitMigration({
            type: "trait",
            name: "Bloodlust",
            img: "icons/x.svg",
            folder: "F1",
            flags: { sohl: { docArchetype: 0 } },
            system: {
                subType: "personality",
                intensity: "impulse",
                notes: "n",
            },
        });
        expect(plan).toEqual({
            action: "replace",
            create: {
                name: "Bloodlust",
                type: "trauma",
                img: "icons/x.svg",
                folder: "F1",
                flags: { sohl: { docArchetype: 0 } },
                system: {
                    subType: "psycond",
                    category: "impulse",
                    notes: "n",
                },
            },
        });
    });

    it("replaces a descriptive physique trait with a physcond trauma", () => {
        const plan = planTraitMigration({
            type: "trait",
            name: "Favored Parts",
            img: "icons/hands.svg",
            system: { subType: "physique", intensity: "trait" },
        });
        expect(plan).toEqual({
            action: "replace",
            create: {
                name: "Favored Parts",
                type: "trauma",
                img: "icons/hands.svg",
                system: { subType: "physcond", category: "trait" },
            },
        });
    });

    it("maps intensity to the target subtype's category enum", () => {
        // personality → psycond (quirk / impulse / disorder)
        const psy = (intensity: string) =>
            (
                planTraitMigration({
                    type: "trait",
                    name: "x",
                    system: { subType: "personality", intensity },
                }) as any
            ).create.system.category;
        expect(psy("benign")).toBe("quirk");
        expect(psy("trait")).toBe("quirk");
        expect(psy("impulse")).toBe("impulse");
        expect(psy("disorder")).toBe("disorder");

        // physique → physcond (trait / impediment / debility)
        const phy = (intensity: string) =>
            (
                planTraitMigration({
                    type: "trait",
                    name: "x",
                    system: { subType: "physique", intensity },
                }) as any
            ).create.system.category;
        expect(phy("benign")).toBe("trait");
        expect(phy("trait")).toBe("trait");
        expect(phy("impulse")).toBe("impediment");
        expect(phy("disorder")).toBe("debility");
    });
});
