import { describe, it, expect } from "vitest";
import { ConcoctionGearLogic } from "@src/document/item/logic/ConcoctionGearLogic";
import {
    CONCOCTIONGEAR_POTENCY,
    CONCOCTIONGEAR_SUBTYPE,
    ITEM_KIND,
} from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/**
 * Shared gear behavior is covered in Gear.test.ts; ConcoctionGearLogic adds
 * only the strength declaration on top of GearLogic.
 */
function concoctionFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 1,
        weightBase: 0.5,
        valueBase: 30,
        isCarried: true,
        isEquipped: false,
        qualityBase: 9,
        durabilityBase: 2,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        subType: CONCOCTIONGEAR_SUBTYPE.MUNDANE,
        potency: CONCOCTIONGEAR_POTENCY.MILD,
        strength: 3,
        ...overrides,
    };
}

function makeConcoction(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        ConcoctionGearLogic,
        ITEM_KIND.CONCOCTIONGEAR,
        concoctionFields(overrides),
        opts,
    );
}

describe("ConcoctionGearLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object ConcoctionGearData (no Foundry)", () => {
            const logic = makeConcoction();
            expect(logic).toBeInstanceOf(ConcoctionGearLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.CONCOCTIONGEAR);
        });

        it("inherits the gear intrinsic actions (no concoction-specific ones)", () => {
            const logic = makeConcoction();
            expect(logic.actions.has("setCarried")).toBe(true);
            expect(logic.actions.has("setNotCarried")).toBe(true);
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("lifecycle", () => {
        it("initialize / evaluate / finalize - run without error", () => {
            const logic = makeConcoction();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });

        it("exposes the persisted subType, potency, and strength via data", () => {
            const logic = makeConcoction({ strength: 7 });
            logic.initialize();
            expect(logic.data.subType).toBe(CONCOCTIONGEAR_SUBTYPE.MUNDANE);
            expect(logic.data.potency).toBe(CONCOCTIONGEAR_POTENCY.MILD);
            expect(logic.data.strength).toBe(7);
        });

        // ConcoctionGearLogic declares `strength!: number` ("mirrored from
        // ConcoctionGearData.strength") but initialize() never assigns it —
        // suspected source bug; covered as a todo until the mirroring exists.
        it.todo(
            "initialize - mirrors strength from data.strength (currently never assigned)",
        );
    });
});

describe("ConcoctionGearDataModel", () => {
    // The DataModel is Foundry-layer (implements ConcoctionGearData via
    // Foundry's schema system); its schema is exercised in Foundry
    // integration, not in unit tests.
    describe("defineSchema", () => {
        it.todo("includes GearDataModel base schema fields");
        it.todo("defines subType with ConcoctionGearSubTypes choices");
        it.todo("defines potency with ConcoctionGearPotencies choices");
        it.todo("defines strength as integer NumberField with min 0");
    });
});
