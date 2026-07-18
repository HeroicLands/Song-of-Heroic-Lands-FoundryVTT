import { describe, it, expect } from "vitest";
import { ContainerGearLogic } from "@src/document/item/logic/ContainerGearLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/**
 * Shared gear behavior is covered in Gear.test.ts; ContainerGearLogic adds
 * only the maxCapacity modifier on top of GearLogic.
 */
function containerFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 1,
        weightBase: 2,
        valueBase: 15,
        isCarried: true,
        isEquipped: false,
        qualityBase: 9,
        durabilityBase: 10,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        maxCapacityBase: 50,
        ...overrides,
    };
}

function makeContainer(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        ContainerGearLogic,
        ITEM_KIND.CONTAINERGEAR,
        containerFields(overrides),
        opts,
    );
}

describe("ContainerGearLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object ContainerGearData (no Foundry)", () => {
            const logic = makeContainer();
            expect(logic).toBeInstanceOf(ContainerGearLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.CONTAINERGEAR);
        });

        it("inherits the gear intrinsic actions (no container-specific ones)", () => {
            const logic = makeContainer();
            expect(logic.actions.has("setCarried")).toBe(true);
            expect(logic.actions.has("setNotCarried")).toBe(true);
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("initialize", () => {
        it("seeds maxCapacity from maxCapacityBase", () => {
            const logic = makeContainer({ maxCapacityBase: 80 });
            logic.initialize();
            expect(logic.maxCapacity).toBeInstanceOf(ValueModifier);
            expect(logic.maxCapacity.base).toBe(80);
            expect(logic.maxCapacity.effective).toBe(80);
        });
    });

    describe("lifecycle", () => {
        it("evaluate / finalize - run without error after initialize", () => {
            const logic = makeContainer();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("ContainerGearDataModel", () => {
    // The DataModel is Foundry-layer (implements ContainerGearData via
    // Foundry's schema system); its schema is exercised in Foundry
    // integration, not in unit tests.
    describe("defineSchema", () => {
        it.todo("includes GearDataModel base schema fields");
        it.todo("defines maxCapacityBase as NumberField with min 0");
    });
});
