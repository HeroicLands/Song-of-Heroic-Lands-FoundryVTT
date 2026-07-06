import { describe, it, expect, vi, afterEach } from "vitest";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ContextMenuEntry } from "@src/apps/logic/ContextMenuEntry";
import { ACTOR_KIND } from "@src/utils/constants";
import { makeActorLogic } from "@tests/mocks/logicHarness";

/** Construct a StructureLogic against a plain-object StructureData. */
function makeStructure(
    fields: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeActorLogic(StructureLogic, ACTOR_KIND.STRUCTURE, fields, opts);
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("StructureLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object StructureData (no Foundry)", () => {
            const logic = makeStructure();
            expect(logic).toBeInstanceOf(StructureLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.STRUCTURE);
        });

        it("defines the base postfinalize intrinsic action", () => {
            const logic = makeStructure();
            expect(logic.actions.has("postfinalize")).toBe(true);
        });

        it("resolves its owning actor from the data", () => {
            const logic = makeStructure({}, { id: "struct000000001" });
            expect(logic.actor).toBe((logic.data as any).actor);
            expect(logic.id).toBe("struct000000001");
        });
    });

    describe("getContextOptions", () => {
        it("yields one ContextMenuEntry per action", () => {
            const logic = makeStructure();
            const entries = logic.getContextOptions();
            expect(entries).toHaveLength(logic.actions.size());
            for (const entry of entries) {
                expect(entry).toBeInstanceOf(ContextMenuEntry);
            }
        });
    });

    describe("lifecycle", () => {
        it("initialize/evaluate/finalize are no-ops that do not throw", () => {
            const logic = makeStructure();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("StructureDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("has no additional fields beyond base actor schema");
    });

    it.todo("has kind set to ACTOR_KIND.STRUCTURE");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
