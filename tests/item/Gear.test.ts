import { describe, it, expect } from "vitest";
import { MiscGearLogic } from "@src/document/item/logic/MiscGearLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";
import {
    makeItemLogic,
    makeMockActor,
    makeMockItem,
} from "@tests/mocks/logicHarness";

/**
 * GearLogic is abstract; MiscGearLogic adds no behavior of its own, so it
 * serves as the concrete class under test for the shared gear behavior.
 */
function gearFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 1,
        weightBase: 2.5,
        valueBase: 10,
        isCarried: true,
        isEquipped: false,
        qualityBase: 9,
        durabilityBase: 12,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        ...overrides,
    };
}

function makeGear(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        MiscGearLogic,
        ITEM_KIND.MISCGEAR,
        gearFields(overrides),
        opts,
    );
}

describe("GearLogic (via MiscGearLogic)", () => {
    describe("construction", () => {
        it("constructs against a plain-object GearData (no Foundry)", () => {
            const logic = makeGear();
            expect(logic).toBeInstanceOf(MiscGearLogic);
        });

        it("defines the setCarried / setNotCarried intrinsic actions", () => {
            const logic = makeGear();
            expect(logic.actions.has("setCarried")).toBe(true);
            expect(logic.actions.has("setNotCarried")).toBe(true);
            expect(logic.actions.has("postfinalize")).toBe(true);
        });
    });

    describe("initialize", () => {
        it("creates weight/value/quality/durability ValueModifiers seeded from base fields", () => {
            const logic = makeGear({
                weightBase: 3,
                valueBase: 25,
                qualityBase: 10,
                durabilityBase: 15,
            });
            logic.initialize();
            expect(logic.weight).toBeInstanceOf(ValueModifier);
            expect(logic.weight.effective).toBe(3);
            expect(logic.value.effective).toBe(25);
            expect(logic.quality.effective).toBe(10);
            expect(logic.durability.effective).toBe(15);
        });

        it("resets containedIn to null", () => {
            const logic = makeGear();
            logic.initialize();
            expect(logic.containedIn).toBeNull();
        });

        it("resolves sharedWithCohorts to [] when no ids are shared", () => {
            const logic = makeGear({ sharedWithCohortIds: [] });
            logic.initialize();
            expect(logic.sharedWithCohorts).toEqual([]);
        });
    });

    describe("evaluate", () => {
        it("resolves containedIn from containerId on the owning actor", () => {
            const actor = makeMockActor();
            const container = makeMockItem(ITEM_KIND.CONTAINERGEAR, {
                id: "containerid00001",
                actor,
            });
            const containerLogic = { isContainer: true };
            container.logic = containerLogic;
            actor.items.set(container.id, container);

            const logic = makeGear(
                { containerId: "containerid00001" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.containedIn).toBe(containerLogic);
        });

        it("leaves containedIn null when the container is not found", () => {
            const actor = makeMockActor();
            const logic = makeGear(
                { containerId: "missing000000001" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.containedIn).toBeNull();
        });

        it("leaves containedIn null when the item has no actor", () => {
            const logic = makeGear({ containerId: "containerid00001" });
            logic.initialize();
            logic.evaluate();
            expect(logic.containedIn).toBeNull();
        });
    });

    describe("intrinsic executors", () => {
        it("setCarried - updates system.isCarried to true", async () => {
            const logic = makeGear({ isCarried: false });
            await logic.setCarried({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isCarried": true,
            });
        });

        it("setNotCarried - updates system.isCarried to false", async () => {
            const logic = makeGear({ isCarried: true });
            await logic.setNotCarried({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isCarried": false,
            });
        });
    });

    describe("array update helpers", () => {
        it("addSharedCohortUpdate - appends a new cohort id", () => {
            const logic = makeGear({ sharedWithCohortIds: ["aaa"] });
            expect(logic.addSharedCohortUpdate("bbb")).toEqual({
                "system.sharedWithCohortIds": ["aaa", "bbb"],
            });
        });

        it("addSharedCohortUpdate - returns empty payload for a duplicate id", () => {
            const logic = makeGear({ sharedWithCohortIds: ["aaa"] });
            expect(logic.addSharedCohortUpdate("aaa")).toEqual({});
        });

        it("removeSharedCohortUpdate - filters the id out", () => {
            const logic = makeGear({ sharedWithCohortIds: ["aaa", "bbb"] });
            expect(logic.removeSharedCohortUpdate("aaa")).toEqual({
                "system.sharedWithCohortIds": ["bbb"],
            });
        });
    });
});

describe("GearDataModel", () => {
    // The DataModel is Foundry-layer (implements GearData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo(
            "defines quantity as integer NumberField with min 0, initial 1",
        );
        it.todo("defines weightBase as NumberField with min 0");
        it.todo("defines valueBase as NumberField with min 0");
        it.todo("defines isCarried as BooleanField defaulting to true");
        it.todo("defines isEquipped as BooleanField defaulting to false");
        it.todo("defines qualityBase as integer NumberField with min 0");
        it.todo("defines durabilityBase as integer NumberField with min 0");
        it.todo("defines visibleToCohort as BooleanField defaulting to false");
    });
});
