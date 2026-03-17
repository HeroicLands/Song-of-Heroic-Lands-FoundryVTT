import { describe, it } from "vitest";

describe("DomainLogic", () => {
    describe("properties", () => {
        it.todo("philosophy - is undefined initially");
    });

    describe("initialize", () => {
        it.todo("calls super.initialize");
    });

    describe("evaluate", () => {
        it.todo("resolves philosophy from actor items by philosophyCode shortcode");
        it.todo("sets philosophy to undefined when no matching philosophy exists");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("DomainDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with DomainSubTypes choices");
        it.todo("defines philosophyCode as a required non-blank StringField");
    });

    it.todo("has kind set to ITEM_KIND.DOMAIN");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
