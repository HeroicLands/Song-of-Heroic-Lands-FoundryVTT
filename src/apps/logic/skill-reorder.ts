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
 * One rendered skill group on the Being sheet's Skills tab, in render order.
 */
export interface SkillOrderGroup {
    /** The group's skill subType — its identity, and never changed by a drag. */
    subType: string;
    /** The group's skill ids, in their current display order. */
    ids: string[];
}

/** Where a drag was released. */
export interface SkillDropTarget {
    /** Index into the rendered groups of the ledger that received the drop. */
    groupIndex: number;
    /**
     * The id of the row dropped onto, if any. The dragged skill lands
     * immediately *before* it. Absent when the drop missed a row (the group's
     * empty space), which means "the end".
     */
    beforeId?: string;
}

/**
 * Resolve the new display order for a dragged skill's own group.
 *
 * **A drag never re-parents.** A skill's group comes from its `subType`, so
 * dropping it onto another group does not move it there; it clamps to the near
 * edge of its own group instead:
 *
 * | Drop lands in… | Result |
 * | --- | --- |
 * | a group **below** the skill's own | sorted to the **bottom** of its own group |
 * | a group **above** the skill's own | sorted to the **top** of its own group |
 * | the skill's **own** group | ordinary reorder at the drop position |
 *
 * Because every drop resolves to a defined position, the interaction can never
 * fail or bounce: no drop target needs disabling and no rejection state exists.
 *
 * Pure — it reasons about ids and order only, so the caller maps the result onto
 * whatever persistence it uses (`sort` values, in the sheet's case).
 *
 * @param groups - The rendered groups, in display order.
 * @param sourceId - The id of the dragged skill.
 * @param target - Where the drag was released.
 * @returns The source group's ids in their new order, or `undefined` when the
 *   drop changes nothing (including an unknown source) so the caller writes no
 *   update.
 */
export function resolveSkillReorder(
    groups: SkillOrderGroup[],
    sourceId: string,
    target: SkillDropTarget,
): string[] | undefined {
    const sourceGroupIndex = groups.findIndex((g) => g.ids.includes(sourceId));
    if (sourceGroupIndex < 0) return undefined;

    // Dropped on itself. Distinct from missing a row: that means "the end",
    // whereas this means "no move at all", and the two must not collapse — the
    // source is filtered out of `rest` below, so a self-target would otherwise
    // look like an absent one and send the skill to the bottom of its group.
    if (target.beforeId === sourceId) return undefined;

    const ids = groups[sourceGroupIndex].ids;
    const from = ids.indexOf(sourceId);
    const rest = ids.filter((id) => id !== sourceId);

    // Where does the skill land? Only a drop inside its own group can position
    // it relative to a row; anything else clamps to an edge.
    let to: number;
    if (target.groupIndex > sourceGroupIndex) {
        to = rest.length; // dropped below its group → bottom
    } else if (target.groupIndex < sourceGroupIndex) {
        to = 0; // dropped above its group → top
    } else {
        // Own group. A `beforeId` naming a row outside this group is ignored
        // rather than trusted — a stale or hand-crafted payload must not be able
        // to splice a skill against a row it cannot legally sit beside.
        const beforeIndex = target.beforeId != null ? rest.indexOf(target.beforeId) : -1;
        to = beforeIndex < 0 ? rest.length : beforeIndex;
    }

    // Nothing to write when the skill is already where the drop would put it.
    if (to === from) return undefined;

    const next = [...rest];
    next.splice(to, 0, sourceId);
    return next;
}
