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
 * Foundry-free view-model helpers for the Active Effect editor
 * (`SohlActiveEffectSheet`): the change-type label map and the scope → effect-key
 * namespace resolution behind the Changes tab. They take plain inputs (never
 * Foundry document types) so they run — and are unit-tested — without Foundry.
 */

import {
    ACTIVE_EFFECT_SCOPE,
    ITEM_METADATA,
    MELEESTRIKEMODE_EFFECT_KEY,
    meleeStrikeModeEffectKeyLabels,
    MISSILESTRIKEMODE_EFFECT_KEY,
    missileStrikeModeEffectKeyLabels,
} from "@src/utils/constants";

/**
 * The dedicated effect-key sets for the strike-mode scopes, keyed by scope
 * value. Each entry maps effect-key name → change path and effect-key name →
 * localization key, so the change-key dropdown can be built as value → label.
 */
const STRIKE_MODE_EFFECT_KEYS: Record<
    string,
    { keys: Record<string, string>; labels: Record<string, string> }
> = {
    [ACTIVE_EFFECT_SCOPE.MELEE_STRIKE_MODE]: {
        keys: MELEESTRIKEMODE_EFFECT_KEY,
        labels: meleeStrikeModeEffectKeyLabels,
    },
    [ACTIVE_EFFECT_SCOPE.MISSILE_STRIKE_MODE]: {
        keys: MISSILESTRIKEMODE_EFFECT_KEY,
        labels: missileStrikeModeEffectKeyLabels,
    },
};

/**
 * Build the localized change-type label map for the change `mode` dropdown from
 * Foundry's `ActiveEffect.CHANGE_TYPES` registry. Each entry is localized by its
 * `label`, falling back to the registry key when it has none.
 *
 * @param changeTypes - The `ActiveEffect.CHANGE_TYPES` registry, or nullish.
 * @returns A map of change-type key → localized label.
 */
export function buildChangeTypesMap(
    changeTypes:
        | Record<string, { label?: string } | undefined>
        | null
        | undefined,
): Record<string, string> {
    const types: Record<string, string> = {};
    for (const [key, config] of Object.entries(changeTypes ?? {})) {
        types[key] = sohl.i18n.localize(config?.label ?? key);
    }
    return types;
}

/**
 * Resolve the effect-key namespace an active effect's `key` dropdown should draw
 * from, based on its `system.scope`:
 *
 * - `"this"` → the parent document's own type (falling back to the effect's type),
 * - `"actor"` → the owning actor's type,
 * - otherwise → the scope value itself (an item kind).
 *
 * @param scope - The effect's `system.scope`, or `undefined`.
 * @param documentType - The effect document's own type.
 * @param parentType - The parent document's type, or `undefined`.
 * @param actorType - The owning actor's type, or `undefined`.
 * @returns The resolved metadata type (item kind / actor type).
 */
export function resolveEffectMetadataType(
    scope: string | undefined,
    documentType: string,
    parentType: string | undefined,
    actorType: string | undefined,
): string {
    if (scope === ACTIVE_EFFECT_SCOPE.THIS) {
        return parentType ?? documentType;
    }
    if (scope === ACTIVE_EFFECT_SCOPE.ACTOR) {
        return actorType ?? "";
    }
    return scope ?? "";
}

/**
 * The `key`-dropdown choices (change path → localized label) for a resolved
 * metadata type. Strike-mode scopes use their dedicated effect-key sets; item
 * kinds read {@link ITEM_METADATA}. Unknown types (e.g. an actor type) have no
 * choices.
 *
 * @param metadataType - The metadata type from {@link resolveEffectMetadataType}.
 * @returns A map of change path → localized label (empty when the type has none).
 */
export function resolveEffectKeyChoices(
    metadataType: string,
): Record<string, string> {
    // Strike-mode scopes: build value → localized label from the effect-key set.
    const smSet = STRIKE_MODE_EFFECT_KEYS[metadataType];
    if (smSet) {
        const out: Record<string, string> = {};
        for (const name of Object.keys(smSet.keys)) {
            out[smSet.keys[name]] = sohl.i18n.localize(smSet.labels[name]);
        }
        return out;
    }
    // Item kinds: KeyChoices from ITEM_METADATA (currently unpopulated; the
    // value-keyed map form is used when present, arrays are ignored).
    const itemData =
        metadataType in ITEM_METADATA ?
            ITEM_METADATA[metadataType as keyof typeof ITEM_METADATA]
        :   undefined;
    const kc = (itemData as { KeyChoices?: unknown } | undefined)?.KeyChoices;
    return kc && !Array.isArray(kc) ? (kc as Record<string, string>) : {};
}
