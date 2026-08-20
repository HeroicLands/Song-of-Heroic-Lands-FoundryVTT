/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { countContentNotes } from "../engine/content-tree.mjs";
import { emptyPassErrors } from "../engine/generate.mjs";

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

describe("emptyPassErrors — did anything actually compile?", () => {
    // A tree can be full of notes and still compile nothing: the pack
    // compilers select by the configured content package, so one wrong
    // package id rejects every note and every pack ships blank (#1502).
    it("passes a build whose every pass wrote entries", () => {
        expect(
            emptyPassErrors([
                { name: "items", compiled: 1230 },
                { name: "journals", compiled: 1362 },
            ]),
        ).toEqual([]);
    });

    it("reports a pass that wrote nothing, naming the pack", () => {
        const errors = emptyPassErrors([
            { name: "items", compiled: 1230 },
            { name: "macros", compiled: 0 },
        ]);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("macros");
    });

    it("reports every empty pass, not just the first", () => {
        expect(
            emptyPassErrors([
                { name: "items", compiled: 0 },
                { name: "actors", compiled: 0 },
            ]),
        ).toHaveLength(2);
    });

    it("honours a pack's explicit `mayBeEmpty` opt-out", () => {
        // A consumer package that ships no notes of some type declares it,
        // rather than the build learning to tolerate empty output everywhere.
        expect(
            emptyPassErrors([
                { name: "scenes", compiled: 0, mayBeEmpty: true },
            ]),
        ).toEqual([]);
    });
});
