import { describe, it, expect } from "vitest";
import { ProjectileGearLogic } from "@src/document/item/logic/ProjectileGearLogic";
import {
    IMPACT_ASPECT,
    ITEM_KIND,
    PROJECTILEGEAR_SUBTYPE,
} from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/**
 * Shared gear behavior is covered in Gear.test.ts; ProjectileGearLogic adds
 * only the impact declaration on top of GearLogic, so these tests cover
 * construction and the lifecycle running cleanly over projectile data.
 */
function projectileFields(overrides: Record<string, unknown> = {}) {
    return {
        quantity: 20,
        weightBase: 0.1,
        valueBase: 1,
        isCarried: true,
        isEquipped: false,
        qualityBase: 9,
        durabilityBase: 4,
        sharedWithCohortIds: [] as string[],
        containerId: null as string | null,
        subType: PROJECTILEGEAR_SUBTYPE.ARROW,
        impactBase: {
            overrideDice: false,
            overrideModifier: false,
            numDice: 1,
            die: 6,
            modifier: 1,
            aspect: IMPACT_ASPECT.PIERCING,
        },
        ...overrides,
    };
}

function makeProjectile(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        ProjectileGearLogic,
        ITEM_KIND.PROJECTILEGEAR,
        projectileFields(overrides),
        opts,
    );
}

describe("ProjectileGearLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object ProjectileGearData (no Foundry)", () => {
            const logic = makeProjectile();
            expect(logic).toBeInstanceOf(ProjectileGearLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.PROJECTILEGEAR);
        });

        it("inherits the gear intrinsic actions (no projectile-specific ones)", () => {
            const logic = makeProjectile();
            expect(logic.actions.has("setCarried")).toBe(true);
            expect(logic.actions.has("setNotCarried")).toBe(true);
            expect(logic.actions.has("postfinalize")).toBe(true);
        });
    });

    describe("lifecycle", () => {
        it("initialize / evaluate / finalize - run without error", () => {
            const logic = makeProjectile();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });

        it("exposes the persisted subType and impactBase via data", () => {
            const logic = makeProjectile();
            logic.initialize();
            expect(logic.data.subType).toBe(PROJECTILEGEAR_SUBTYPE.ARROW);
            expect(logic.data.impactBase.aspect).toBe(IMPACT_ASPECT.PIERCING);
            expect(logic.data.impactBase.numDice).toBe(1);
        });

        // ProjectileGearLogic declares `impact!: ImpactModifier` ("synthesized
        // from impactBase") but initialize() never assigns it — suspected
        // source bug; covered here as a todo until the synthesis exists.
        it.todo(
            "initialize - synthesizes the impact ImpactModifier from impactBase (currently never assigned)",
        );
    });
});

describe("ProjectileGearDataModel", () => {
    // The DataModel is Foundry-layer (implements ProjectileGearData via
    // Foundry's schema system); its schema is exercised in Foundry
    // integration, not in unit tests.
    describe("defineSchema", () => {
        it.todo("includes GearDataModel base schema fields");
        it.todo("defines subType with ProjectileGearSubTypes choices");
        it.todo(
            "defines impactBase with overrideDice/overrideModifier/numDice/die/modifier/aspect",
        );
    });
});
