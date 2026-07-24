import { describe, it, expect, vi } from "vitest";
import { MiscGearLogic } from "@src/document/item/logic/MiscGearLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { BodyStructure } from "@src/entity/body/BodyStructure";
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

        it("defines the toggleCarried intrinsic action", () => {
            const logic = makeGear();
            expect(logic.actions.has("toggleCarried")).toBe(true);
            expect(logic.actions.has("editDocument")).toBe(true);
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

        it("leaves containedIn undefined", () => {
            const logic = makeGear();
            logic.initialize();
            expect(logic.containedIn).toBeUndefined();
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

        it("leaves containedIn undefined when the container is not found", () => {
            const actor = makeMockActor();
            const logic = makeGear(
                { containerId: "missing000000001" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.containedIn).toBeUndefined();
        });

        it("leaves containedIn undefined when the item has no actor", () => {
            const logic = makeGear({ containerId: "containerid00001" });
            logic.initialize();
            logic.evaluate();
            expect(logic.containedIn).toBeUndefined();
        });
    });

    describe("intrinsic executors", () => {
        it("toggleCarried - flips system.isCarried from false to true", async () => {
            const logic = makeGear({ isCarried: false });
            await logic.toggleCarried({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isCarried": true,
            });
        });

        it("toggleCarried - flips system.isCarried from true to false", async () => {
            const logic = makeGear({ isCarried: true });
            await logic.toggleCarried({} as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.isCarried": false,
            });
        });
    });

    describe("heldLimbImpairments (#628)", () => {
        const GEAR_ID = "item0000000mock";

        /**
         * A gear logic whose being holds it in the given parts. `bpi` stands in
         * for {@link BeingLogic.bodyPartImpairments}; when omitted the being
         * cannot derive per-part impairment (an incorporeal actor).
         */
        function makeGearHeldBy(
            heldItemIds: Array<string | null>,
            bpi?: (parts: readonly any[]) => any[],
        ) {
            const actor = makeMockActor();
            const parts = heldItemIds.map((id, i) => ({
                heldItem: id ? { id } : undefined,
                index: i,
            }));
            const being: any = { body: { structure: { parts } } };
            if (bpi) being.bodyPartImpairments = bpi;
            actor.logic = being;
            const logic = makeGear({}, { actor, id: GEAR_ID });
            logic.initialize();
            return { logic };
        }

        it("returns each holding part's impairment, resolved via the being", () => {
            // A realistic stub: one impairment per part passed in.
            const bpi = vi.fn((parts: readonly any[]) =>
                parts.map(() => ({ usable: true, impairment: -5 })),
            );
            const { logic } = makeGearHeldBy([GEAR_ID, null], bpi);
            expect(logic.heldLimbImpairments).toEqual([
                { usable: true, impairment: -5 },
            ]);
            // Derives from the holding part only (heldBy), not every body part.
            expect(bpi).toHaveBeenCalledTimes(1);
            expect(bpi.mock.calls[0][0]).toHaveLength(1);
        });

        it("is empty when nothing holds the item", () => {
            const bpi = vi.fn((parts: readonly any[]) =>
                parts.map(() => ({ usable: true, impairment: -5 })),
            );
            const { logic } = makeGearHeldBy([null, null], bpi);
            expect(logic.heldLimbImpairments).toEqual([]);
        });

        it("is empty when the actor cannot derive part impairment", () => {
            const { logic } = makeGearHeldBy([GEAR_ID]); // no bodyPartImpairments
            expect(logic.heldLimbImpairments).toEqual([]);
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
