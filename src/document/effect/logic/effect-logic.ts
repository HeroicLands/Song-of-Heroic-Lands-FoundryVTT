/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ValueDelta } from "@src/entity/modifier/ValueDelta";
import {
    VALUE_DELTA_OPERATOR,
    type ValueDeltaOperator,
} from "@src/utils/constants";

/**
 * Pure mapping rules behind SoHL's Active-Effect change application. The
 * Foundry-coupled dispatchers (which resolve document paths via
 * `foundry.utils.getProperty`) live on the document in
 * `foundry/SohlActiveEffect.ts`; these helpers carry no Foundry dependency and
 * are unit-testable in isolation.
 *
 * @module effect-logic
 */

/**
 * Map a Foundry `change.type` string to a SoHL `VALUE_DELTA_OPERATOR`.
 * Unknown types fall back to `ADD`. CUSTOM is only valid when the
 * ValueModifier has a `customFunction`.
 *
 * @param type - The Foundry change type string.
 * @returns The corresponding `VALUE_DELTA_OPERATOR` (`ADD` for unknown types).
 */
export function changeTypeToOperator(type: string): ValueDeltaOperator {
    switch (type) {
        case "add":
            return VALUE_DELTA_OPERATOR.ADD;
        case "multiply":
            return VALUE_DELTA_OPERATOR.MULTIPLY;
        case "override":
            return VALUE_DELTA_OPERATOR.OVERRIDE;
        case "upgrade":
            return VALUE_DELTA_OPERATOR.UPGRADE;
        case "downgrade":
            return VALUE_DELTA_OPERATOR.DOWNGRADE;
        case "custom":
            return VALUE_DELTA_OPERATOR.CUSTOM;
        default:
            return VALUE_DELTA_OPERATOR.ADD;
    }
}

/**
 * Push a `ValueDelta` constructed from the change directly onto the
 * `ValueModifier.deltas` array. Bypasses the `add/multiply/...` API so we
 * can use a stable `"SOHL.INFO.ActiveEffect"` name (the user-facing label
 * still surfaces through `effect.name` via the shortcode).
 *
 * @param vm - The value modifier to receive the delta.
 * @param change - The effect change describing the operator and value.
 */
export function pushDeltaToValueModifier(vm: ValueModifier, change: any): void {
    const effectName = change?.effect?.name ?? "Active Effect";
    const shortcode = effectName.slice(0, 16);
    try {
        const delta = new ValueDelta(
            {
                name: "SOHL.INFO.ActiveEffect",
                shortcode,
                op: changeTypeToOperator(String(change.type ?? "add")),
                value: String(change.value ?? 0),
            },
            { parent: vm.parent },
        );
        // Remove any existing delta from this same effect, then push fresh.
        vm.deltas = vm.deltas.filter((d) => d.shortcode !== shortcode);
        vm.deltas.push(delta);
        // Mark the modifier dirty so the next `effective` access recomputes.
        (vm as any).dirty = true;
    } catch (err) {
        sohl.log.warn("ActiveEffect delta construction failed:", {
            effect: effectName,
            change,
            error: err,
        });
    }
}
