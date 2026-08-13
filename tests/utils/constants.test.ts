import {
    defineType,
    ACTOR_KIND,
    ITEM_KIND,
    VALUE_DELTA_OPERATOR,
    isValueDeltaOperator,
    isActorKind,
    isItemKind,
    KIND_KEY,
    SCHEMA_VERSION_KEY,
    SOHL_SPEAKER_ROLL_MODE,
    speakerRollModeOptions,
    toMessageMode,
    FENCED_TYPES,
    FENCE_EXPERIMENTAL_LABEL_KEY,
    isFencedType,
    labelWithFenceSuffix,
} from "@src/utils/constants";

describe("defineType", () => {
    it("returns kind matching the input definition", () => {
        const { kind } = defineType("Test.Prefix", {
            FOO: "foo",
            BAR: "bar",
        });
        expect(kind.FOO).toBe("foo");
        expect(kind.BAR).toBe("bar");
    });

    it("returns values as an array of all values", () => {
        const { values } = defineType("Test.Prefix", {
            A: "alpha",
            B: "beta",
        });
        expect(values).toContain("alpha");
        expect(values).toContain("beta");
        expect(values).toHaveLength(2);
    });

    it("isValue validates correctly", () => {
        const { isValue } = defineType("Test.Prefix", {
            X: "xray",
            Y: "yankee",
        });
        expect(isValue("xray")).toBe(true);
        expect(isValue("yankee")).toBe(true);
        expect(isValue("unknown")).toBe(false);
        expect(isValue(42)).toBe(false);
    });

    it("labels/choices are keyed to the VALUE for simple string values", () => {
        // Runtime constructs keys from the stored value (e.g. a `subType` of
        // "one" → "My.Prefix.one"), so labels/choices must match that.
        const { labels, choices } = defineType("My.Prefix", {
            ONE: "one",
            TWO: "two",
        });
        expect(labels.ONE).toBe("My.Prefix.one");
        expect(labels.TWO).toBe("My.Prefix.two");
        expect(choices.one).toBe("My.Prefix.one");
        expect(choices.two).toBe("My.Prefix.two");
    });

    it("falls back to the KEY for numeric values and change-path values", () => {
        // Numeric enums (labelled by key) and Active Effect change paths
        // (values containing "." or ":") are not label-worthy identifiers.
        const { labels } = defineType("My.Prefix", {
            NONE: 0,
            AFRAID: 3,
            SCORE: "mod:logic.score",
        });
        expect(labels.NONE).toBe("My.Prefix.NONE");
        expect(labels.AFRAID).toBe("My.Prefix.AFRAID");
        expect(labels.SCORE).toBe("My.Prefix.SCORE");
    });

    describe("labelKeys overrides (#1352)", () => {
        it("borrows an existing key for the listed members only", () => {
            // A member that restates a label another namespace owns points at
            // that owner, so the word is translated once; the rest still mint
            // their own key under the prefix.
            const { labels, choices } = defineType(
                "SOHL.MiscGear.EffectKey",
                { WEIGHT: "mod:logic.weight", SPECIAL: "mod:logic.special" },
                { WEIGHT: "SOHL.Gear.FIELDS.weightBase.label" },
            );
            expect(labels.WEIGHT).toBe("SOHL.Gear.FIELDS.weightBase.label");
            expect(labels.SPECIAL).toBe("SOHL.MiscGear.EffectKey.SPECIAL");
            // `choices` (value-keyed, for StringField) borrows the same key.
            expect(choices["mod:logic.weight"]).toBe(
                "SOHL.Gear.FIELDS.weightBase.label",
            );
        });

        it("overrides an identifier-valued member too, not just change paths", () => {
            const { labels } = defineType(
                "My.Prefix",
                { ONE: "one", TWO: "two" },
                { ONE: "Other.Owner.one" },
            );
            expect(labels.ONE).toBe("Other.Owner.one");
            expect(labels.TWO).toBe("My.Prefix.two");
        });

        it("is optional — omitting it leaves every label unchanged", () => {
            const { labels } = defineType("My.Prefix", { ONE: "one" });
            expect(labels.ONE).toBe("My.Prefix.one");
        });
    });
});

describe("ACTOR_KIND", () => {
    it("has expected actor kinds", () => {
        expect(ACTOR_KIND.BEING).toBe("being");
        expect(ACTOR_KIND.COHORT).toBe("cohort");
        expect(ACTOR_KIND.STRUCTURE).toBe("structure");
        expect(ACTOR_KIND.VEHICLE).toBe("vehicle");
    });

    it("isActorKind validates correctly", () => {
        expect(isActorKind("being")).toBe(true);
        expect(isActorKind("cohort")).toBe(true);
        expect(isActorKind("notanactor")).toBe(false);
    });
});

describe("ITEM_KIND", () => {
    it("has expected item kinds", () => {
        expect(ITEM_KIND.SKILL).toBe("skill");
        expect(ITEM_KIND.WEAPONGEAR).toBe("weapongear");
        expect(ITEM_KIND.ARMORGEAR).toBe("armorgear");
        expect(ITEM_KIND.TRAUMA).toBe("trauma");
        expect(ITEM_KIND.AFFLICTION).toBe("affliction");
        expect(ITEM_KIND.MYSTERY).toBe("mystery");
    });

    it("isItemKind validates correctly", () => {
        expect(isItemKind("skill")).toBe(true);
        expect(isItemKind("weapongear")).toBe(true);
        expect(isItemKind("notanitem")).toBe(false);
    });
});

