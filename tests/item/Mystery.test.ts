import { describe, it } from "vitest";

describe("MysteryLogic", () => {
    describe("properties", () => {
        it.todo("domain - is undefined initially, resolved during evaluate");
        it.todo(
            "skills - is empty array after initialize, resolved during evaluate",
        );
        it.todo("level - is a ValueModifier after initialize");
        it.todo("charges.value - is a ValueModifier after initialize");
        it.todo("charges.max - is a ValueModifier after initialize");
    });

    describe("fieldData", () => {
        it.todo("returns domain name for DIVINE category");
        it.todo("returns formatted skill list for SKILL category");
        it.todo("returns 'SOHL.AllSkills' when no specific skills are listed");
        it.todo("returns domain name for CREATURE category");
        it.todo("returns unknown domain string for unknown category");
    });

    describe("getApplicableFate", () => {
        it.todo("returns empty array when subType is not FATE");
        it.todo("returns item when target name is in skills list");
        it.todo("returns item when skills list is empty (applies to all)");
        it.todo("returns empty array when level.effective is 0 or less");
    });

    describe("_usesCharges", () => {
        it.todo(
            "returns true for FATE, FATEBONUS, FATEPOINTBONUS, GRACE, PIETY subtypes",
        );
        it.todo("returns false for other subtypes");
    });

    describe("_usesLevels", () => {
        it.todo(
            "returns true for ANCESTORSPIRITPOWER and TOTEMSPIRITPOWER subtypes",
        );
        it.todo("returns false for other subtypes");
    });

    describe("fateBonusItems", () => {
        it.todo("returns empty array when item has no name");
        it.todo("returns empty array when actor has no items");
        it.todo("returns matching FATEBONUS mystery items from actor");
    });

    describe("initialize", () => {
        it.todo("creates level ValueModifier from data.levelBase");
        it.todo("creates charges.value ValueModifier from data.charges.value");
        it.todo("creates charges.max ValueModifier from data.charges.max");
    });

    describe("evaluate", () => {
        it.todo("resolves domain from actor items by mysteryCode shortcode");
        it.todo(
            "resolves skills from actor items matching data.skills shortcodes",
        );
        it.todo("returns early when actor is null");
    });

    describe("finalize", () => {
        it.todo("calls super.finalize");
    });
});

describe("MysteryDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with MysterySubTypes choices");
        it.todo("defines mysteryCode as nullable non-blank StringField");
        it.todo("defines skills as ArrayField of StringFields");
        it.todo("defines levelBase as integer NumberField with min 0");
        it.todo(
            "defines charges.value as integer NumberField with min -1, initial -1",
        );
        it.todo(
            "defines charges.max as integer NumberField with min -1, initial -1",
        );
    });

    it.todo("has kind set to ITEM_KIND.MYSTERY");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
