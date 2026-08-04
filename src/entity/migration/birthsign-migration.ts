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

import type { MigrationSource, MigrationStep } from "./MigrationRegistry";

/**
 * The world-migration step that retires the `birthsign` Mystery subtype and the
 * `birthsignBonus` skill-base helper in favour of the derived birthsign
 * astrology model (#1018 / #1026). Introduced at `0.8.0`.
 *
 * Two source transforms, both seamless and non-destructive:
 *
 * - **Mystery items** whose `subType` is the removed `"birthsign"` are
 *   reclassified to `"other"` (a valid subtype) so they keep validating — the
 *   item, its name, and its notes are preserved as a plain marker the GM may
 *   delete or repurpose. The old marker carried no tradition or date data, so a
 *   semantic conversion into an astrology affiliation is impossible; the derived
 *   birthsign is authored instead via a birthsign Affiliation + the being's
 *   birth date.
 * - **Skill items** whose `skillBaseFormula` still calls the removed
 *   `birthsignBonus(...)` have those terms stripped (see {@link stripBirthsignBonus}),
 *   so the remaining formula still evaluates instead of failing validation.
 *
 * Document deletion is outside the update-payload migration model, so the marker
 * is reclassified rather than removed — no manual intervention is required.
 */

/**
 * The removed Mystery subtype value the migration reclassifies away from.
 * Hard-coded (not imported from the enum) because the value no longer exists in
 * {@link MYSTERY_SUBTYPE}; the migration must still recognize legacy data.
 */
const LEGACY_BIRTHSIGN_SUBTYPE = "birthsign";

/** Matches one `birthsignBonus(...)` call (its arguments never nest parens). */
const BONUS = String.raw`birthsignBonus\s*\([^()]*\)`;

/**
 * Strip every `birthsignBonus(...)` call from a skill-base formula, removing the
 * operator or comma that joined it so the remaining expression still parses.
 *
 * Handles the documented shapes — `sb(...) + birthsignBonus(...)`,
 * `birthsignBonus(...) + sb(...)`, and `max(sb(...), birthsignBonus(...))` — and
 * yields `"0"` when the whole formula was nothing but a birthsign bonus.
 * @param formula - The raw `skillBaseFormula` source.
 * @returns The formula with all `birthsignBonus(...)` terms removed.
 */
export function stripBirthsignBonus(formula: string): string {
    if (!formula.includes("birthsignBonus")) return formula;
    const f = formula
        // ` + birthsignBonus(...)` / ` - birthsignBonus(...)` (bound after).
        .replace(new RegExp(String.raw`\s*[+\-]\s*${BONUS}`, "g"), "")
        // `birthsignBonus(...) + …` (bound before).
        .replace(new RegExp(`${BONUS}` + String.raw`\s*[+\-]\s*`, "g"), "")
        // `, birthsignBonus(...)` (trailing call argument).
        .replace(new RegExp(String.raw`,\s*${BONUS}`, "g"), "")
        // `birthsignBonus(...), ` (leading call argument).
        .replace(new RegExp(`${BONUS}` + String.raw`\s*,\s*`, "g"), "")
        // Any lone term left (the whole formula was a bonus).
        .replace(new RegExp(BONUS, "g"), "0")
        .trim();
    return f === "" ? "0" : f;
}

/**
 * Migrate a single Item source: reclassify a legacy birthsign Mystery and strip
 * `birthsignBonus(...)` from a Skill's `skillBaseFormula`.
 * @param source - The serialized Item source.
 * @returns The update payload, or `undefined` for a no-op.
 */
function migrateItem(
    source: MigrationSource,
): Record<string, unknown> | undefined {
    const update: Record<string, unknown> = {};
    const system = source.system ?? {};
    if (
        source.type === "mystery" &&
        system.subType === LEGACY_BIRTHSIGN_SUBTYPE
    ) {
        update["system.subType"] = "other";
    }
    if (
        source.type === "skill" &&
        typeof system.skillBaseFormula === "string"
    ) {
        const stripped = stripBirthsignBonus(system.skillBaseFormula);
        if (stripped !== system.skillBaseFormula) {
            update["system.skillBaseFormula"] = stripped;
        }
    }
    return Object.keys(update).length ? update : undefined;
}

/** The `0.8.0` birthsign-retirement migration step (#1026). */
export const BIRTHSIGN_RETIREMENT_MIGRATION: MigrationStep = {
    version: "0.8.0",
    description:
        "Retire the BIRTHSIGN Mystery subtype (reclassify to 'other') and strip birthsignBonus(...) from skill-base formulas (#1018/#1026).",
    migrators: {
        Item: migrateItem,
    },
};
