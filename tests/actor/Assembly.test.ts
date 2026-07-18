import { describe, it, expect, vi, afterEach } from "vitest";
import { AssemblyLogic } from "@src/document/actor/logic/AssemblyLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ACTOR_KIND } from "@src/utils/constants";
import { makeActorLogic, makeMockItem } from "@tests/mocks/logicHarness";

/** Construct an AssemblyLogic against a plain-object AssemblyData. */
function makeAssembly(
    fields: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeActorLogic(AssemblyLogic, ACTOR_KIND.ASSEMBLY, fields, opts);
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("AssemblyLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object AssemblyData (no Foundry)", () => {
            const logic = makeAssembly();
            expect(logic).toBeInstanceOf(AssemblyLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.ASSEMBLY);
        });

        it("defines the base edit/delete intrinsic actions", () => {
            const logic = makeAssembly();
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("item container", () => {
        it("holds embedded items through the actor's items collection", () => {
            const logic = makeAssembly();
            const actor: any = logic.actor;
            const plate = makeMockItem("armorgear", {
                id: "plate0000000001",
                actor,
            });
            actor.items.set(plate.id, plate);
            expect(actor.items.get("plate0000000001")).toBe(plate);
            expect(actor.items.some((i: any) => i.type === "armorgear")).toBe(
                true,
            );
        });
    });

    describe("lifecycle", () => {
        it("initialize/evaluate/finalize are no-ops that do not throw", () => {
            const logic = makeAssembly();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("AssemblyDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("has no additional fields beyond base actor schema");
    });

    it.todo("has kind set to ACTOR_KIND.ASSEMBLY");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