describe("VALUE_DELTA_OPERATOR", () => {
    it("has expected operators", () => {
        expect(VALUE_DELTA_OPERATOR.ADD).toBe("add");
        expect(VALUE_DELTA_OPERATOR.MULTIPLY).toBe("multiply");
        expect(VALUE_DELTA_OPERATOR.UPGRADE).toBe("upgrade");
        expect(VALUE_DELTA_OPERATOR.DOWNGRADE).toBe("downgrade");
        expect(VALUE_DELTA_OPERATOR.OVERRIDE).toBe("override");
        expect(VALUE_DELTA_OPERATOR.CUSTOM).toBe("custom");
    });

    it("isValueDeltaOperator validates correctly", () => {
        expect(isValueDeltaOperator("add")).toBe(true);
        expect(isValueDeltaOperator("multiply")).toBe(true);
        expect(isValueDeltaOperator("override")).toBe(true);
        expect(isValueDeltaOperator("custom")).toBe(true);
        expect(isValueDeltaOperator("invalid")).toBe(false);
        expect(isValueDeltaOperator(42)).toBe(false);
    });
});

describe("constants", () => {
    it("KIND_KEY is __kind", () => {
        expect(KIND_KEY).toBe("__kind");
    });

    it("SCHEMA_VERSION_KEY is __schemaVer", () => {
        expect(SCHEMA_VERSION_KEY).toBe("__schemaVer");
    });
});

describe("speakerRollModeOptions", () => {
    it("uses the stored roll-mode value (not the enum key) as the option value", () => {
        const values = speakerRollModeOptions().map((o) => o.value);
        expect(values).toEqual(Object.values(SOHL_SPEAKER_ROLL_MODE));
        // e.g. "publicroll", never the enum key "PUBLIC"
        expect(values).toContain(SOHL_SPEAKER_ROLL_MODE.PUBLIC);
        expect(values).not.toContain("PUBLIC");
    });

    it("labels the visibility modes with Foundry CHAT.MODES.* keys", () => {
        const byValue = Object.fromEntries(
            speakerRollModeOptions().map((o) => [o.value, o.label]),
        );
        expect(byValue[SOHL_SPEAKER_ROLL_MODE.PUBLIC]).toBe(
            "CHAT.MODES.public",
        );
        expect(byValue[SOHL_SPEAKER_ROLL_MODE.SELF]).toBe("CHAT.MODES.self");
        expect(byValue[SOHL_SPEAKER_ROLL_MODE.BLIND]).toBe("CHAT.MODES.blind");
        expect(byValue[SOHL_SPEAKER_ROLL_MODE.PRIVATE]).toBe("CHAT.MODES.gm");
    });

    it("keeps the SoHL label for the default (system) roll mode", () => {
        const byValue = Object.fromEntries(
            speakerRollModeOptions().map((o) => [o.value, o.label]),
        );
        expect(byValue[SOHL_SPEAKER_ROLL_MODE.SYSTEM]).toBe(
            "SOHL.SohlSpeaker.ROLL_MODE.roll",
        );
    });
});

describe("toMessageMode", () => {
    it("translates each legacy SoHL roll mode to its v14 message-mode key", () => {
        expect(toMessageMode(SOHL_SPEAKER_ROLL_MODE.PUBLIC)).toBe("public");
        expect(toMessageMode(SOHL_SPEAKER_ROLL_MODE.SELF)).toBe("self");
        expect(toMessageMode(SOHL_SPEAKER_ROLL_MODE.BLIND)).toBe("blind");
        expect(toMessageMode(SOHL_SPEAKER_ROLL_MODE.PRIVATE)).toBe("gm");
    });

    it("maps the default (system) roll mode to undefined so applyMode uses the client default", () => {
        expect(toMessageMode(SOHL_SPEAKER_ROLL_MODE.SYSTEM)).toBeUndefined();
    });

    it("passes an already-translated / unknown mode through unchanged", () => {
        // A v14 message-mode key given directly stays as-is.
        expect(toMessageMode("public")).toBe("public");
        expect(toMessageMode("gm")).toBe("gm");
        // A custom mode key is not clobbered.
        expect(toMessageMode("custom")).toBe("custom");
    });
});

describe("fenced (experimental) types", () => {
    const localize = (key: string) =>
        key === FENCE_EXPERIMENTAL_LABEL_KEY ? "Experimental" : key;

    it("fences exactly the cohort/structure/vehicle actor kinds", () => {
        expect([...(FENCED_TYPES.Actor ?? [])].sort()).toEqual([
            "cohort",
            "structure",
            "vehicle",
        ]);
    });

    it("does not fence being, nor the graduated mystery/mysticalability items", () => {
        expect(isFencedType("Actor", "being")).toBe(false);
        expect(isFencedType("Item", "mystery")).toBe(false);
        expect(isFencedType("Item", "mysticalability")).toBe(false);
    });

    it("isFencedType is true only for listed (documentName, type) pairs", () => {
        expect(isFencedType("Actor", "cohort")).toBe(true);
        expect(isFencedType("Actor", "structure")).toBe(true);
        expect(isFencedType("Actor", "vehicle")).toBe(true);
        // Same value under the wrong document name is not fenced.
        expect(isFencedType("Item", "cohort")).toBe(false);
        // Unknown document name / type.
        expect(isFencedType("JournalEntry", "cohort")).toBe(false);
        expect(isFencedType("Actor", "nonesuch")).toBe(false);
    });

    it("labelWithFenceSuffix appends the localized suffix for fenced types", () => {
        expect(
            labelWithFenceSuffix("Actor", "cohort", "Cohort", localize),
        ).toBe("Cohort (Experimental)");
    });

    it("labelWithFenceSuffix leaves non-fenced labels untouched", () => {
        expect(labelWithFenceSuffix("Actor", "being", "Being", localize)).toBe(
            "Being",
        );
        expect(labelWithFenceSuffix("Item", "skill", "Skill", localize)).toBe(
            "Skill",
        );
    });
});
