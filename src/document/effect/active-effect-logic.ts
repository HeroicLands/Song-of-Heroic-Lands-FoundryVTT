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
 * Returns the attribute shortcodes exposed by an item's Skill Base.
 *
 * Reads `item.logic.skillBase.attributes[*].data.shortcode` and returns
 * only non-empty string values.
 */
export function getItemAttributeShortcodes(item: {
    logic: unknown;
}): string[] {
    const attrs = (item.logic as any)?.skillBase?.attributes;
    if (!Array.isArray(attrs)) return [];
    return attrs
        .map((attr: unknown) => (attr as any)?.data?.shortcode)
        .filter(
            (sc: unknown): sc is string =>
                typeof sc === "string" && sc.length > 0,
        );
}

export interface ItemTargetParams<
    T extends { system: { shortcode: string }; logic: unknown },
> {
    targetName: string;
    typeItems: T[];
}

/**
 * Resolves which items match a given `targetName` from a list of `typeItems`.
 *
 * Matching rules:
 * - If `targetName` starts with `"attr:"`, matches against each item's
 *   Skill Base attribute shortcodes instead of `item.system.shortcode`.
 * - If the match value (after stripping `"attr:"`) is blank:
 *   - Default mode: returns all items.
 *   - Attribute mode: returns only items that expose at least one attribute shortcode.
 * - Otherwise, exact match is attempted first; on failure, the value is used
 *   as a regular expression. An invalid regex returns `[]`.
 */
export function resolveItemTargets<
    T extends { system: { shortcode: string }; logic: unknown },
>(params: ItemTargetParams<T>): T[] {
    const { targetName, typeItems } = params;

    const trimmed = targetName?.trim() ?? "";
    const isAttributeTarget = trimmed.startsWith("attr:");
    const matchName = isAttributeTarget ? trimmed.slice(5).trim() : trimmed;

    if (!matchName) {
        return isAttributeTarget ?
                typeItems.filter(
                    (item) => getItemAttributeShortcodes(item).length > 0,
                )
            :   typeItems;
    }

    const exactMatches = typeItems.filter((item) => {
        if (isAttributeTarget) {
            return getItemAttributeShortcodes(item).includes(matchName);
        }
        return item.system.shortcode === matchName;
    });
    if (exactMatches.length) return exactMatches;

    let regex: RegExp;
    try {
        regex = new RegExp(matchName);
    } catch {
        return [];
    }

    return typeItems.filter((item) => {
        if (isAttributeTarget) {
            return getItemAttributeShortcodes(item).some((sc) =>
                regex.test(sc),
            );
        }
        return regex.test(item.system.shortcode);
    });
}
