import { describe, it, expect, vi, afterEach } from "vitest";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ContextMenuEntry } from "@src/apps/logic/ContextMenuEntry";
import { ACTOR_KIND, MOVEMENT_MEDIUM } from "@src/utils/constants";
import { makeActorLogic } from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

/** A minimal per-medium movement profile for base-actor movement tests. */
function profile(overrides: Record<string, unknown> = {}) {
    return {
        medium: MOVEMENT_MEDIUM.TERRESTRIAL,
        feetPerRound: 50,
        leaguesPerWatch: 5,
        encumbrance: "0",
        strMod: "0",
        disabled: false,
        ...overrides,
    };
}

/** Construct a StructureLogic against a plain-object StructureData. */
function makeStructure(fields: Record<string, unknown> = {}, opts: Record<string, unknown> = {}) {
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

        it("defines the base edit/delete intrinsic actions", () => {
            const logic = makeStructure();
            expect(logic.actions.has("editDocument")).toBe(true);
        });

        it("resolves its owning actor from the data", () => {
            const logic = makeStructure({}, { id: "struct000000001" });
            expect(logic.actor).toBe((logic.data as any).actor);
            expect(logic.id).toBe("struct000000001");
        });

        it("carries the base default health of 100/100 (no type-specific derivation yet)", () => {
            // Health lives on the base actor data model so every actor shows a
            // full token bar by default; only Being derives it down today.
            const logic = makeStructure();
            expect((logic.data as any).health).toEqual({
                value: 100,
                max: 100,
            });
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
        it("initialize/evaluate/finalize do not throw", () => {
            const logic = makeStructure();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });

    describe("base-actor movement", () => {
        it("selects a disabled NONE profile when the actor has no movement", () => {
            // A Structure defaults to currentMoveMedium NONE with no profiles —
            // a non-mover by data. The base logic still builds the modifiers.
            const logic = makeStructure();
            logic.initialize();
            expect(logic.moveProfile.medium).toBe(MOVEMENT_MEDIUM.NONE);
            expect(logic.moveProfile.disabled).toBe(true);
            expect(logic.feetPerRound.effective).toBe(0);
            expect(logic.leaguesPerWatch.effective).toBe(0);
        });

        it("selects the profile matching currentMoveMedium and seeds the move modifiers", () => {
            const logic = makeStructure({
                currentMoveMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
                movementProfiles: [profile()],
            });
            logic.initialize();
            expect(logic.moveProfile.medium).toBe(MOVEMENT_MEDIUM.TERRESTRIAL);
            expect(logic.moveProfile.disabled).toBe(false);
            expect(logic.feetPerRound.effective).toBe(50);
            expect(logic.leaguesPerWatch.effective).toBe(5);
        });

        it("falls back to a disabled profile when no profile matches the medium", () => {
            const logic = makeStructure({
                currentMoveMedium: MOVEMENT_MEDIUM.AQUATIC,
                movementProfiles: [profile()],
            });
            logic.initialize();
            expect(logic.moveProfile.disabled).toBe(true);
            expect(logic.feetPerRound.effective).toBe(0);
        });

        it("makeDefaultMedium persists the scoped medium to system.currentMoveMedium", async () => {
            const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
            const logic = makeStructure();
            await logic.makeDefaultMedium({
                scope: { medium: MOVEMENT_MEDIUM.AQUATIC },
            } as any);
            expect(logic.data.update).toHaveBeenCalledWith({
                "system.currentMoveMedium": MOVEMENT_MEDIUM.AQUATIC,
            });
            // The Profile-tab star names the medium, so it never prompts.
            expect(dlg).not.toHaveBeenCalled();
        });
    });

    /**
     * #1098 — the action is a normal, selectable ESSENTIAL action, but its
     * executor required `scope.medium`, which only the Profile-tab star
     * supplies. Invoked any other way it returned immediately: no dialog, no
     * notice, no change. Per the prefer-dialog rule it now offers the choice.
     */
    describe("makeDefaultMedium without a medium in scope (#1098)", () => {
        it("prompts with the actor's media and persists the chosen one", async () => {
            const dlg = vi
                .spyOn(FoundryHelpersMock, "dialog")
                .mockResolvedValue({ medium: MOVEMENT_MEDIUM.AQUATIC } as any);
            const logic = makeStructure({
                currentMoveMedium: MOVEMENT_MEDIUM.TERRESTRIAL,
                movementProfiles: [profile(), profile({ medium: MOVEMENT_MEDIUM.AQUATIC })],
            });

            await logic.makeDefaultMedium({ scope: {} } as any);

            expect(dlg).toHaveBeenCalledOnce();
            const spec = (dlg.mock.calls[0] as any)[0];
            // NONE is always offered (an actor can be made immobile), plus each
            // authored profile; the current medium is preselected.
            expect(Object.keys(spec.data.mediumChoices)).toEqual([
                MOVEMENT_MEDIUM.NONE,
                MOVEMENT_MEDIUM.TERRESTRIAL,
                MOVEMENT_MEDIUM.AQUATIC,
            ]);
            expect(spec.data.medium).toBe(MOVEMENT_MEDIUM.TERRESTRIAL);
            expect(logic.data.update).toHaveBeenCalledWith({
                "system.currentMoveMedium": MOVEMENT_MEDIUM.AQUATIC,
            });
        });

        it("a dismissed prompt changes nothing", async () => {
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue(null as any);
            const logic = makeStructure();
            await logic.makeDefaultMedium({ scope: {} } as any);
            expect(logic.data.update).not.toHaveBeenCalled();
        });

        it("an unknown medium submitted by the form changes nothing", async () => {
            vi.spyOn(FoundryHelpersMock, "dialog").mockResolvedValue({
                medium: "hyperspace",
            } as any);
            const logic = makeStructure();
            await logic.makeDefaultMedium({ scope: {} } as any);
            expect(logic.data.update).not.toHaveBeenCalled();
        });

        it("skipDialog cannot prompt, so it reports why nothing happened", async () => {
            const dlg = vi.spyOn(FoundryHelpersMock, "dialog");
            const warn = vi.spyOn(sohl.log, "uiWarn").mockImplementation(() => {});
            const logic = makeStructure();

            await logic.makeDefaultMedium({
                skipDialog: true,
                scope: {},
            } as any);

            expect(dlg).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledOnce();
            expect(logic.data.update).not.toHaveBeenCalled();
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
