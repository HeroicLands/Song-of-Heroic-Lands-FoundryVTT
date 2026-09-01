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
 * Foundry-free view-model helpers shared by the item sheets (`SohlItemSheetBase`).
 *
 * These are the pure pieces behind the base item sheet's context builders and
 * drop handling: subtype-label localization, transferred-effect keying, and the
 * "is there already a similar item?" match used by overwrite-on-drop. They take
 * minimal structural inputs (never Foundry document types) so they run — and are
 * unit-tested — without Foundry; the sheet keeps the Foundry-facing work
 * (collections, dialogs, document mutation).
 */

/**
 * Localize an item's subtype label, falling back to the raw subtype value when
 * no localization entry exists.
 *
 * @param subType - The item's subtype value (empty when the item has none).
 * @param kind - The item kind, used as the localization-key prefix.
 * @returns The localized label, the raw subtype if unlocalized, or `""` when
 *   there is no subtype.
 */
export function localizeSubType(subType: string, kind: string): string {
    if (!subType) return "";
    const locKey = `SOHL.${kind}.SubType.${subType}`;
    const localized = sohl.i18n.localize(locKey);
    return localized !== locKey ? localized : subType;
}

/** The fields that {@link keyTransferredEffects} requires on each effect. */
export interface TransferableEffect {
    /** The effect's unique id, used as the map key. */
    id: string;
    /** When `true` the effect is excluded from the result. */
    disabled?: boolean;
}

/**
 * Key an item's transferred active effects by id, excluding disabled effects.
 *
 * @param transferredEffects - The transferred effects, or `null`/`undefined`.
 * @returns A map of effect id → effect for each enabled effect, in input order.
 */
export function keyTransferredEffects<T extends TransferableEffect>(
    transferredEffects: Iterable<T> | null | undefined,
): Record<string, T> {
    const trxEffects: Record<string, T> = {};
    for (const effect of transferredEffects ?? []) {
        if (!effect.disabled) trxEffects[effect.id] = effect;
    }
    return trxEffects;
}

/** The identifying fields used to match a dropped item against existing ones. */
export interface ItemMatchKey {
    /** The item name. */
    name: string;
    /** The item type. */
    type: string;
    /** The item system data, carrying its subtype. */
    system: {
        /** Optional subtype string for items that support subtypes. */
        subType?: unknown;
    };
}

/**
 * Find an existing item that matches the dropped item by name, type, and
 * subtype — the "similar item" an overwrite-on-drop would replace.
 *
 * @param itemData - The dropped item's identifying fields.
 * @param actorItems - The actor's existing items.
 * @returns The first matching item, or `undefined` when none match.
 */
export function findSimilarItem<T extends ItemMatchKey>(
    itemData: ItemMatchKey,
    actorItems: Iterable<T>,
): T | undefined {
    for (const it of actorItems) {
        if (
            it.name === itemData.name &&
            it.type === itemData.type &&
            it.system.subType === itemData.system.subType
        ) {
            return it;
        }
    }
    return undefined;
}

/** A candidate affiliation a relation row can be named from. */
export interface RelationCandidate {
    /** The affiliation's shortcode — the key a relation is recorded under. */
    shortcode: string;
    /** The affiliation's display name. */
    name: string;
}

/** One row of the Affiliation sheet's relation table (#1404). */
export interface RelationRow {
    /** The other affiliation's shortcode (the stored key). */
    code: string;
    /** The other affiliation's name, or the bare shortcode when unresolved. */
    label: string;
    /** The recorded standing toward it. */
    standing: string;
    /**
     * `true` when the shortcode matched no candidate — the row is shown flagged
     * rather than dropped, so an authored relation is never silently lost.
     */
    unresolved?: true;
}

/**
 * Build the Affiliation sheet's relation rows from the persisted standing table
 * and the affiliations available to name it from.
 *
 * Every recorded key becomes a row: one that matches a candidate is labelled
 * with that candidate's name; one that does not keeps its shortcode as the label
 * and is flagged `unresolved` (a world or compendium affiliation has no
 * candidates at all, so every row is flagged there). Rows are sorted by label.
 *
 * @param relation - The persisted `shortcode → standing` table.
 * @param candidates - The affiliations available to resolve keys against.
 * @returns The rows, sorted by label.
 */
export function buildRelationRows(
    relation: Record<string, string> | null | undefined,
    candidates: ReadonlyArray<RelationCandidate>,
): RelationRow[] {
    const names = new Map(
        candidates.filter((c) => c.shortcode).map((c) => [c.shortcode, c.name || c.shortcode]),
    );
    return Object.entries(relation ?? {})
        .map((entry) => {
            const [code, standing] = entry;
            const label = names.get(code);
            return label === undefined ?
                    { code, label: code, standing, unresolved: true as const }
                :   { code, label, standing };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
}
