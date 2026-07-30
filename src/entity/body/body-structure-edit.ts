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
 * Pure, Foundry-free array operations backing the Being sheet's Body Structure
 * **reorder and delete** affordances. They operate on plain
 * persisted-data arrays and always return **new** arrays, so a caller can hand
 * the result straight to a whole-array Foundry `update()` — never a by-index
 * write, which corrupts the array. Keeping the logic here makes it
 * unit-testable without a live DataModel.
 *
 * (Shortcode validation and the blank factories used by the *add* flow live in
 * `planBodyShortcode.ts` / `blankBodyPart.ts` / `blankBodyLocation.ts`.)
 */

/**
 * Return a copy of `arr` with the element at `from` relocated to index `to`
 * (standard splice-move semantics: remove, then insert at `to`). Returns an
 * unchanged copy when either index is out of range. Never mutates the input.
 *
 * @typeParam T - The array element type.
 * @param arr - The source array (not mutated).
 * @param from - The index of the element to move.
 * @param to - The destination index in the resulting array.
 * @returns A new array with the element moved.
 */
export function moveArrayElement<T>(
    arr: readonly T[],
    from: number,
    to: number,
): T[] {
    const out = [...arr];
    if (from < 0 || from >= out.length || to < 0 || to >= out.length) {
        return out;
    }
    const [moved] = out.splice(from, 1);
    out.splice(to, 0, moved);
    return out;
}

/**
 * Move one element of a **flat, parent-referencing** array — either reordering
 * it among its current siblings or re-parenting it to another group — and
 * return a new array.
 *
 * Since `body.structure` stores zones, parts, and locations as flat sibling
 * arrays, a child's position "within its parent" is just its relative order
 * among the array elements sharing that parent code. Moving it therefore means
 * splicing it to the flat slot currently occupied by the destination group's
 * `toPosition`-th member, after re-stamping its parent code.
 *
 * Placement rules:
 * - `toPosition` past the destination group's end inserts after its last member.
 * - A destination group with no members appends to the end of the array.
 * - An out-of-range `fromIndex` returns an unchanged copy.
 *
 * Never mutates the input.
 *
 * @typeParam T - The persisted element shape.
 * @param items - The source flat array (not mutated).
 * @param fromIndex - Index of the element to move.
 * @param toGroup - Parent code of the destination group (its current parent for
 *   a plain reorder).
 * @param toPosition - Target position among the destination group's members,
 *   counted **after** the element has been removed.
 * @param getGroup - Reads an element's parent code.
 * @param setGroup - Returns a copy of an element stamped with a new parent code.
 * @returns A new array with the element moved (and re-parented if needed).
 */
export function moveGroupedElement<T>(
    items: readonly T[],
    fromIndex: number,
    toGroup: string,
    toPosition: number,
    getGroup: (item: T) => string,
    setGroup: (item: T, group: string) => T,
): T[] {
    const out = [...items];
    if (fromIndex < 0 || fromIndex >= out.length) return out;

    const [moved] = out.splice(fromIndex, 1);
    const reparented =
        getGroup(moved) === toGroup ? moved : setGroup(moved, toGroup);

    // Flat slots currently held by the destination group, in order.
    const memberSlots: number[] = [];
    out.forEach((item, i) => {
        if (getGroup(item) === toGroup) memberSlots.push(i);
    });

    const position = Math.max(0, toPosition);
    const insertAt =
        memberSlots.length === 0 ? out.length
        : position >= memberSlots.length ?
            memberSlots[memberSlots.length - 1] + 1
        :   memberSlots[position];

    out.splice(insertAt, 0, reparented);
    return out;
}

/**
 * Count the elements of a flat array belonging to a given parent — the children
 * a cascading delete would take with it, used to warn before removing a zone or
 * a part.
 *
 * @typeParam T - The persisted element shape.
 * @param items - The flat array to scan.
 * @param group - The parent code to count members of.
 * @param getGroup - Reads an element's parent code.
 * @returns The number of elements naming `group` as their parent.
 */
export function countGroupMembers<T>(
    items: readonly T[],
    group: string,
    getGroup: (item: T) => string,
): number {
    return items.reduce((n, item) => (getGroup(item) === group ? n + 1 : n), 0);
}
