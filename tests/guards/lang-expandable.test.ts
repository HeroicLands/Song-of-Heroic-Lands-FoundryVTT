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
 * Localization-file integrity guard (issue #636): every localization file must
 * survive `foundry.utils.expandObject`, which Foundry runs on each translation
 * file as it loads it (`Localization#loadTranslationFile`). That function turns
 * the flat, dot-keyed JSON into a nested object — and it **throws** if one key is
 * a strict dotted-prefix of another (e.g. `"SOHL.Trauma.Pall"` as a string
 * alongside `"SOHL.Trauma.Pall.Note.Resist"`: it cannot create a `Note` property
 * on the string `"The Pall"`). Foundry catches that throw and discards the
 * **entire** file, so a single colliding pair silently drops *all* of SoHL's
 * translations and every `SOHL.*` / `TYPES.*` string renders as its raw key.
 *
 * This guard reproduces the same collision check as a fast unit test so the
 * regression can never reach a build (it broke the whole e2e suite's localized
 * assertions before it was caught). A key must be either a leaf **or** a branch,
 * never both.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
);

/**
 * Return every `[prefixKey, leafKey]` pair where `prefixKey` is a strict dotted
 * prefix of `leafKey` and both are present as keys — the exact shape that makes
 * `foundry.utils.expandObject` throw.
 */
function findPrefixCollisions(
    json: Record<string, unknown>,
): [string, string][] {
    const keys = Object.keys(json);
    const keySet = new Set(keys);
    const collisions: [string, string][] = [];
    for (const key of keys) {
        const parts = key.split(".");
        for (let i = 1; i < parts.length; i++) {
            const prefix = parts.slice(0, i).join(".");
            if (keySet.has(prefix)) collisions.push([prefix, key]);
        }
    }
    return collisions;
}

const langFiles = globSync("lang/*.json", { cwd: repoRoot, absolute: true });

describe("localization files are expandObject-safe (issue #636)", () => {
    it("finds at least one lang file to check", () => {
        expect(langFiles.length).toBeGreaterThan(0);
    });

    it.each(langFiles)("%s has no dotted-prefix key collisions", (file) => {
        const json = JSON.parse(readFileSync(file, "utf8")) as Record<
            string,
            unknown
        >;
        const collisions = findPrefixCollisions(json);
        expect(
            collisions,
            `${path.relative(repoRoot, file)} has keys that are both a leaf and a ` +
                `branch — foundry.utils.expandObject will throw and Foundry will ` +
                `drop the whole file (issue #636). Make each of these a leaf OR a ` +
                `branch, never both:\n` +
                collisions
                    .map(([p, k]) => `  "${p}" is a prefix of "${k}"`)
                    .join("\n"),
        ).toEqual([]);
    });
});
