import { describe, it } from "vitest";

describe("VehicleLogic", () => {
    describe("lifecycle", () => {
        it.todo("initialize - calls super.initialize");
        it.todo("evaluate - calls super.evaluate");
        it.todo("finalize - calls super.finalize");
    });
});

describe("VehicleDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("defines occupants as ArrayField of required non-blank StringFields");
        it.todo("occupants defaults to empty array");
    });

    it.todo("has kind set to ACTOR_KIND.VEHICLE");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
