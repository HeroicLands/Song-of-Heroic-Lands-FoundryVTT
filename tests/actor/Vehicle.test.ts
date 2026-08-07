import { describe, it, expect, vi, afterEach } from "vitest";
import {
    VehicleLogic,
    type VehicleOccupant,
} from "@src/document/actor/logic/VehicleLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ACTOR_KIND, VEHICLE_OCCUPANT_ROLE } from "@src/utils/constants";
import { makeActorLogic } from "@tests/mocks/logicHarness";
import * as FoundryHelpersMock from "@src/core/FoundryHelpers";

/** Construct a VehicleLogic against a plain-object VehicleData. */
function makeVehicle(
    fields: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeActorLogic(
        VehicleLogic,
        ACTOR_KIND.VEHICLE,
        { occupants: [], ...fields },
        opts,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("VehicleLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object VehicleData (no Foundry)", () => {
            const logic = makeVehicle();
            expect(logic).toBeInstanceOf(VehicleLogic);
            expect(logic).toBeInstanceOf(SohlActorBaseLogic);
            expect(logic.data.kind).toBe(ACTOR_KIND.VEHICLE);
        });

        it("defines the base edit/delete intrinsic actions", () => {
            const logic = makeVehicle();
            expect(logic.actions.has("editDocument")).toBe(true);
        });

        it("exposes the occupant entries from its data (#1197)", () => {
            // Each entry is the object the schema stores — a handle, a role, and
            // an optional title — never a bare shortcode string.
            const occupants: VehicleOccupant[] = [
                {
                    actorCodeOrUuid: "bosun",
                    role: VEHICLE_OCCUPANT_ROLE.CREW,
                    title: "Bosun",
                },
                {
                    actorCodeOrUuid: "deckCohort",
                    role: VEHICLE_OCCUPANT_ROLE.PASSENGER,
                    title: null,
                },
            ];
            const logic = makeVehicle({ occupants });

            expect(logic.data.occupants).toEqual(occupants);
            expect(logic.data.occupants[0].actorCodeOrUuid).toBe("bosun");
            expect(logic.data.occupants[0].role).toBe("crew");
            expect(logic.data.occupants[1].title).toBeNull();
        });
    });

    describe("occupantRows (#201)", () => {
        /** Stub `fvttActorByRef` so the given handles resolve. */
        function resolveRefs(byRef: Record<string, Record<string, unknown>>) {
            vi.spyOn(FoundryHelpersMock, "fvttActorByRef").mockImplementation(
                (ref: string) => byRef[ref],
            );
        }

        /** A resolvable actor stub carrying a health value. */
        function actor(name: string, value = 100) {
            return {
                name,
                uuid: `Actor.${name}`,
                img: `${name}.webp`,
                logic: { data: { health: { value, max: 100 } } },
            };
        }

        /** One stored occupant entry. */
        function occupant(
            actorCodeOrUuid: string,
            role = "passenger",
            title: string | null = null,
        ) {
            return { actorCodeOrUuid, role, title };
        }

        it("names each occupant from the actor its handle resolves to", () => {
            resolveRefs({ bosun: actor("Bosun Vell") });
            const logic = makeVehicle({
                occupants: [occupant("bosun", "crew", "Bosun")],
            }) as any;

            const [row] = logic.occupantRows;
            expect(row.name).toBe("Bosun Vell");
            expect(row.uuid).toBe("Actor.Bosun Vell");
            expect(row.isResolved).toBe(true);
            expect(row.title).toBe("Bosun");
        });

        it("carries each occupant's role and its localization key", () => {
            resolveRefs({});
            const logic = makeVehicle({
                occupants: [occupant("hand", "draftCreature")],
            }) as any;

            expect(logic.occupantRows[0].role).toBe("draftCreature");
            expect(logic.occupantRows[0].roleLabel).toContain("draftCreature");
        });

        it("still lists an occupant whose actor does not resolve", () => {
            resolveRefs({});
            const logic = makeVehicle({
                occupants: [occupant("ghost")],
            }) as any;

            const [row] = logic.occupantRows;
            expect(row.name).toBe("ghost");
            expect(row.isResolved).toBe(false);
            expect(row.uuid).toBeNull();
            expect(row.healthPct).toBeUndefined();
        });

        it("reports each resolved occupant's health and band", () => {
            resolveRefs({ hurt: actor("Hurt", 45) });
            const logic = makeVehicle({
                occupants: [occupant("hurt")],
            }) as any;

            const [row] = logic.occupantRows;
            expect(row.healthPct).toBe(45);
            expect(row.healthBand).toBe("Poor");
            expect(row.healthBandLabel).toBe("SOHL.Health.BAND.Poor");
        });

        it("has no leader concept — no row is ever marked as leading", () => {
            resolveRefs({ a: actor("A"), b: actor("B") });
            const logic = makeVehicle({
                occupants: [occupant("a", "crew"), occupant("b")],
            }) as any;

            for (const row of logic.occupantRows) {
                expect(row.isLeader).toBeUndefined();
            }
        });

        it("resolves each occupant's logic, skipping those that do not resolve", () => {
            resolveRefs({ a: actor("A") });
            const logic = makeVehicle({
                occupants: [occupant("a"), occupant("ghost")],
            }) as any;

            expect(logic.occupantLogics).toHaveLength(1);
        });
    });

    describe("lifecycle", () => {
        it("initialize/evaluate/finalize are no-ops that do not throw", () => {
            const logic = makeVehicle();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("VehicleDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo(
            "defines occupants as ArrayField of required non-blank StringFields",
        );
        it.todo("occupants defaults to empty array");
    });

    it.todo("has kind set to ACTOR_KIND.VEHICLE");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
