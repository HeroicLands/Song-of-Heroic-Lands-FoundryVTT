import { describe, it } from "vitest";

describe("DispositionLogic", () => {
    describe("lifecycle", () => {
        it.todo("initialize - calls super.initialize");
        it.todo("evaluate - calls super.evaluate");
        it.todo("finalize - calls super.finalize");
    });
});

describe("DispositionDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines targetShortcode as a StringField (blank allowed)");
        it.todo("defines reaction as a StringField with Reactions choices defaulting to NEUTRAL");
    });

    it.todo("has kind set to ITEM_KIND.DISPOSITION");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
