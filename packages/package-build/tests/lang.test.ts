/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import { findPrefixCollisions, validateLangSource } from "../lang.mjs";

/** Serialize a record the way a lang file is authored, so positions are real. */
const asFile = (entries: Record<string, unknown>) =>
    JSON.stringify(entries, null, 4);

describe("validateLangSource", () => {
    it("passes a shippable file", () => {
        const raw = asFile({
            "SOHL.Skill.label": "Skill",
            "SOHL.Skill.Mastery.label": "Mastery Level",
            "SOHL.Actor.greeting": "Well met, {name}.",
        });
        expect(validateLangSource(raw)).toEqual([]);
    });

    it("reports a file that does not parse, and says nothing else", () => {
        const findings = validateLangSource('{ "a": }');
        expect(findings).toHaveLength(1);
        expect(findings[0].severity).toBe("error");
        expect(findings[0].message).toContain("not valid JSON");
    });

    // The `sohl-kethira-basic` shape: an array wrapping object pairs. Valid
    // JSON would survive `Object.entries` and pass every other rule here while
    // localizing nothing, so the shape has to be checked on its own.
    it("reports a top level that is an array", () => {
        const findings = validateLangSource('["SOHL.a", "SOHL.b"]');
        expect(findings).toHaveLength(1);
        expect(findings[0].message).toContain("an array");
        expect(findings[0].message).toContain("must be a JSON object");
    });

    it("reports a top level that is a scalar", () => {
        const findings = validateLangSource('"just a string"');
        expect(findings).toHaveLength(1);
        expect(findings[0].message).toContain("a string");
    });

    // `sohl-kethira-basic/lang/en.json` as authored — an array wrapping object
    // pairs is not valid JSON at all, so it is caught a step earlier. Both
    // spellings of the same mistake have to fail; neither may ship.
    it("reports the array-wrapping-pairs shape authored in the wild", () => {
        const raw = '[\n    "KETHBAS.Calendar.Tuzyn.EraAbbr": "TR"\n]';
        const findings = validateLangSource(raw);
        expect(findings).toHaveLength(1);
        expect(findings[0].message).toContain("not valid JSON");
    });

    it("reports a key that is both a leaf and a dotted prefix", () => {
        const raw = asFile({
            "SOHL.Trauma.Pall": "The Pall",
            "SOHL.Trauma.Pall.Note.Resist": "Resist it.",
        });
        const findings = validateLangSource(raw);
        expect(findings).toHaveLength(1);
        expect(findings[0].message).toBe(
            '"SOHL.Trauma.Pall" is a leaf but also a prefix of "SOHL.Trauma.Pall.Note.Resist"',
        );
    });

    it("positions a collision at the offending key, not at the file", () => {
        const raw = asFile({
            "SOHL.a": "first",
            "SOHL.Trauma.Pall": "The Pall",
            "SOHL.Trauma.Pall.Note": "Note",
        });
        const [finding] = validateLangSource(raw);
        // Line 3 of the pretty-printed object: `{`, then one key per line.
        expect(finding.line).toBe(3);
        expect(finding.column).toBeGreaterThan(0);
    });

    it("reports Handlebars double braces in a value", () => {
        const raw = asFile({ "SOHL.Actor.greeting": "Well met, {{name}}." });
        const findings = validateLangSource(raw);
        expect(findings).toHaveLength(1);
        expect(findings[0].message).toContain("double braces");
    });

    it("reports an unbalanced brace in a value", () => {
        const raw = asFile({ "SOHL.Actor.greeting": "Well met, {name." });
        const findings = validateLangSource(raw);
        expect(findings).toHaveLength(1);
        expect(findings[0].message).toContain("unbalanced brace");
    });

    it("reports a key segment carrying data", () => {
        const raw = asFile({ "SOHL.Item.assets/icons/axe.webp": "Axe" });
        const findings = validateLangSource(raw);
        expect(findings.some((f) => f.message.includes("outside"))).toBe(true);
    });

    it("ignores a non-string value rather than guessing at it", () => {
        const raw = asFile({ "SOHL.Nested": { label: "Fine" } });
        expect(validateLangSource(raw)).toEqual([]);
    });

    it("accepts an empty object", () => {
        expect(validateLangSource("{}")).toEqual([]);
    });
});

describe("findPrefixCollisions", () => {
    it("finds nothing when every key is a leaf", () => {
        expect(
            findPrefixCollisions({ "a.b": "1", "a.c": "2", d: "3" }),
        ).toEqual([]);
    });

    it("pairs each prefix with the leaf that exposes it", () => {
        expect(findPrefixCollisions({ "a.b": "1", "a.b.c": "2" })).toEqual([
            ["a.b", "a.b.c"],
        ]);
    });

    it("reports every leaf a single prefix collides with", () => {
        const collisions = findPrefixCollisions({
            "a.b": "1",
            "a.b.c": "2",
            "a.b.d": "3",
        });
        expect(collisions).toHaveLength(2);
    });

    // A prefix that is not itself a key is a branch, which is the normal case.
    it("does not report a prefix that is not a key", () => {
        expect(findPrefixCollisions({ "a.b.c": "1" })).toEqual([]);
    });
});
