import { describe, it, expect } from "vitest";
import {
    getItemAttributeShortcodes,
    resolveItemTargets,
} from "@src/document/effect/active-effect-logic";

// Minimal item shape for testing
function makeItem(shortcode: string, attrShortcodes: string[] = []) {
    return {
        system: { shortcode },
        logic: {
            skillBase: {
                attributes: attrShortcodes.map((sc) => ({
                    data: { shortcode: sc },
                })),
            },
        },
    };
}

describe("getItemAttributeShortcodes", () => {
    it("returns shortcodes from the attributes array", () => {
        const item = makeItem("sword", ["str", "dex"]);
        expect(getItemAttributeShortcodes(item)).toEqual(["str", "dex"]);
    });

    it("returns empty array when skillBase is missing", () => {
        expect(getItemAttributeShortcodes({ logic: {} })).toEqual([]);
    });

    it("returns empty array when attributes is not an array", () => {
        expect(
            getItemAttributeShortcodes({
                logic: { skillBase: { attributes: null } },
            }),
        ).toEqual([]);
    });

    it("filters out entries with no shortcode", () => {
        const item = {
            logic: {
                skillBase: {
                    attributes: [
                        { data: { shortcode: "str" } },
                        { data: {} },
                        { data: { shortcode: "" } },
                    ],
                },
            },
        };
        expect(getItemAttributeShortcodes(item)).toEqual(["str"]);
    });
});

describe("resolveItemTargets (default mode)", () => {
    const items = [
        makeItem("sword"),
        makeItem("axe"),
        makeItem("bow"),
    ];

    it("returns all items when targetName is blank", () => {
        expect(resolveItemTargets({ targetName: "", typeItems: items })).toEqual(
            items,
        );
    });

    it("returns exact match when shortcode matches", () => {
        const result = resolveItemTargets({
            targetName: "sword",
            typeItems: items,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.system.shortcode).toBe("sword");
    });

    it("falls back to regex when no exact match", () => {
        const result = resolveItemTargets({
            targetName: "s.*d",
            typeItems: items,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.system.shortcode).toBe("sword");
    });

    it("returns empty array for invalid regex", () => {
        const result = resolveItemTargets({
            targetName: "[invalid",
            typeItems: items,
        });
        expect(result).toEqual([]);
    });

    it("returns empty array when nothing matches", () => {
        const result = resolveItemTargets({
            targetName: "shield",
            typeItems: items,
        });
        expect(result).toEqual([]);
    });
});

describe("resolveItemTargets (attr: mode)", () => {
    const items = [
        makeItem("swordsmanship", ["str", "dex"]),
        makeItem("archery", ["dex", "per"]),
        makeItem("lore", []),
    ];

    it("returns only items with attributes when name after attr: is blank", () => {
        const result = resolveItemTargets({
            targetName: "attr:",
            typeItems: items,
        });
        expect(result).toHaveLength(2);
        expect(result.map((i) => i.system.shortcode)).toEqual(
            expect.arrayContaining(["swordsmanship", "archery"]),
        );
    });

    it("returns items with exact attribute shortcode match", () => {
        const result = resolveItemTargets({
            targetName: "attr:str",
            typeItems: items,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.system.shortcode).toBe("swordsmanship");
    });

    it("falls back to regex on attribute shortcodes when no exact match", () => {
        const result = resolveItemTargets({
            targetName: "attr:de.",
            typeItems: items,
        });
        expect(result).toHaveLength(2);
        expect(result.map((i) => i.system.shortcode)).toEqual(
            expect.arrayContaining(["swordsmanship", "archery"]),
        );
    });

    it("returns empty array when no items have matching attribute", () => {
        const result = resolveItemTargets({
            targetName: "attr:int",
            typeItems: items,
        });
        expect(result).toEqual([]);
    });
});
