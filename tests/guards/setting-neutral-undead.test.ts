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
 * Terminology guard: the system is setting-neutral, so a folk word belonging to
 * one world may not stand in for a rules term. The words below name the undead
 * in the Nordlands of Thalorna; a table playing Hârn, or a world of its own
 * making, would read a stranger's mythology on a chat card describing what
 * happened to its character. The rules word for the category is **undead**,
 * with the distinction the Pall draws: one that keeps its will, and one that is
 * mindless and driven.
 *
 * The scan covers every tracked text file — rules content, the user guide,
 * `lang/en.json`, templates, styles and source alike — because the words reach
 * a player through any of them. `CHANGELOG.md` and `.changeset/` are exempt:
 * both are a published record of releases, not prose a rule can be restated in.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Spelled in pieces so this guard is not itself an occurrence of what it
 * forbids — a repository-wide search for any of the three finds only a real
 * offender.
 */
const FORBIDDEN = [
    ["Hel", "spawn"],
    ["Night", "wight"],
    ["Hel", "thraal"],
].map(([head, tail]) => `${head}${tail}`);

const PATTERN = new RegExp(`(${FORBIDDEN.join("|")})`, "i");

/** Extensions whose contents a reader (or a build) treats as text. */
const TEXT = new Set([
    ".css",
    ".hbs",
    ".html",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".scss",
    ".svg",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
]);

/** Paths the guard does not read, as prefixes relative to the repository root. */
const EXEMPT = ["CHANGELOG.md", ".changeset/"];

/** Every file git tracks, as a repository-relative POSIX path. */
function trackedFiles(): string[] {
    const out = execFileSync("git", ["ls-files", "-z"], {
        cwd: repoRoot,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
    });
    return out.split("\0").filter((f) => f.length > 0);
}

const files = trackedFiles().filter((f) => !EXEMPT.some((e) => f === e || f.startsWith(e)));

describe("the undead are named in the system's own words", () => {
    it("names no world's folk word for them in a tracked path", () => {
        const offenders = files.filter((f) => PATTERN.test(f));
        expect(
            offenders,
            `These paths carry a setting-specific name for the undead; ` +
                `the rules word is "undead":\n` +
                offenders.map((f) => `  ${f}`).join("\n"),
        ).toEqual([]);
    });

    it("names no world's folk word for them in a tracked text file", () => {
        const offenders: string[] = [];
        for (const file of files) {
            if (!TEXT.has(path.extname(file).toLowerCase())) continue;
            const body = readFileSync(path.join(repoRoot, file), "utf8");
            if (!PATTERN.test(body)) continue;
            body.split("\n").forEach((line, i) => {
                if (PATTERN.test(line)) offenders.push(`  ${file}:${i + 1}: ${line.trim()}`);
            });
        }
        expect(
            offenders,
            `These lines carry a setting-specific name for the undead; ` +
                `the rules word is "undead":\n` +
                offenders.join("\n"),
        ).toEqual([]);
    });
});
