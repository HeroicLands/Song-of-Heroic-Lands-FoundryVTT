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

import { dialog, fvttFindDiseases } from "@src/core/FoundryHelpers";
import { toFilePath } from "@src/utils/helpers";

/**
 * A candidate disease the being may contract, gathered from the world and the
 * Item compendium packs (only `disease`-subtype afflictions are contractable).
 * `source` is the affliction's creation data (`toObject()`), copied verbatim
 * onto the being when the disease is contracted.
 */
export interface AfflictionChoice {
    /** Display name of the disease. */
    name: string;
    /** The affliction's shortcode — the `<option>` value in the contagion dialog. */
    shortcode: string;
    /**
     * A {@link sohl.entity.roll.SimpleRoll} formula giving the days between
     * contracting the affliction and its onset; `null` when it has none.
     */
    onsetFormula: string | null;
    /**
     * Contagion index (CI). Lower is more contagious — the contagion roll is
     * made against `CI × Endurance`, so a lower CI is a lower (easier-to-fail)
     * target.
     */
    contagionIndex: number;
    /** Creation data for copying the disease onto an actor. */
    source: Record<string, unknown>;
}

/**
 * Coerce an unknown form value to an integer, defaulting to `0`.
 * @param value - The value to coerce.
 * @returns The coerced integer.
 */
function toInt(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/**
 * The being's answers from the **Contagion Test** dialog (#1183): which
 * affliction they were exposed to, how the roll is modified, and whether a
 * contracted affliction is recorded on the sheet.
 */
export interface ContagionTestChoice {
    /** The chosen affliction. */
    affliction: AfflictionChoice;
    /** Modifier added to the contagion roll. */
    situationalModifier: number;
    /** Offset applied to the test's success level. */
    successLevelMod: number;
    /** Whether a contracted affliction is added to the character sheet. */
    record: boolean;
}

/**
 * Parse the Contagion Test dialog form into a {@link ContagionTestChoice}.
 * Pure and Foundry-free so it can be unit-tested.
 *
 * @param formData - The parsed dialog form data.
 * @param afflictions - The candidate afflictions; the `<select>` option values
 *   are their **shortcodes**.
 * @returns The parsed choice, or `null` when the selected shortcode is unknown.
 */
export function readContagionTestForm(
    formData: Record<string, unknown>,
    afflictions: AfflictionChoice[],
): ContagionTestChoice | null {
    const shortcode = String(formData.affliction ?? "").trim();
    const affliction = afflictions.find((a) => a.shortcode === shortcode);
    if (!affliction) return null;
    return {
        affliction,
        situationalModifier: toInt(formData.situationalModifier),
        successLevelMod: toInt(formData.successLevelMod),
        record: !!formData.record,
    };
}

/**
 * Build the item-creation data for a contracted affliction (#1183): the source
 * affliction copied verbatim (minus its `_id`, so Foundry mints a fresh one),
 * with the contract anchored at `now` and the rolled incubation recorded.
 *
 * @param choice - The affliction that was contracted.
 * @param now - The current world time (seconds) — the contract date.
 * @param onsetSeconds - The rolled incubation, in seconds.
 * @returns Plain item-creation data for `createEmbeddedDocuments`.
 */
export function buildContractedAfflictionData(
    choice: AfflictionChoice,
    now: number,
    onsetSeconds: number,
): Record<string, unknown> {
    const data: Record<string, any> = { ...choice.source };
    delete data._id;
    data.system = {
        ...(data.system ?? {}),
        contractDate: now,
        onsetDurationBase: onsetSeconds,
    };
    return data;
}

/**
 * Present the **Contagion Test** dialog: a shortcode-keyed dropdown of every
 * contagious affliction found in the world and the Item compendium packs, a
 * Situational Modifier and Success Level Modifier for the roll, and a checkbox
 * deciding whether a contracted affliction is recorded on the sheet.
 *
 * All Foundry work (the search and the {@link dialog}) lives at the boundary; the
 * returned choice is a plain, Foundry-free object.
 *
 * @param recordDefault - Default state of the "add to character sheet" checkbox,
 *   taken from the `recordTrauma` system setting.
 * @returns The being's choice, or `null` if the dialog was dismissed or the
 *   selection was invalid.
 */
export async function promptContagionTest(
    recordDefault: boolean,
): Promise<ContagionTestChoice | null> {
    const afflictions = await fvttFindDiseases();
    const result = (await dialog({
        title: "Contagion Test",
        template: toFilePath("systems/sohl/templates/dialog/contagion-test-dialog.hbs"),
        data: {
            afflictions: afflictions.map((a) => ({
                shortcode: a.shortcode,
                name: a.name,
            })),
            record: recordDefault,
        },
        callback: (data: Record<string, unknown>) => readContagionTestForm(data, afflictions),
        rejectClose: false,
    })) as ContagionTestChoice | null;
    return result ?? null;
}
