import { describe, it, expect } from "vitest";
import { ArmorGearLogic } from "@src/document/item/logic/ArmorGearLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/**
 * Shared gear behavior (weight/value/quality/durability, carried state,
 * container resolution, cohort sharing) is covered in Gear.test.ts; these
 * tests cover only what ArmorGearLogic adds: per-aspect protection,
 * encumbrance, traits, and the coverage-location update helpers.
 */
function armorFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 1,
        weightBase: 8,
        valueBase: 60,
        isCarried: true,
        isWorn: true,
        qualityBase: 10,
        durabilityBase: 16,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        material: "leather",
        locations: {
            flexible: [] as string[],
            rigid: [] as string[],
        },
        protectionBase: { blunt: 2, edged: 4, piercing: 3, fire: 1 },
        encumbrance: 2,
        ...overrides,
    };
}

function makeArmor(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        ArmorGearLogic,
        ITEM_KIND.ARMORGEAR,
        armorFields(overrides),
        opts,
    );
}

describe("ArmorGearLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object ArmorGearData (no Foundry)", () => {
            const logic = makeArmor();
            expect(logic).toBeInstanceOf(ArmorGearLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.ARMORGEAR);
        });

        it("inherits the gear intrinsic actions plus the armor worn toggle", () => {
            const logic = makeArmor();
            expect(logic.actions.has("toggleCarried")).toBe(true);
            expect(logic.actions.has("toggleWorn")).toBe(true);
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("toggleWorn", () => {
        it("flips system.isWorn from false to true", async () => {
            const logic = makeArmor({ isWorn: false });
            await logic.toggleWorn({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isWorn": true,
            });
        });

        it("flips system.isWorn from true to false", async () => {
            const logic = makeArmor({ isWorn: true });
            await logic.toggleWorn({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isWorn": false,
            });
        });
    });

    describe("carried gate (#1097)", () => {
        it("makes toggleWorn unavailable while the armor is not carried", () => {
            const logic = makeArmor({ isCarried: false });
            const action = logic.actions.get("toggleWorn")!;
            expect(action.trigger(logic.item, undefined)).toBe(false);
        });

        it("makes toggleWorn available once the armor is carried", () => {
            const logic = makeArmor({ isCarried: true });
            const action = logic.actions.get("toggleWorn")!;
            expect(action.trigger(logic.item, undefined)).toBe(true);
        });

        it("keeps toggleCarried available while the armor is not carried", () => {
            const logic = makeArmor({ isCarried: false });
            const action = logic.actions.get("toggleCarried")!;
            expect(action.trigger(logic.item, undefined)).toBe(true);
        });

        it("reports toggleWorn as unavailable, with a reason, while not carried (#1135)", () => {
            const logic = makeArmor({ isCarried: false });
            const action = logic.actions.get("toggleWorn")!;
            expect(action.isAvailable).toBe(false);
            expect(action.unavailableReason).toBe(
                "SOHL.Gear.actionRequiresCarried",
            );
        });

        it("refuses to execute toggleWorn while the armor is not carried", async () => {
            const logic = makeArmor({ isCarried: false, isWorn: false });
            await logic.actions.get("toggleWorn")!.execute({} as any);
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("clears the worn state when the armor stops being carried", async () => {
            const logic = makeArmor({ isCarried: true, isWorn: true });
            await logic.toggleCarried({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isCarried": false,
                "system.isWorn": false,
            });
        });

        it("does not touch the worn state when the armor is picked up", async () => {
            const logic = makeArmor({ isCarried: false, isWorn: false });
            await logic.toggleCarried({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isCarried": true,
            });
        });
    });

    describe("initialize", () => {
        it("seeds per-aspect protection ValueModifiers from protectionBase", () => {
            const logic = makeArmor({
                protectionBase: { blunt: 5, edged: 7, piercing: 6, fire: 2 },
            });
            logic.initialize();
            expect(logic.protection.blunt).toBeInstanceOf(ValueModifier);
            expect(logic.protection.blunt.effective).toBe(5);
            expect(logic.protection.edged.effective).toBe(7);
            expect(logic.protection.piercing.effective).toBe(6);
            expect(logic.protection.fire.effective).toBe(2);
        });

        it("seeds encumbrance from the encumbrance field", () => {
            const logic = makeArmor({ encumbrance: 3 });
            logic.initialize();
            expect(logic.encumbrance).toBeInstanceOf(ValueModifier);
            expect(logic.encumbrance.effective).toBe(3);
        });

        it("resets traits to an empty object", () => {
            const logic = makeArmor();
            logic.initialize();
            expect(logic.traits).toEqual({});
        });
    });

    describe("lifecycle", () => {
        it("evaluate / finalize - run without error after initialize", () => {
            const logic = makeArmor();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });

    describe("array update helpers", () => {
        it("addFlexibleLocationUpdate - appends a new location", () => {
            const logic = makeArmor({
                locations: { flexible: ["chest"], rigid: [] },
            });
            expect(logic.addFlexibleLocationUpdate("abdomen")).toEqual({
                "system.locations.flexible": ["chest", "abdomen"],
            });
        });

        it("addFlexibleLocationUpdate - returns empty payload for a duplicate", () => {
            const logic = makeArmor({
                locations: { flexible: ["chest"], rigid: [] },
            });
            expect(logic.addFlexibleLocationUpdate("chest")).toEqual({});
        });

        it("removeFlexibleLocationUpdate - filters the location out", () => {
            const logic = makeArmor({
                locations: { flexible: ["chest", "abdomen"], rigid: [] },
            });
            expect(logic.removeFlexibleLocationUpdate("chest")).toEqual({
                "system.locations.flexible": ["abdomen"],
            });
        });

        it("addRigidLocationUpdate - appends a new location", () => {
            const logic = makeArmor({
                locations: { flexible: [], rigid: ["skull"] },
            });
            expect(logic.addRigidLocationUpdate("face")).toEqual({
                "system.locations.rigid": ["skull", "face"],
            });
        });

        it("addRigidLocationUpdate - returns empty payload for a duplicate", () => {
            const logic = makeArmor({
                locations: { flexible: [], rigid: ["skull"] },
            });
            expect(logic.addRigidLocationUpdate("skull")).toEqual({});
        });

        it("removeRigidLocationUpdate - filters the location out", () => {
            const logic = makeArmor({
                locations: { flexible: [], rigid: ["skull", "face"] },
            });
            expect(logic.removeRigidLocationUpdate("face")).toEqual({
                "system.locations.rigid": ["skull"],
            });
        });
    });
});

describe("ArmorGearDataModel", () => {
    // The DataModel is Foundry-layer (implements ArmorGearData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes GearDataModel base schema fields");
        it.todo("defines isWorn as BooleanField defaulting to false");
        it.todo("defines material as a StringField");
        it.todo(
            "defines locations.flexible and locations.rigid as arrays of strings",
        );
        it.todo(
            "defines protectionBase with blunt/edged/piercing/fire NumberFields",
        );
        it.todo("defines encumbrance as NumberField with min 0");
    });
});
