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
} from "@utils/constants";

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

    it("labels are prefixed correctly", () => {
        const { labels } = defineType("My.Prefix", {
            ONE: "one",
            TWO: "two",
        });
        expect(labels.ONE).toBe("My.Prefix.one");
        expect(labels.TWO).toBe("My.Prefix.two");
    });
});

describe("ACTOR_KIND", () => {
    it("has expected actor kinds", () => {
        expect(ACTOR_KIND.BEING).toBe("being");
        expect(ACTOR_KIND.COHORT).toBe("cohort");
        expect(ACTOR_KIND.STRUCTURE).toBe("structure");
        expect(ACTOR_KIND.VEHICLE).toBe("vehicle");
        expect(ACTOR_KIND.ASSEMBLY).toBe("assembly");
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
        expect(ITEM_KIND.TRAIT).toBe("trait");
        expect(ITEM_KIND.WEAPONGEAR).toBe("weapongear");
        expect(ITEM_KIND.ARMORGEAR).toBe("armorgear");
        expect(ITEM_KIND.INJURY).toBe("injury");
        expect(ITEM_KIND.AFFLICTION).toBe("affliction");
        expect(ITEM_KIND.MYSTERY).toBe("mystery");
        expect(ITEM_KIND.ACTION).toBe("action");
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
