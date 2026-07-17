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
import { AFFLICTION_SUBTYPE, ITEM_KIND } from "@src/utils/constants";

/**
 * A candidate disease the being may contract, gathered from the world and the
 * Item compendium packs (only `disease`-subtype afflictions are contractable).
 * `source` is the affliction's creation data (`toObject()`), copied verbatim
 * onto the being when the disease is contracted.
 */
export interface AfflictionChoice {
    /** Display name of the disease. */
    name: string;
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
 * The being's choice from the contract-affliction dialog: either an existing
 * affliction (copied from its `source`) or a custom one described inline.
 */
export type ContractAfflictionChoice =
    | {
          kind: "existing";
          name: string;
          contagionIndex: number;
          source: Record<string, unknown>;
      }
    | {
          kind: "custom";
          name: string;
          subType: string;
          contagionIndex: number;
      };

/** Sentinel `<select>` value marking the "custom affliction" option. */
export const CONTRACT_AFFLICTION_CUSTOM = "__custom__";

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
 * Clamp a contagion index into the valid `1..5` range.
 * @param value - The contagion index to clamp.
 * @returns The clamped contagion index.
 */
function clampCI(value: number): number {
    return Math.min(5, Math.max(1, value || 1));
}

/**
 * The contagion-roll target: `CI × Endurance`. The roll is d100 roll-under, and
 * *failing* it means the affliction is contracted. Because lower CI yields a
 * lower target (easier to roll over, i.e. fail), a lower CI is more contagious.
 *
 * @param contagionIndex - The affliction's contagion index (CI).
 * @param enduranceScore - The being's Endurance attribute score.
 * @returns The success-test target (never negative).
 */
export function contagionTarget(
    contagionIndex: number,
    enduranceScore: number,
): number {
    const target = contagionIndex * enduranceScore;
    return Number.isFinite(target) ? Math.max(0, Math.round(target)) : 0;
}

/**
 * Parse the contract-affliction dialog form into a {@link ContractAfflictionChoice}.
 * Pure and Foundry-free so it can be unit-tested.
 *
 * @param formData - The parsed dialog form data.
 * @param afflictions - The candidate afflictions, indexed by their position in
 *   this array (the `<select>` option values are those indices).
 * @returns The chosen affliction, or `null` if the selection is invalid (an
 *   unknown index, or a custom affliction with no name).
 */
export function readContractAfflictionForm(
    formData: Record<string, unknown>,
    afflictions: AfflictionChoice[],
): ContractAfflictionChoice | null {
    const selection = String(formData.selection ?? "");
    if (selection === CONTRACT_AFFLICTION_CUSTOM) {
        const name = String(formData.customName ?? "").trim();
        if (!name) return null;
        // Only diseases can be contracted, so the subtype is fixed.
        return {
            kind: "custom",
            name,
            subType: AFFLICTION_SUBTYPE.DISEASE,
            contagionIndex: clampCI(toInt(formData.customCI)),
        };
    }
    const chosen = afflictions[Number(selection)];
    if (!chosen) return null;
    return {
        kind: "existing",
        name: chosen.name,
        contagionIndex: chosen.contagionIndex,
        source: chosen.source,
    };
}

/**
 * Build the item-creation data for a contracted affliction. For an existing
 * affliction the `source` creation data is copied verbatim (minus its `_id`, so
 * Foundry mints a fresh one); for a custom affliction a fresh `affliction` item
 * is described from the supplied name, subtype, and CI.
 *
 * @param choice - The being's contract-affliction choice.
 * @returns Plain item-creation data for `createEmbeddedDocuments`.
 */
export function buildContractedAfflictionData(
    choice: ContractAfflictionChoice,
): Record<string, unknown> {
    if (choice.kind === "custom") {
        return {
            type: ITEM_KIND.AFFLICTION,
            name: choice.name,
            system: {
                subType: choice.subType,
                contagionIndexBase: choice.contagionIndex,
            },
        };
    }
    const data = { ...choice.source };
    delete data._id;
    return data;
}

/**
 * Present the contract-affliction dialog: a dropdown of every disease found in
 * the world and the Item compendium packs, plus a "custom disease" option whose
 * name/CI fields are used when that option is selected. Only diseases can be
 * contracted, so the subtype is not asked.
 *
 * All Foundry work (the search and the {@link dialog}) lives at the boundary;
 * the returned choice is a plain, Foundry-free object.
 *
 * @returns The being's choice, or `null` if the dialog was dismissed or the
 *   selection was invalid.
 */
export async function promptContractDisease(): Promise<ContractAfflictionChoice | null> {
    const afflictions = await fvttFindDiseases();
    const result = (await dialog({
        title: "Contract Disease",
        template: toFilePath(
            "systems/sohl/templates/dialog/contract-disease-dialog.hbs",
        ),
        data: {
            afflictions: afflictions.map((a, index) => ({
                index: String(index),
                name: a.name,
            })),
            customValue: CONTRACT_AFFLICTION_CUSTOM,
        },
        callback: (data: Record<string, unknown>) =>
            readContractAfflictionForm(data, afflictions),
        rejectClose: false,
    })) as ContractAfflictionChoice | null;
    return result ?? null;
}
