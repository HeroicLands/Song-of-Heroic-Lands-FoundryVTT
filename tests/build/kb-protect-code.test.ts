/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time KB helper (plain ESM, no Foundry). Imported by relative path
// because the KB build scripts live outside the `@src` alias tree.
import { protectCode } from "../../utils/kb-protect-code.mjs";

/** A transform that would mangle anything reaching it. */
const mangle = (t: string) => t.replace(/\[\[([^\]]+)\]\]/g, "MANGLED");

describe("protectCode", () => {
    it("hides an inline code span from the transform", () => {
        const body = "a hyphenated _name_ (`[[Grukar-ahk]]`) stays a name";
        expect(protectCode(body, mangle)).toBe(body);
    });

    it("transforms prose between two spans, not the spans", () => {
        // Balanced backticks pair correctly under any implementation; this
        // pins the ordinary case the harder ones below deviate from.
        const body = "`one` then [[a link]] then `two`";
        expect(protectCode(body, mangle)).toBe("`one` then MANGLED then `two`");
    });

    it("keeps a span safe even when an odd backtick precedes it (#1665)", () => {
        // A real regression guard: this returned "`MANGLED`" before the fix.
        // A single-backtick span was allowed to cross newlines, so the stray
        // backtick paired with the *opening* backtick of the span below it.
        // That masked the prose between them as code and left the span's own
        // content exposed — and pairing stayed wrong for the rest of the file,
        // which is how a documented `[[Grukar-ahk]]` example lost its brackets.
        const body = ["a stray ` backtick", "", "then `[[kept]]` here"].join(
            "\n",
        );
        expect(protectCode(body, mangle)).toContain("`[[kept]]`");
    });

    it("hides a fence longer than three backticks (#1505)", () => {
        // The second real regression guard: this mangled `grid[[0]]` before the
        // fix. Only ``` fences were recognised, so a ````-fenced example
        // wrapping a ```js block leaked its contents — which is exactly how the
        // page documenting the link syntax has to be written.
        const body = [
            "````markdown",
            "```js",
            "const first = grid[[0]];",
            "```",
            "",
            "Write [[skill-wpnc]] to link the skill.",
            "````",
        ].join("\n");
        expect(protectCode(body, mangle)).toBe(body);
    });

    it("hides a tilde fence", () => {
        const body = ["~~~", "[[not a link]]", "~~~"].join("\n");
        expect(protectCode(body, mangle)).toBe(body);
    });

    it("still transforms ordinary prose", () => {
        expect(protectCode("plain [[target]] here", mangle)).toBe(
            "plain MANGLED here",
        );
    });

    it("restores every stashed run in order", () => {
        const body = "`a` [[x]] `b` [[y]] `c`";
        expect(protectCode(body, mangle)).toBe("`a` MANGLED `b` MANGLED `c`");
    });

    it("survives a body with no code at all", () => {
        expect(protectCode("nothing to protect", mangle)).toBe(
            "nothing to protect",
        );
    });

    it("treats an absent body as empty rather than throwing", () => {
        expect(protectCode(undefined as unknown as string, mangle)).toBe("");
    });
});
