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

/**
 * Foundry-free view-model helpers for the Active Effect editor
 * (`SohlActiveEffectSheet`): the change-type label map and the scope → effect-key
 * namespace resolution behind the Changes tab. They take plain inputs (never
 * Foundry document types) so they run — and are unit-tested — without Foundry.
 */

import { ACTIVE_EFFECT_SCOPE, ITEM_METADATA } from "@src/utils/constants";

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
 * The `key`-dropdown choices for a resolved metadata type, read from
 * {@link ITEM_METADATA}. Unknown types (e.g. an actor type) have no choices.
 *
 * @param metadataType - The metadata type from {@link resolveEffectMetadataType}.
 * @returns The key choices, or an empty array when the type has none.
 */
export function resolveEffectKeyChoices(metadataType: string): unknown[] {
    const itemData =
        metadataType in ITEM_METADATA ?
            ITEM_METADATA[metadataType as keyof typeof ITEM_METADATA]
        :   undefined;
    return (
        (itemData as { KeyChoices?: unknown[] } | undefined)?.KeyChoices ?? []
    );
}
