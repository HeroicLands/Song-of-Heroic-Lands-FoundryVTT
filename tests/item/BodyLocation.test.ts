import { describe, it } from "vitest";

describe("BodyLocationLogic", () => {
    describe("getters", () => {
        it.todo("layers - joins layersList with comma separator");
    });

    describe("initialize", () => {
        it.todo("creates protection ValueModifier for each ImpactAspect");
        it.todo("initializes empty layersList array");
        it.todo("initializes traits.isRigid to false");
    });

    describe("evaluate", () => {
        it.todo("calls super.evaluate");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("BodyLocationDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines isFumble as BooleanField defaulting to false");
        it.todo("defines isStumble as BooleanField defaulting to false");
    });

    it.todo("has kind set to ITEM_KIND.BODYLOCATION");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
