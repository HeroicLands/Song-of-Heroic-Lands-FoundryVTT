/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Key-table guard: the `sohl:` table in the actor-notes page names exactly the
 * keys a `being` note may write.
 *
 * The accepted set is derived from the toolchain at run time: the being's own
 * declared fields, the keys every note type accepts, and `system`, the
 * passthrough block for the document's own fields. The page's table is parsed
 * from its markdown. The test fails when the table names a key outside the
 * accepted set, and when it omits a key the being declares or the `system`
 * block.
 *
 * It proves the table is complete and names no stranger; whether the sentence
 * beside each key is true is a matter for review.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { UNIVERSAL_KEYS } from "@heroiclands/package-build/engine/frontmatter-lint";
import { SYSTEM_DATA_KEY } from "@heroiclands/package-build/engine/system-block";
import { NOTE_SCHEMAS } from "@heroiclands/package-build/sohl/note-schemas";

const PAGE = "assets/content/Dev_Docs/content-creator/actor-notes.md";
const HEADING = /^## The `sohl:` block\s*$/m;

/** The first-column keys of the table under the page's `sohl:` heading. */
function documentedKeys(markdown: string): string[] {
    const start = markdown.search(HEADING);
    expect(start, `${PAGE} has no "The \`sohl:\` block" heading`).toBeGreaterThanOrEqual(0);
    const after = markdown.slice(start).split("\n").slice(1);
    const end = after.findIndex((line) => /^#{1,6}\s/.test(line));
    const section = end < 0 ? after : after.slice(0, end);
    return section
        .filter((line) => line.startsWith("|"))
        .map((line) => /^\|\s*`([^`]+)`\s*\|/.exec(line)?.[1])
        .filter((key): key is string => key !== undefined);
}

const declaredByBeing = (NOTE_SCHEMAS as Record<string, readonly { name: string }[]>)["being"]!.map(
    (field) => field.name,
);
const required = new Set([...declaredByBeing, SYSTEM_DATA_KEY]);
const accepted = new Set([...required, ...UNIVERSAL_KEYS]);

describe("actor-notes.md `sohl:` key table", () => {
    const documented = documentedKeys(readFileSync(PAGE, "utf8"));

    it("finds the table", () => {
        expect(documented.length).toBeGreaterThan(0);
    });

    it("names no key a being does not accept", () => {
        const strangers = documented.filter((key) => !accepted.has(key));
        expect(strangers).toEqual([]);
    });

    it("names every key specific to a being", () => {
        const omitted = [...required].filter((key) => !documented.includes(key));
        expect(omitted).toEqual([]);
    });
});
