/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { countContentNotes } from "../../utils/packs/content-tree.mjs";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** A throwaway directory tree, described as `{ relPath: contents }`. */
function tree(files: Record<string, string>): string {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-content-"));
    for (const [rel, body] of Object.entries(files)) {
        const abs = path.join(root, ...rel.split("/"));
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, body, "utf8");
    }
    return root;
}

describe("countContentNotes — is there anything to compile?", () => {
    it("counts markdown notes at any depth", () => {
        const root = tree({
            "Skills/Climbing.md": "x",
            "Armor/Armor/Cap.md": "x",
            "README.md": "x",
        });
        expect(countContentNotes(root)).toBe(3);
    });

    it("counts nothing in an empty tree", () => {
        expect(countContentNotes(tree({}))).toBe(0);
    });

    it("counts nothing when the tree is absent entirely", () => {
        expect(
            countContentNotes(path.join(os.tmpdir(), "sohl-no-such-tree")),
        ).toBe(0);
    });

    it("does not count the folder manifests — they are not notes", () => {
        // A tree holding only manifests compiles zero documents, which is
        // exactly the state that must be caught rather than shipped.
        expect(
            countContentNotes(
                tree({
                    "item-folders.yaml": "[]",
                    "actor-folders.yaml": "[]",
                }),
            ),
        ).toBe(0);
    });

    it("ignores dot directories, so editor state cannot mask an empty tree", () => {
        expect(
            countContentNotes(tree({ ".obsidian/cache/stale.md": "x" })),
        ).toBe(0);
    });
});
