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
 * What a `mysticalability` content note is allowed to say.
 *
 * A key a note authors under `sohl:` that no `MysticalAbilityDataModel` field
 * receives is discarded by Foundry when the compendium item is constructed —
 * silently, with nothing at compile or load time to tell the author their
 * value had no effect. `assocMysteryCode` was exactly that for nine notes
 * The DataModel does not declare it, so a note must not set it.
 *
 * This is the copy-side guard. It cannot see the pack builder's emitted block
 * (that lives in `@heroiclands/package-build`, and is
 * the toolchain), but it does keep the notes in this repository
 * honest about the schema they are authored against.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";

const CONTENT = path.resolve(__dirname, "../../assets/content");
const FIXTURE_SETTING = path.resolve(__dirname, "../fixtures/test-setting");

/**
 * The persisted fields `MysticalAbilityDataModel.defineSchema()` declares,
 * beyond the `SohlItemDataModel` base every item shares.
 */
const SCHEMA_FIELDS = [
    "subType",
    "assocSkillCode",
    "assocAffiliationCode",
    "masteryLevelBase",
    "improveFlag",
    "levelBase",
    "charges",
] as const;

/**
 * Authoring directives that are consumed by the content build rather than
 * persisted onto the item: the knowledgebase category the note publishes under,
 * and the archetype ordinal used to resolve an actor's embedded items.
 */
const BUILD_DIRECTIVES = ["kbcat", "archetype"] as const;

/**
 * The schema fields are authored under `sohl.system`, at the paths
 * the compiled document stores, so the block itself carries only that container
 * and the build directives.
 */
const ALLOWED_IN_BLOCK = new Set<string>([...BUILD_DIRECTIVES, "system"]);

const ALLOWED_IN_SYSTEM = new Set<string>(SCHEMA_FIELDS);

/** Every markdown file under `assets/content/`, recursively. */
function* walk(dir: string): Generator<string> {
    for (const entry of readdirSync(dir)) {
        const p = path.join(dir, entry);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (entry.endsWith(".md")) yield p;
    }
}

/** A `type: mysticalability` note: its repo-relative path and `sohl:` block. */
type Note = { rel: string; sohl: Record<string, unknown> };

const NOTES: Note[] = [...walk(CONTENT), ...walk(FIXTURE_SETTING)].flatMap((file) => {
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, "utf8"));
    if (!match) return [];
    const frontmatter = parseYaml(match[1]) as
        { type?: string; sohl?: Record<string, unknown> } | undefined;
    if (frontmatter?.type !== "mysticalability") return [];
    return [
        {
            rel: path.relative(CONTENT, file),
            sohl: frontmatter.sohl ?? {},
        },
    ];
});

describe("mysticalability content notes", () => {
    it("finds the mystical-ability notes to check", () => {
        expect(NOTES.length).toBeGreaterThan(0);
    });

    it.each(NOTES.map((n) => n.rel))("%s authors only fields the schema receives", (rel) => {
        const note = NOTES.find((n) => n.rel === rel)!;
        const block = Object.keys(note.sohl).filter((key) => !ALLOWED_IN_BLOCK.has(key));
        expect(block, "outside `sohl.system` and not a build directive").toEqual([]);
        const system = Object.keys(note.sohl.system ?? {}).filter(
            (key) => !ALLOWED_IN_SYSTEM.has(key),
        );
        expect(system, "under `sohl.system` but not declared by the schema").toEqual([]);
    });

    it("none authors the retired assocMysteryCode", () => {
        const offenders = NOTES.filter(
            (n) =>
                Object.hasOwn(n.sohl, "assocMysteryCode") ||
                Object.hasOwn(n.sohl.system ?? {}, "assocMysteryCode"),
        ).map((n) => n.rel);
        expect(offenders).toEqual([]);
    });
});
