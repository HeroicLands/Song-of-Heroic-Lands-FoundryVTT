import { describe, it, expect } from "vitest";
import {
    SHORTCODE_PATTERN,
    isValidShortcode,
    sanitizeShortcode,
} from "@src/utils/shortcode-format.mjs";
import { WORLD_HOST_SHORTCODE } from "@src/utils/constants";
import { resolveShortcodeKey } from "@src/utils/helpers";
import { SOHL_MIGRATIONS } from "@src/entity/migration/MigrationRegistry";

describe("shortcode-format (the shape rule, #1397)", () => {
    describe("isValidShortcode", () => {
        it("accepts ASCII letters and digits, in any case", () => {
            expect(isValidShortcode("bsw")).toBe(true);
            expect(isValidShortcode("BCap")).toBe(true);
            expect(isValidShortcode("Sprngld")).toBe(true);
            expect(isValidShortcode("arrow2")).toBe(true);
            expect(isValidShortcode("2h")).toBe(true);
        });

        it("rejects the three keys that violated the rule", () => {
            expect(isValidShortcode("self-pro")).toBe(false);
            expect(isValidShortcode("self-suf")).toBe(false);
            expect(isValidShortcode("B&CFl")).toBe(false);
        });

        it("rejects any other non-alphanumeric character", () => {
            for (const bad of ["a_b", "a b", "a.b", "a/b", "a:b", "a'b", "aé", "a\n"]) {
                expect(isValidShortcode(bad)).toBe(false);
            }
        });

        it("rejects a blank value — presence is a separate question", () => {
            expect(isValidShortcode("")).toBe(false);
            expect(isValidShortcode("   ")).toBe(false);
        });

        it("rejects a non-string", () => {
            expect(isValidShortcode(undefined)).toBe(false);
            expect(isValidShortcode(null)).toBe(false);
            expect(isValidShortcode(42)).toBe(false);
        });

        it("is anchored — a valid substring does not pass a bad whole", () => {
            expect(SHORTCODE_PATTERN.test("ok!")).toBe(false);
            expect(SHORTCODE_PATTERN.test("!ok")).toBe(false);
        });
    });

    describe("sanitizeShortcode", () => {
        it("strips the offending characters while preserving case", () => {
            expect(sanitizeShortcode("self-pro")).toBe("selfpro");
            expect(sanitizeShortcode("self-suf")).toBe("selfsuf");
            expect(sanitizeShortcode("B&CFl")).toBe("BCFl");
        });

        it("leaves a valid shortcode untouched", () => {
            expect(sanitizeShortcode("bsw")).toBe("bsw");
            expect(sanitizeShortcode("BCap")).toBe("BCap");
        });

        it("returns '' when nothing alphanumeric survives", () => {
            expect(sanitizeShortcode("—")).toBe("");
            expect(sanitizeShortcode("")).toBe("");
            expect(sanitizeShortcode(null)).toBe("");
        });

        it("always yields a valid shortcode or an empty string", () => {
            for (const raw of ["self-pro", "B&CFl", "a b c", "x"]) {
                const out = sanitizeShortcode(raw);
                expect(out === "" || isValidShortcode(out)).toBe(true);
            }
        });

        // A repair keeps an *existing* identity as recognizable as possible,
        // and `(type, shortcode)` is that identity — so a letter that has an
        // ASCII sense must be spelled, not deleted. Dropping the `û` turned
        // `Tabûri` into `Tabri`, which denotes a different entity and stops
        // matching the compendium document it came from (#1748).
        it("folds an accented letter rather than deleting it", () => {
            expect(sanitizeShortcode("Tabûri")).toBe("Taburi");
            expect(sanitizeShortcode("Kûrbúl")).toBe("Kurbul");
            expect(sanitizeShortcode("Nüsvōrroth")).toBe("Nusvorroth");
            expect(sanitizeShortcode("café")).toBe("cafe");
        });

        it("spells out a letter that carries no separable mark", () => {
            // Stripping ate the first letter of the name outright.
            expect(sanitizeShortcode("Æthelred")).toBe("AEthelred");
            expect(sanitizeShortcode("Þorn")).toBe("THorn");
            expect(sanitizeShortcode("straße")).toBe("strasse");
        });

        it("folds without lowercasing or abbreviating", () => {
            // This is what keeps the repair distinct from `slugifyShortcode`,
            // which derives a *new* key and does both.
            expect(sanitizeShortcode("KÛRBÚL")).toBe("KURBUL");
            expect(sanitizeShortcode("Tabûri")).not.toBe("taburi");
        });

        it("still drops what the fold cannot carry into a letter or digit", () => {
            // A vulgar fraction has no *canonical* decomposition, so nothing
            // spells it; punctuation and spaces go as before.
            expect(sanitizeShortcode("Kûrbúl ¾-Helm")).toBe("KurbulHelm");
            expect(sanitizeShortcode("—")).toBe("");
        });

        it("still yields a valid shortcode or an empty string when folding", () => {
            for (const raw of ["Tabûri", "Æthelred", "Kûrbúl ¾-Helm", "—"]) {
                const out = sanitizeShortcode(raw);
                expect(out === "" || isValidShortcode(out)).toBe(true);
            }
        });
    });

    describe("the repair reaches the same answer wherever it runs (#1748)", () => {
        it("the create guard folds an accented key it was asked to repair", () => {
            expect(
                resolveShortcodeKey("Tabûri", "Tabûri", new Set(), {
                    dedupe: true,
                }),
            ).toEqual({ shortcode: "Taburi" });
        });

        it("the 0.9.0 world migration folds a legacy accented key", () => {
            const step = SOHL_MIGRATIONS.find((s) =>
                s.description.toLowerCase().includes("shortcode"),
            );
            expect(
                step!.migrators!.Item!({
                    type: "weapongear",
                    name: "Tabûri",
                    system: { shortcode: "Tabûri" },
                }),
            ).toEqual({ system: { shortcode: "Taburi" } });
        });
    });

    describe("the system's own reserved keys (#1536)", () => {
        it("the world-host shortcode obeys the rule", () => {
            // It is not authored content, but it is written to
            // `system.shortcode` like any other key, so the create guard
            // judges it by the same rule.
            expect(isValidShortcode(WORLD_HOST_SHORTCODE)).toBe(true);
        });

        it("the create guard resolves it rather than refusing it", () => {
            // The exact decision `enforceShortcodeOnCreate` makes for the actor
            // `sohl.worldHost()` creates: a malformed key was refused as
            // `invalid`, which vetoed the create and left `worldHost()`
            // returning `undefined`.
            expect(
                resolveShortcodeKey(WORLD_HOST_SHORTCODE, "World", new Set(), {
                    dedupe: false,
                }),
            ).toEqual({ shortcode: WORLD_HOST_SHORTCODE });
        });

        it("a v0.8 host's legacy `_sohlworld` key migrates onto it", () => {
            // The 0.9.0 repair (#1397) rewrites the key a v0.8 world's host
            // carries; it must land on the code `worldHost()` now looks the
            // singleton up by, or the upgraded world grows a second host.
            const step = SOHL_MIGRATIONS.find((s) =>
                s.description.toLowerCase().includes("shortcode"),
            );
            expect(
                step!.migrators!.Actor!({
                    type: "being",
                    name: "World",
                    system: { shortcode: "_sohlworld" },
                }),
            ).toEqual({ system: { shortcode: WORLD_HOST_SHORTCODE } });
        });
    });
});
