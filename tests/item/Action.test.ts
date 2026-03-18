import { describe, it } from "vitest";

describe("ActionLogic", () => {
    describe("constructor / properties", () => {
        it.todo("executor - is assigned during initialize");
        it.todo("trigger - is assigned during initialize");
        it.todo("visible - is assigned during initialize");
    });

    describe("executeSync", () => {
        it.todo("throws if action is async");
        it.todo("throws if executor returns a Thenable");
        it.todo("returns the result of the executor for synchronous actions");
    });

    describe("execute", () => {
        it.todo("calls executor with the provided action context");
        it.todo("returns a Promise wrapping the executor result");
    });

    describe("initialize", () => {
        it.todo("sets visible to a function returning true when data.visible is 'true'");
        it.todo("creates trigger function from data.trigger text");
        it.todo("resolves executor to self when scope is SELF");
        it.todo("resolves executor to parent item logic when scope is ITEM");
        it.todo("resolves executor to owning actor logic when scope is ACTOR");
        it.todo("throws when scope is unknown");
        it.todo("binds intrinsic action executor to the named method on target");
        it.todo("throws when intrinsic action method does not exist on target");
        it.todo("creates custom executor from textToFunction for custom actions");
        it.todo("sets executor to a no-op when data.executor is empty");
    });

    describe("evaluate", () => {
        it.todo("calls super.evaluate");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("ActionDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType as a StringField with ActionSubTypes choices");
        it.todo("defines title as a StringField");
        it.todo("defines isAsync as a BooleanField defaulting to false");
        it.todo("defines scope as a StringField with SohlActionScopes choices");
        it.todo("defines executor as a StringField");
        it.todo("defines trigger as a StringField");
        it.todo("defines visible as a StringField defaulting to 'true'");
        it.todo("defines iconFAClass as a StringField");
        it.todo("defines group as a StringField with context menu sort group choices");
        it.todo("defines permissions.execute as a NumberField");
    });

    describe("prepareBaseData", () => {
        it.todo("defaults title to item name when title is blank");
    });
});
