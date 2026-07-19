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

        it("defines the setCarried / setNotCarried intrinsic actions", () => {
            const logic = makeGear();
            expect(logic.actions.has("setCarried")).toBe(true);
            expect(logic.actions.has("setNotCarried")).toBe(true);
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

        describe("setEquipped / setNotEquipped (#179)", () => {
            it("setEquipped writes system.isEquipped: true", async () => {
                const logic = makeGear({ isEquipped: false });
                await logic.setEquipped({} as any);
                expect(logic.item.update).toHaveBeenCalledWith({
                    "system.isEquipped": true,
                });
            });

            it("setNotEquipped writes system.isEquipped: false", async () => {
                const logic = makeGear({ isEquipped: true });
                await logic.setNotEquipped({} as any);
                expect(logic.item.update).toHaveBeenCalledWith({
                    "system.isEquipped": false,
                });
            });

            it("defineIntrinsicActions includes setEquipped and setNotEquipped", () => {
                const logic = makeGear();
                expect(logic.actions.has("setEquipped")).toBe(true);
                expect(logic.actions.has("setNotEquipped")).toBe(true);
            });
        });

        describe("holdItem / releaseItem (#179)", () => {
            // The full-array write (#247) sources canonical part data from
            // `being.data.body.structure.parts` and routes through the real
            // BodyStructure.setPartFieldsUpdate, so the mock provides both the
            // domain parts (for filtering) and canonical persisted parts. The
            // being's body is reached via `getActorBody(actorLogic)` and the
            // update is applied to the being document (`actorLogic.data.update`).
            function makeGearWithParts(
                partDefs: Array<{
                    canHoldItem: boolean;
                    heldItemId: string | null;
                }> = [],
            ) {
                const actor = makeMockActor();
                const bodyUpdate = vi.fn(async (d: any) => d);
                const gearId = "item0000000mock";
                const canonicalParts = partDefs.map((p, i) => ({
                    shortcode: `part${i}`,
                    roles: [],
                    canHoldItem: p.canHoldItem,
                    heldItemId: p.heldItemId,
                    probWeight: 1,
                    locations: [],
                }));
                const parts = partDefs.map((p, i) => ({
                    canHoldItem: p.canHoldItem,
                    heldItem: p.heldItemId ? { id: p.heldItemId } : undefined,
                    index: i,
                }));
                const being: any = {
                    data: {
                        update: bodyUpdate,
                        body: { structure: { parts: canonicalParts } },
                    },
                };
                being.body = {
                    structure: {
                        parts,
                        parent: being,
                        setPartFieldsUpdate:
                            BodyStructure.prototype.setPartFieldsUpdate,
                    },
                };
                actor.logic = being;
                const logic = makeGear({}, { actor, id: gearId });
                logic.initialize();
                return { logic, bodyUpdate, gearId, canonicalParts };
            }

            /** The parts from a full-array `system.body.structure.parts` write. */
            function writtenParts(bodyUpdate: any): any[] {
                expect(bodyUpdate).toHaveBeenCalledTimes(1);
                const payload = bodyUpdate.mock.calls[0][0];
                expect(Object.keys(payload)).toEqual([
                    "system.body.structure.parts",
                ]);
                return payload["system.body.structure.parts"];
            }

            it("holdItem assigns the first free canHoldItem part (whole array preserved)", async () => {
                const { logic, bodyUpdate, gearId } = makeGearWithParts([
                    { canHoldItem: true, heldItemId: null },
                    { canHoldItem: true, heldItemId: null },
                ]);
                await logic.holdItem({} as any);
                const parts = writtenParts(bodyUpdate);
                expect(parts).toHaveLength(2);
                expect(parts[0].heldItemId).toBe(gearId);
                expect(parts[0].shortcode).toBe("part0"); // fields retained
                expect(parts[1].heldItemId).toBe(null); // sibling untouched
            });

            it("holdItem skips parts where canHoldItem is false", async () => {
                const { logic, bodyUpdate, gearId } = makeGearWithParts([
                    { canHoldItem: false, heldItemId: null },
                    { canHoldItem: true, heldItemId: null },
                ]);
                await logic.holdItem({} as any);
                const parts = writtenParts(bodyUpdate);
                expect(parts).toHaveLength(2);
                expect(parts[0].heldItemId).toBe(null);
                expect(parts[1].heldItemId).toBe(gearId);
            });

            it("holdItem does nothing when no free parts exist", async () => {
                const { bodyUpdate } = makeGearWithParts([
                    { canHoldItem: true, heldItemId: "other-item-000" },
                ]);
                const logic = makeGearWithParts([
                    { canHoldItem: true, heldItemId: "other-item-000" },
                ]).logic;
                await logic.holdItem({} as any);
                expect(bodyUpdate).not.toHaveBeenCalled();
            });

            it("holdItem does nothing when the being is incorporeal (no body)", async () => {
                const actor = makeMockActor();
                actor.logic = { logicTypes: {} };
                const logic = makeGear({}, { actor });
                logic.initialize();
                await logic.holdItem({} as any);
                expect(logic.item.update).not.toHaveBeenCalled();
            });

            it("releaseItem clears heldItemId on all parts holding this gear", async () => {
                const ownId = "item0000000mock";
                const { logic, bodyUpdate } = makeGearWithParts([
                    { canHoldItem: true, heldItemId: ownId },
                    { canHoldItem: true, heldItemId: ownId },
                ]);
                await logic.releaseItem({} as any);
                const parts = writtenParts(bodyUpdate);
                expect(parts).toHaveLength(2);
                expect(parts[0].heldItemId).toBe(null);
                expect(parts[1].heldItemId).toBe(null);
                expect(parts[0].shortcode).toBe("part0"); // fields retained
            });

            it("releaseItem does nothing when no parts hold this item", async () => {
                const { logic, bodyUpdate } = makeGearWithParts([
                    { canHoldItem: true, heldItemId: null },
                ]);
                await logic.releaseItem({} as any);
                expect(bodyUpdate).not.toHaveBeenCalled();
            });

            it("releaseItem does nothing when the being is incorporeal (no body)", async () => {
                const actor = makeMockActor();
                actor.logic = { logicTypes: {} };
                const logic = makeGear({}, { actor });
                logic.initialize();
                await logic.releaseItem({} as any);
                expect(logic.item.update).not.toHaveBeenCalled();
            });

            it("defineIntrinsicActions includes holdItem and releaseItem", () => {
                const logic = makeGear();
                expect(logic.actions.has("holdItem")).toBe(true);
                expect(logic.actions.has("releaseItem")).toBe(true);
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
