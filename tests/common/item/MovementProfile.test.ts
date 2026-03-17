import { describe, it } from "vitest";

describe("MovementProfileLogic", () => {
    describe("lifecycle", () => {
        it.todo("initialize - calls super.initialize");
        it.todo("evaluate - calls super.evaluate");
        it.todo("finalize - calls super.finalize");
    });
});

describe("MovementProfileDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines medium with MovementMediums choices defaulting to TERRESTRIAL");
        it.todo("defines metersPerRound as integer NumberField with min 0");
        it.todo("defines metersPerWatch as NumberField with min 0");
        it.todo("defines factors as ArrayField of SchemaField entries");
        it.todo("defines disabled as BooleanField defaulting to false");
    });

    it.todo("has kind set to ITEM_KIND.MOVEMENTPROFILE");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
