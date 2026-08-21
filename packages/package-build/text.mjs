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
 * Locating a literal inside an arbitrary text file.
 *
 * A build check reports a **finding**, and a finding is only actionable if it
 * says where it is (#1668). Most findings are *about* a string the check
 * matched — a key, a marker, a caption — so its position is one string search
 * away, and making that search is the difference between a finding that can be
 * opened and one that has to be hunted for.
 *
 * `@heroiclands/content-build` owns the diagnostic **format**, and its
 * `positionInBody` maps an offset within a parsed content note back to its
 * file. That is a different job: the checks here read localization files,
 * manifests, source and bundles — none of which are notes. So this module
 * carries the generic operation, and nothing carries it twice.
 *
 * Plain ESM with no filesystem access, so it is unit-testable.
 *
 * @module
 */

/**
 * Where a literal sits in a text.
 *
 * @param {string} text - The file's contents.
 * @param {string} needle - The literal to locate.
 * @param {number} [occurrence] - Which occurrence, 1-based. Repeats of the same
 *   literal are otherwise indistinguishable, which is the symptom the
 *   diagnostic format exists to remove.
 * @returns {{line: number, column: number}|undefined} 1-based position, or
 *   `undefined` when the literal is not there. A caller that gets `undefined`
 *   reports the file alone rather than a position that is not the problem.
 */
export function locateInText(text, needle, occurrence = 1) {
    if (typeof text !== "string" || !needle) return undefined;
    let at = -1;
    for (let n = 0; n < occurrence; n++) {
        at = text.indexOf(needle, at + 1);
        if (at === -1) return undefined;
    }
    const before = text.slice(0, at);
    return {
        line: before.split("\n").length,
        column: at - before.lastIndexOf("\n"),
    };
}

/**
 * Where a literal sits, as spreadable diagnostic fields.
 *
 * Keeps the drop-rather-than-guess rule in one place: an unfound literal
 * contributes no position at all, rather than `undefined` fields that read as a
 * bug or a `1:1` that sends the reader to the top of the file.
 *
 * @param {string} text - The file's contents.
 * @param {string} needle - The literal to locate.
 * @param {number} [occurrence] - Which occurrence, 1-based.
 * @returns {{line?: number, column?: number}} Spreadable position fields.
 */
export function positionOf(text, needle, occurrence = 1) {
    return locateInText(text, needle, occurrence) ?? {};
}
