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

import { toHTMLString, toFilePath } from "@src/utils/helpers";
import { dialog } from "@src/core/FoundryHelpers";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";

/**
 * Combat-input dialogs (attack / defense / single-choice) and their shared
 * `<option>` renderer. These are pure, side-effect-free UI helpers with no
 * dependency on {@link SohlCombatantLogic}; they live in their own module so the
 * token-logic layer can call {@link showDefenseDialog} without importing the
 * combatant-logic class (which would create a circular import through
 * `SohlLogic`).
 */

/**
 * Render `<option>` HTML for a `{ value: label }` map (raw-content dialogs).
 * @param choices - The `{ value: label }` map to render.
 * @param selected - The value to mark as selected.
 * @returns The concatenated `<option>` HTML.
 */
function renderOptions(
    choices: Record<string, string>,
    selected: string,
): string {
    return Object.entries(choices)
        .map(([value, label]) => {
            const safe = String(label)
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            const sel = value === selected ? " selected" : "";
            return `<option value="${value}"${sel}>${safe}</option>`;
        })
        .join("");
}

/** The attack dialog's results (from the dialog form or from `scope`). */
export interface AttackDialogResult {
    /** The targeted body part (shortcode). */
    aim: string;
    /** The StrikeMode pointer data. */
    mode: StrikeModeBase.PointerData;
    /** Player-entered additional modifier. */
    situationalModifier: number;
    /** The calculated spread for the attack. */
    spread: number;
}

/**
 * Show the attack dialog (Aim + Additional Modifier) and resolve to the chosen
 * inputs, or `null` if dismissed. Side-effect-free.
 * @param title - The dialog window title.
 * @param aimChoices - The body-part aim options.
 * @param defaultAim - The pre-selected aim shortcode.
 * @param modes
 * @param defaultModeIdx - The pre-selected strike-mode index in `modes`.
 * @returns The chosen inputs, or `null` if the dialog was dismissed.
 */
export function showAttackDialog(
    title: string,
    aimChoices: Record<string, string>,
    defaultAim: string,
    modes: Record<string, StrikeModeBase>,
    defaultModeIdx: number,
): Promise<AttackDialogResult | null> {
    const modeChoices: Record<string, string> = Object.fromEntries(
        Object.entries(modes).map(([key, sm]) => [key, sm.id]),
    );
    return dialog({
        title,
        template: toFilePath("systems/sohl/templates/dialog/attack-dialog.hbs"),
        data: {
            aimChoices,
            defaultAim,
            modeChoices,
            defaultModeIdx,
            situationalModifier: 0,
        },
        callback: (f: PlainObject) =>
            ({
                aim: String(f.aim ?? defaultAim),
                situationalModifier:
                    Number.parseInt(String(f.situationalModifier), 10) || 0,
                mode: modes[f.modeIdx as string].pointerData,
                spread: Number.parseInt(String(f.spread), 10) || 0,
            }) satisfies AttackDialogResult,
        rejectClose: false,
    }) as Promise<AttackDialogResult | null>;
}

/**
 * Present a single-select dialog (with a preselected `defaultKey`) and resolve to
 * the chosen key, or `null` if dismissed. Side-effect-free.
 * @param title - The dialog window title.
 * @param label - The select field label.
 * @param choices - The `{ key: label }` options.
 * @param defaultKey - The pre-selected option key.
 * @returns The chosen key, or `null` if the dialog was dismissed.
 */
export function pickChoice(
    title: string,
    label: string,
    choices: Record<string, string>,
    defaultKey: string,
): Promise<string | null> {
    return dialog({
        title,
        content: toHTMLString(
            `<form><div class="form-group"><label>${label}</label><select name="choice">${renderOptions(choices, defaultKey)}</select></div></form>`,
        ),
        callback: (f: PlainObject) => String(f.choice ?? defaultKey),
        rejectClose: false,
    }) as Promise<string | null>;
}

/**
 * Show a defense dialog with a strike-mode select **and** an Additional Modifier
 * field, preselecting `defaultKey`; resolve to `{ key, situationalModifier }` or
 * `null` if dismissed. Side-effect-free. Used by Block.
 * @param title - The dialog window title.
 * @param selectLabel - The strike-mode select field label.
 * @param choices - The `{ key: label }` strike-mode options.
 * @param defaultKey - The pre-selected option key.
 * @returns The chosen key and situational modifier, or `null` if dismissed.
 */
export function showDefenseDialog(
    title: string,
    selectLabel: string,
    choices: Record<string, string>,
    defaultKey: string,
): Promise<
    | {
          /** The selected choice key (e.g. the chosen strike mode). */
          key: string;
          /** The player-entered situational modifier. */
          situationalModifier: number;
      }
    | undefined
> {
    return dialog({
        title,
        content: toHTMLString(
            `<form>` +
                `<div class="form-group"><label>${selectLabel}</label>` +
                `<select name="choice">${renderOptions(choices, defaultKey)}</select></div>` +
                `<div class="form-group"><label>Additional Modifier:</label>` +
                `<input type="number" name="situationalModifier" value="0" /></div>` +
                `</form>`,
        ),
        callback: (f: PlainObject) => ({
            key: String(f.choice ?? defaultKey),
            situationalModifier:
                Number.parseInt(String(f.situationalModifier), 10) || 0,
        }),
        rejectClose: false,
    }) as Promise<{ key: string; situationalModifier: number } | undefined>;
}
