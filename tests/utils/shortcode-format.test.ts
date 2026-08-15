import { describe, it, expect } from "vitest";
import {
    SHORTCODE_PATTERN,
    isValidShortcode,
    sanitizeShortcode,
} from "@src/utils/shortcode-format.mjs";

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
            for (const bad of [
                "a_b",
                "a b",
                "a.b",
                "a/b",
                "a:b",
                "a'b",
                "aé",
                "a\n",
            ]) {
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
    });
});
