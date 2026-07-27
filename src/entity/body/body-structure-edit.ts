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
 * **reorder and delete** affordances (#720). They operate on plain
 * persisted-data arrays and always return **new** arrays, so a caller can hand
 * the result straight to a whole-array Foundry `update()` — never a by-index
 * write, which corrupts the array (#247). Keeping the logic here makes it
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

/** The minimal part shape the location mover needs: a `locations` array. */
interface PartWithLocations<L> {
    locations: L[];
}

/**
 * Move a hit location from one part to another (or reorder it within its own
 * part), returning a new `parts` array. The two affected parts are shallow-cloned
 * with fresh `locations` arrays; unaffected parts are carried through unchanged.
 * When `toLoc` is past the destination's end the location is appended. Returns an
 * unchanged copy when the source coordinates are out of range. Never mutates the
 * input.
 *
 * Same-part reordering is expressed as `fromPart === toPart`; `toLoc` is the
 * target index **after** the source has been removed.
 *
 * @typeParam P - The part shape (must expose a `locations` array).
 * @typeParam L - The location element type.
 * @param parts - The source parts array (not mutated).
 * @param fromPart - Index of the part the location currently lives on.
 * @param fromLoc - Index of the location within `fromPart`.
 * @param toPart - Index of the destination part.
 * @param toLoc - Target index within the destination part's locations.
 * @returns A new parts array with the location moved.
 */
export function moveLocation<P extends PartWithLocations<L>, L>(
    parts: readonly P[],
    fromPart: number,
    fromLoc: number,
    toPart: number,
    toLoc: number,
): P[] {
    const out = [...parts];
    const src = out[fromPart];
    const dest = out[toPart];
    if (
        !src ||
        !dest ||
        fromLoc < 0 ||
        fromLoc >= src.locations.length ||
        toPart < 0
    ) {
        return out;
    }

    if (fromPart === toPart) {
        const locations = [...src.locations];
        const [moved] = locations.splice(fromLoc, 1);
        const insertAt = Math.min(Math.max(toLoc, 0), locations.length);
        locations.splice(insertAt, 0, moved);
        out[fromPart] = { ...src, locations };
        return out;
    }

    const srcLocations = [...src.locations];
    const [moved] = srcLocations.splice(fromLoc, 1);
    const destLocations = [...dest.locations];
    const insertAt = Math.min(Math.max(toLoc, 0), destLocations.length);
    destLocations.splice(insertAt, 0, moved);
    out[fromPart] = { ...src, locations: srcLocations };
    out[toPart] = { ...dest, locations: destLocations };
    return out;
}

/**
 * Whether the part at `index` currently has any hit locations. Used to refuse a
 * part deletion while it still owns locations (the user must remove those first).
 *
 * @param parts - The parts array.
 * @param index - The zero-based part index.
 * @returns `true` when the part exists and has at least one location.
 */
export function partHasLocations(
    parts: readonly { locations?: readonly unknown[] }[],
    index: number,
): boolean {
    return (parts[index]?.locations?.length ?? 0) > 0;
}
