import { describe, it, expect, vi, afterEach } from "vitest";
import {
    VehicleLogic,
    type VehicleOccupant,
} from "@src/document/actor/logic/VehicleLogic";
import { SohlActorBaseLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { ACTOR_KIND, VEHICLE_OCCUPANT_ROLE } from "@src/utils/constants";
import { makeActorLogic } from "@tests/mocks/logicHarness";

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
