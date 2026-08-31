/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import * as prettier from "prettier";

const REPO_ROOT = path.resolve(__dirname, "../..");

/**
 * Prettier's `--ignore-path` defaults to `[.gitignore, .prettierignore]` — the
 * two files **at the repository root**, and nothing else. A `.gitignore` in a
 * subdirectory is never read, so a tree ignored only from there is invisible to
 * git and fully visible to Prettier.
 *
 * That is the whole of #1632: `kb/.gitignore` ignores the generated `content/`,
 * `public/`, and `resources/_gen/` trees, and `npm run format:check` walked
 * straight into them — reporting 735 warnings on generated markdown once
 * `build:kb-content` had run, then failing outright with a `SyntaxError` on
 * Hugo's minified HTML once `build:kb` had. The command's result depended on
 * what had been built rather than on what had been written.
 *
 * The fix is to restate each such tree in `.prettierignore`, and this is what
 * keeps it restated: a new nested ignore rule fails here until it is.
 */
describe("Prettier's ignore set", () => {
    it("covers every tree ignored by a nested .gitignore", async () => {
        const nested = await findNestedGitignores(REPO_ROOT);

        // A guard that found nothing to check would pass forever in silence.
        expect(nested.length).toBeGreaterThan(0);

        const unignored: string[] = [];
        for (const gitignore of nested) {
            for (const dir of ignoredDirectoriesIn(
                await readFile(path.join(REPO_ROOT, gitignore), "utf8"),
                path.dirname(gitignore),
            )) {
                // A file Prettier would never expand a directory into is beside
                // the point; `.md` stands in for "anything it would".
                if (!(await isPrettierIgnored(`${dir}/probe.md`))) {
                    unignored.push(`${dir}/  (from ${gitignore})`);
                }
            }
        }

        expect(unignored).toEqual([]);
    });
});

/**
 * Every `.gitignore` below the root that Prettier can actually reach.
 *
 * One already-ignored path prunes the whole subtree beneath it, which is what
 * keeps this honest without a second list to maintain: `nogit/` (ignored by the
 * root `.gitignore`) and `kb/themes/` (a submodule, excluded by name in
 * `.prettierignore`) both carry nested ignore files of their own, and neither is
 * this repository's to format.
 *
 * @param root Absolute path of the repository root.
 * @returns Repo-relative paths, root `.gitignore` excluded.
 */
async function findNestedGitignores(root: string): Promise<string[]> {
    const found: string[] = [];

    async function walk(relDir: string): Promise<void> {
        const entries = await readdir(path.join(root, relDir || "."), {
            withFileTypes: true,
        });

        for (const entry of entries) {
            const rel = relDir ? `${relDir}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                if (entry.name === ".git" || entry.name === "node_modules") continue;
                if (await isPrettierIgnored(`${rel}/probe.md`)) continue;
                await walk(rel);
            } else if (entry.name === ".gitignore" && relDir) {
                found.push(rel);
            }
        }
    }

    await walk("");
    return found;
}

/**
 * Directory patterns a `.gitignore` body ignores, resolved against the repository
 * root.
 *
 * Only directories (a trailing `/`) are collected. Prettier expands a directory
 * argument to the files whose extension it recognises, so a generated *tree* is
 * what it walks into; a single ignored file with no Prettier parser — `kb`'s
 * `.hugo_build.lock`, say — is never reached either way.
 *
 * @param body Contents of the `.gitignore` file.
 * @param relDir Repo-relative directory the file sits in.
 * @returns Repo-relative directory paths, without a trailing slash.
 */
function ignoredDirectoriesIn(body: string, relDir: string): string[] {
    return (
        body
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"))
            // A negation re-includes rather than ignores, so it has nothing to say
            // about what Prettier must skip.
            .filter((line) => !line.startsWith("!"))
            .filter((line) => line.endsWith("/"))
            .map((line) => `${relDir}/${line.replace(/^\/+|\/+$/g, "")}`)
    );
}

/**
 * Whether Prettier would skip a path, asked exactly the way the CLI asks it.
 *
 * The `ignorePath` here is not a preference — it is `--ignore-path`'s documented
 * default restated, so this reports what `npx prettier --check .` does rather
 * than what a differently-configured run might.
 *
 * @param relPath Repo-relative path to test.
 * @returns `true` when Prettier's ignore set covers it.
 */
async function isPrettierIgnored(relPath: string): Promise<boolean> {
    const info = await prettier.getFileInfo(path.join(REPO_ROOT, relPath), {
        ignorePath: [path.join(REPO_ROOT, ".gitignore"), path.join(REPO_ROOT, ".prettierignore")],
    });
    return info.ignored;
}
