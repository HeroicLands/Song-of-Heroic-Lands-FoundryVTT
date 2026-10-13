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

        it("carries the harness Health seed before lifecycle derivation", () => {
            // The harness supplies the common actor Health seed; the Structure
            // replaces it from authored maxHealth during preparation.
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
     * The action is a normal, selectable ESSENTIAL action, but its
     * executor required `scope.medium`, which only the Profile-tab star
     * supplies. Invoked any other way it returned immediately: no dialog, no
     * notice, no change. Per the prefer-dialog rule it now offers the choice.
     */
    describe("makeDefaultMedium without a medium in scope", () => {
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
        it.todo("declares authored Health, occupant and cargo capacities and occupants");
    });

    it.todo("has kind set to ACTOR_KIND.STRUCTURE");
    it.todo("has correct LOCALIZATION_PREFIXES");
});

describe("Structure derived state", () => {
    it("uses authored Health and only physical Injury severity", () => {
        const logic = makeStructure({
            maxHealth: 20,
            occupantCapacity: 0,
            cargoCapacity: 0,
            occupants: [],
        });
        (logic.data as any).actor.itemTypes = {
            trauma: [
                { logic: { data: { subType: "injury", levelBase: 2 }, level: { effective: 4 } } },
                { logic: { data: { subType: "fear", levelBase: 8 }, level: { effective: 8 } } },
            ],
        };
        logic.initialize();
        logic.evaluate();
        logic.finalize();
        expect(logic.data.health).toEqual({ value: 16, max: 20 });
        expect(logic.structuralDamage).toBe(4);
        expect(logic.data.update).not.toHaveBeenCalled();
    });
    it("floors remaining Health and handles empty structures without invented defaults", () => {
        const logic = makeStructure({ maxHealth: 0, occupants: [] });
        logic.initialize();
        logic.evaluate();
        logic.finalize();
        expect(logic.data.health).toEqual({ value: 0, max: 0 });
        expect(logic.structuralDamage).toBe(0);
    });
    it("counts cargo by effective weight times quantity and warns without blocking", () => {
        const logic = makeStructure({ maxHealth: 10, cargoCapacity: 5, occupants: [] });
        (logic.data as any).actor.itemTypes = {
            miscgear: [
                { logic: { data: { weightBase: 1, quantity: 3 }, weight: { effective: 2 } } },
            ],
        };
        logic.initialize();
        logic.evaluate();
        logic.finalize();
        expect(logic.cargoWeight).toBe(6);
        expect(logic.cargoOverCapacity).toBe(true);
        expect(logic.data.update).not.toHaveBeenCalled();
    });
});

describe("Structure occupancy", () => {
    it("counts resolved people and cohort members, keeping missing rows visible", () => {
        const person = { data: { kind: "being", uuid: "Actor.person" } };
        const cohort = {
            data: { kind: "cohort" },
            memberLogics: [person, { data: { kind: "being", uuid: "Actor.other" } }],
        };
        vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockImplementation(
            (ref: string) =>
                (
                    ({
                        person: { logic: person, name: "Person" },
                        group: { logic: cohort, name: "Group" },
                    }) as any
                )[ref],
        );
        const logic = makeStructure({
            maxHealth: 12,
            occupantCapacity: 1,
            cargoCapacity: 0,
            occupants: ["person", "group", "missing"].map((actorCodeOrUuid) => ({
                actorCodeOrUuid,
                role: "passenger",
                title: null,
            })),
        });
        logic.initialize();
        logic.evaluate();
        logic.finalize();
        expect(logic.occupantCount).toBe(2);
        expect(logic.occupantsOverCapacity).toBe(true);
        expect(logic.occupantRows).toHaveLength(3);
        expect(logic.occupantRows[2].isResolved).toBe(false);
        expect(logic.data.update).not.toHaveBeenCalled();
    });
    it("recomputes Health and cargo after injuries or quantities change", () => {
        const logic = makeStructure({ maxHealth: 5, cargoCapacity: 3, occupants: [] });
        const trauma = { data: { subType: "injury", levelBase: 4 }, level: { effective: 8 } };
        const gear = { data: { weightBase: 1, quantity: 4 }, weight: { effective: 1 } };
        (logic.data as any).actor.itemTypes = {
            trauma: [{ logic: trauma }],
            miscgear: [{ logic: gear }],
        };
        logic.deriveStructureState();
        expect(logic.data.health.value).toBe(0);
        expect(logic.cargoOverCapacity).toBe(true);
        trauma.level.effective = 1;
        gear.data.quantity = 2;
        logic.deriveStructureState();
        expect(logic.data.health.value).toBe(4);
        expect(logic.cargoOverCapacity).toBe(false);
    });
    it("adds occupants only when explicitly invoked and removes references without deleting actors", async () => {
        const actor = { logic: { data: { kind: "being" } }, name: "Visitor" };
        vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockReturnValue(actor as any);
        const logic = makeStructure({ occupants: [] });
        await logic.addOccupant({ skipDialog: true, scope: { actorCodeOrUuid: "visitor" } } as any);
        expect(logic.data.update).toHaveBeenCalledWith({
            "system.occupants": [{ actorCodeOrUuid: "visitor", role: "passenger", title: null }],
        });
        logic.data.occupants = [{ actorCodeOrUuid: "visitor", role: "passenger", title: null }];
        await logic.removeOccupant({
            skipDialog: true,
            scope: { actorCodeOrUuid: "visitor" },
        } as any);
        expect(logic.data.update).toHaveBeenLastCalledWith({ "system.occupants": [] });
    });
});
