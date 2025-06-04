/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

function isDescendantOf(item, ancestorId, allItems) {
    let current = item.system?.nestedIn;
    while (current) {
        if (current === ancestorId) return true;
        current = allItems.find((i) => i.id === current)?.system?.nestedIn;
    }
    return false;
}

/**
 * Get the next multiple of 1000 greater than the given value.
 * @param {number} value
 * @returns {number}
 */
function nextSortBlock(value) {
    return Math.ceil((value + 1) / 1000) * 1000;
}

/**
 * @typedef {object} SortUpdate
 * @property {Item} target - The item to be sorted.
 * @property {object} update - The update object for the item.
 * @property {number} update.sort - The sort key value for the item.
 */

/**
 * Moves a contiguous block (rooted at source) to a new position in the list of items.
 * Preserves existing sort values unless a change is needed.
 * @param {Item[]} items - Full flat list of items in depth-first order.
 * @param {Item} source - The root of the block to move.
 * @param {Item} target - Target object of insertion.
 * @param {boolean} [before=true] - If true, insert before the target; otherwise, insert after.
 * @returns {SortUpdate[]} Array of update objects}
 */
export function moveAndSort(items, source, target, before = true) {
    if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0 ||
        items.some((i) => !(i instanceof Item))
    ) {
        throw new Error("Invalid items array");
    }
    if (!source || !(source instanceof Item)) {
        throw new Error("Invalid source item");
    }

    const parent = source.nestedIn;
    const startIndex = items.findIndex((i) => i.id === source?.id);
    if (startIndex === -1) throw new Error("Source item not found in list");

    // Find end of block (stop when item is no longer a descendant)
    let endIndex = startIndex + 1;
    while (
        endIndex < items.length &&
        isDescendantOf(items[endIndex], source.id, items)
    ) {
        endIndex++;
    }

    const block = items.slice(startIndex, endIndex);
    const siblings =
        parent ?
            items.filter(
                (i) => i.nestedIn?.id === parent.id && i.id !== source.id,
            )
        :   [];

    // Exclude the block from the working list
    const work = items
        .slice(0, startIndex)
        .concat(items.slice(endIndex))
        .map((i) => ({
            target: i,
            update: { sort: i.sort },
        }));

    // Determine where to insert the block
    if (before) {
        insertIndex =
            target ?
                work.findIndex((e) => e.target.id === target.id)
            :   work.length;
    } else {
        insertIndex =
            target ?
                work.findIndex((e) => e.target.id === target.id) + 1
            :   work.length;
    }

    const blockEntries = block.map((i) => ({
        target: i,
        update: { sort: i.sort },
    }));

    // Insert block
    work.splice(insertIndex, 0, ...blockEntries);

    // Reassign sort keys only where needed
    let priorSort = -Infinity;
    for (const entry of work) {
        const current = entry.update.sort;
        if (current <= priorSort) {
            const newSort = nextSortBlock(priorSort);
            entry.update.sort = newSort;
            priorSort = newSort;
        } else {
            priorSort = current;
        }
    }

    // Return updates only for modified items
    return work
        .filter((e) => e.update.sort !== e.target.sort)
        .map((e) => ({
            _id: e.target.id,
            sort: e.update.sort,
        }));
}
