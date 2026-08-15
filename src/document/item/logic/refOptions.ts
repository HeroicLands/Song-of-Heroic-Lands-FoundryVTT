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

import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import type { ItemKind } from "@src/utils/constants";

/**
 * A single `<option>` for the shortcode-reference field widget (#974): the
 * stored `value` is the referenced document's shortcode, `label` is its display
 * name. A dangling reference (a stored shortcode with no matching candidate) is
 * surfaced as a flagged option rather than being dropped.
 */
export interface ShortcodeRefOption {
    /** The shortcode stored by the field (the option's `value`). */
    value: string;
    /** The candidate's display name (or the shortcode when it has no name). */
    label: string;
    /** `true` when this option preserves a stored shortcode that resolved to
     * no candidate — kept selected and visibly flagged, never blanked. */
    unresolved?: boolean;
}

/** A reference candidate reduced to the two fields the widget needs. */
export interface RefCandidate {
    shortcode: string;
    name: string;
}

/**
 * Build the dropdown options for a shortcode-reference field from a list of
 * candidates. Foundry-free so it is unit-testable without a running client.
 *
 * Candidates with a blank shortcode are skipped and `exclude` (a self-reference
 * shortcode) is filtered out; the remainder is sorted by label. If `selected`
 * is a non-blank shortcode that matches no candidate, a flagged
 * `"<code> (unresolved)"` option is appended and kept selectable so the stored
 * value is preserved and the dangling reference is visible.
 *
 * @param candidates - The reference candidates (`{shortcode, name}`).
 * @param selected - The currently-stored shortcode, if any.
 * @param exclude - A shortcode to omit (e.g. the field owner, to forbid a
 *   self-reference).
 * @returns The options, sorted by label, with any dangling selection appended.
 */
export function buildRefOptions(
    candidates: ReadonlyArray<RefCandidate>,
    selected?: string | null,
    exclude?: string | null,
): ShortcodeRefOption[] {
    const options: ShortcodeRefOption[] = candidates
        .filter((c) => c.shortcode && c.shortcode !== exclude)
        .map((c) => ({ value: c.shortcode, label: c.name || c.shortcode }))
        .sort((a, b) => a.label.localeCompare(b.label));
    if (selected && !options.some((o) => o.value === selected)) {
        options.push({
            value: selected,
            label: `${selected} (unresolved)`,
            unresolved: true,
        });
    }
    return options;
}

/** A reference candidate as {@link RefOptionFilter} sees it: the item logic,
 * reduced to the display name and the persisted data a predicate reads. */
export interface RefFilterCandidate {
    /** The candidate's persisted system data (carrying `subType`, and so on). */
    data: Record<string, any>;
    /** The candidate's display name. */
    name: string;
}

/**
 * A predicate narrowing which candidates {@link actorItemRefOptions} offers —
 * e.g. "only affiliations of an arcane tradition" (#1405). It narrows what a
 * user is *offered*; it never chooses for them, and it never removes a value
 * already stored (a filtered-out selection is still surfaced, flagged
 * unresolved).
 */
export type RefOptionFilter = (candidate: RefFilterCandidate) => boolean;

/**
 * Build shortcode-reference options from an actor's embedded items of a given
 * kind — the primary source for the widget when the referencing item is
 * embedded on an actor. Reads `actorLogic.logicTypes[itemKind]`, mapping each
 * item logic to `{shortcode, name}` before delegating to {@link buildRefOptions}.
 *
 * @param actorLogic - The owning actor's logic (or `null`/`undefined` for a
 *   world/pack item, which yields an empty list — the sheet then falls back to
 *   free-text entry).
 * @param itemKind - The kind of item to list (e.g. `ITEM_KIND.SKILL`).
 * @param selected - The currently-stored shortcode, if any.
 * @param exclude - A shortcode to omit (e.g. the field owner's own shortcode).
 * @param filter - An optional predicate narrowing the candidates offered; every
 *   candidate is offered when it is omitted.
 * @returns The options, sorted by label, with any dangling selection appended.
 */
export function actorItemRefOptions(
    actorLogic: SohlActorLogic<any> | null | undefined,
    itemKind: ItemKind,
    selected?: string | null,
    exclude?: string | null,
    filter?: RefOptionFilter,
): ShortcodeRefOption[] {
    const logics = ((actorLogic?.logicTypes as any)?.[itemKind] ??
        []) as ReadonlyArray<RefFilterCandidate>;
    const candidates = filter ? logics.filter((l) => filter(l)) : logics;
    return buildRefOptions(
        candidates.map((l) => ({
            shortcode: l.data.shortcode as string,
            name: l.name,
        })),
        selected,
        exclude,
    );
}
