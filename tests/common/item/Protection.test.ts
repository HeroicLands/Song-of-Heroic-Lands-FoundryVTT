import { describe, it } from "vitest";

describe("ProtectionLogic", () => {
    describe("properties", () => {
        it.todo("bodyLocations - is empty array after initialize");
        it.todo("protection - is a map of ValueModifiers keyed by ImpactAspect after initialize");
    });

    describe("initialize", () => {
        it.todo("creates empty bodyLocations array");
        it.todo("creates protection ValueModifier for each ImpactAspect");
        it.todo("sets each protection base from data.protectionBase");
    });

    describe("evaluate", () => {
        it.todo("returns early if item has no nestedIn");
        it.todo("returns early if subType does not match sohl.id");
        it.todo("resolves body locations from armor gear flexible and rigid location lists");
        it.todo("applies protection modifiers to each body location");
        it.todo("adds material to body location layers list");
        it.todo("marks body location as rigid when armor has rigid coverage");
        it.todo("handles protection nested directly in a BodyLocation item");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("ProtectionDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with Variants choices");
        it.todo("defines protectionBase as SchemaField with NumberField per ImpactAspect");
    });

    it.todo("has kind set to ITEM_KIND.PROTECTION");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
