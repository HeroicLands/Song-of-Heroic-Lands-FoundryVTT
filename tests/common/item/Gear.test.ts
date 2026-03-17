import { describe, it } from "vitest";

describe("GearLogic", () => {
    describe("properties", () => {
        it.todo("weight - is a ValueModifier after initialize");
        it.todo("value - is a ValueModifier after initialize");
        it.todo("quality - is a ValueModifier after initialize");
        it.todo("durability - is a ValueModifier after initialize");
    });

    describe("initialize", () => {
        it.todo("creates weight ValueModifier");
        it.todo("creates value ValueModifier");
        it.todo("creates quality ValueModifier");
        it.todo("creates durability ValueModifier");
    });

    describe("evaluate", () => {
        it.todo("calls super.evaluate");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("GearDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines quantity as integer NumberField with min 0, initial 1");
        it.todo("defines weightBase as NumberField with min 0");
        it.todo("defines valueBase as NumberField with min 0");
        it.todo("defines isCarried as BooleanField defaulting to true");
        it.todo("defines isEquipped as BooleanField defaulting to false");
        it.todo("defines qualityBase as integer NumberField with min 0");
        it.todo("defines durabilityBase as integer NumberField with min 0");
        it.todo("defines visibleToCohort as BooleanField defaulting to false");
    });
});
