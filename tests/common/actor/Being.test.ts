import { describe, it } from "vitest";

describe("BeingLogic", () => {
    describe("properties", () => {
        it.todo("health - is a ValueModifier after initialize");
        it.todo("healingBase - is a ValueModifier after initialize");
        it.todo("zoneSum - tracks total body zones");
        it.todo("bodyWeight - is a ValueModifier after initialize");
        it.todo("shockState - tracks current shock state");
    });

    describe("calcImpact", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should calculate location and damage from attack result");
    });

    describe("shockTest", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should use shock skill for the test");
        it.todo("should exclude impairment penalty from shock test");
    });

    describe("stumbleTest", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should use the better of agility trait or acrobatics skill");
    });

    describe("fumbleTest", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should use the better of dexterity trait or legerdemain skill");
    });

    describe("moraleTest", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should use initiative skill for the test");
    });

    describe("fearTest", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should use initiative skill for the test");
    });

    describe("contractAfflictionTest", () => {
        it.todo("returns null (not yet implemented)");
        it.todo("should create affliction and test contraction");
    });

    describe("opposedTestResume", () => {
        it.todo("resumes an opposed test by selecting the appropriate skill");
    });

    describe("lifecycle", () => {
        it.todo("initialize - calls super.initialize and sets up health/healing modifiers");
        it.todo("evaluate - calls super.evaluate");
        it.todo("finalize - calls super.finalize");
    });
});

describe("BeingDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlActorDataModel base schema fields");
        it.todo("has no additional fields beyond base actor schema");
    });

    it.todo("has kind set to ACTOR_KIND.BEING");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
