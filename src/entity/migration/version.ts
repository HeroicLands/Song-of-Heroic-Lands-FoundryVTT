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
 * Foundry-free semantic-version comparison for the migration runner.
 *
 * The logic layer stays Foundry-free, so the migration planner cannot reach for
 * `foundry.utils.isNewerVersion`. These helpers reproduce the numeric-triple
 * comparison the runner needs (SoHL versions are `MAJOR.MINOR.PATCH`, e.g.
 * `0.7.0`) with a small, dependency-free parser.
 *
 * @module
 */

/**
 * Parse a version string into a zero-padded numeric triple.
 *
 * A pre-release / build suffix (`-beta.1`, `+build.9`) is dropped, surrounding
 * whitespace is trimmed, missing components pad to `0`, and any non-numeric
 * component coerces to `0` (never `NaN`). An empty or nullish input parses to
 * `[0, 0, 0]` — the identity used for "no migration version stored yet".
 *
 * @param version - The version string (e.g. `"0.7.0"`), possibly empty.
 * @returns A `[major, minor, patch]` numeric triple.
 */
export function parseVersion(version: string | null | undefined): number[] {
    if (version == null) return [0, 0, 0];
    const core = String(version).trim().split(/[-+]/)[0];
    if (!core) return [0, 0, 0];
    const parts = core.split(".").map((p) => {
        const n = Number.parseInt(p, 10);
        return Number.isNaN(n) ? 0 : n;
    });
    while (parts.length < 3) parts.push(0);
    return parts;
}

/**
 * Compare two version strings numerically.
 *
 * @param a - The first version.
 * @param b - The second version.
 * @returns `-1` if `a < b`, `1` if `a > b`, `0` if they are equal (ignoring
 *   zero-padding differences and any pre-release / build suffix).
 */
export function compareVersions(
    a: string | null | undefined,
    b: string | null | undefined,
): number {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (diff !== 0) return diff < 0 ? -1 : 1;
    }
    return 0;
}

/**
 * Whether `candidate` is strictly newer than `baseline`.
 *
 * An empty `baseline` behaves as `0.0.0`, so any real version counts as newer.
 *
 * @param candidate - The version under test.
 * @param baseline - The version to compare against.
 * @returns `true` when `candidate > baseline`.
 */
export function isNewerVersion(
    candidate: string | null | undefined,
    baseline: string | null | undefined,
): boolean {
    return compareVersions(candidate, baseline) > 0;
}
