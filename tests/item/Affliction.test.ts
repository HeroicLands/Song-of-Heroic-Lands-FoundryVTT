import { describe, it } from "vitest";

describe("AfflictionLogic", () => {
    describe("getters", () => {
        it.todo("canTransmit - returns true (placeholder)");
        it.todo("canContract - returns true (placeholder)");
        it.todo("hasCourse - returns true (placeholder)");
        it.todo("canTreat - returns true (placeholder)");
        it.todo("canHeal - returns true (placeholder)");
    });

    describe("transmit", () => {
        it.todo("logs a warning (not yet implemented)");
    });

    describe("contractTest", () => {
        it.todo("throws not implemented error");
    });

    describe("courseTest", () => {
        it.todo("throws not implemented error");
    });

    describe("diagnosisTest", () => {
        it.todo("throws not implemented error");
    });

    describe("treatmentTest", () => {
        it.todo("throws not implemented error");
    });

    describe("healingTest", () => {
        it.todo("throws not implemented error");
    });

    describe("initialize", () => {
        it.todo("sets isDormant to false");
        it.todo("sets isTreated to false");
        it.todo("creates diagnosisBonus ValueModifier");
        it.todo("creates level ValueModifier from data.levelBase");
        it.todo("creates healingRate ValueModifier from data.healingRateBase");
        it.todo("disables healingRate when healingRateBase is -1");
        it.todo("creates contagionIndex ValueModifier from data.contagionIndexBase");
        it.todo("sets transmission to AFFLICTION_TRANSMISSION.NONE");
    });

    describe("evaluate", () => {
        it.todo("calls super.evaluate");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("AfflictionDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with AfflictionSubTypes choices");
        it.todo("defines category as a StringField");
        it.todo("defines isDormant as a BooleanField");
        it.todo("defines isTreated as a BooleanField");
        it.todo("defines diagnosisBonusBase as a NumberField");
        it.todo("defines levelBase as a NumberField with min 0");
        it.todo("defines healingRateBase as a NumberField");
        it.todo("defines contagionIndexBase as a NumberField with min 0");
        it.todo("defines transmission with AfflictionTransmissions choices");
    });

    it.todo("has kind set to ITEM_KIND.AFFLICTION");
});
