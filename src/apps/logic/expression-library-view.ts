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

import type { HelperSource } from "@src/entity/expr/ExpressionHelperRegistry";

/**
 * Foundry-free view-model builder for the Expression Library settings menu
 * ({@link ExpressionLibraryMenu}): turn the persisted custom-helper library
 * into display rows. Pure — the app supplies the library map, the chosen file
 * path, and the built-in helper names.
 */

/** A custom-helper row for the settings list. */
export interface HelperRow {
    /** The helper name (as called from an expression). */
    name: string;
    /** A display signature, e.g. `addOne(n)` or `now()`. */
    signature: string;
}

/** The render context for the Expression Library menu. */
export interface ExpressionLibraryViewModel {
    /** The chosen library file path (empty when none is set). */
    path: string;
    /** Whether a file path has been chosen. */
    hasPath: boolean;
    /** The custom helpers currently loaded, sorted by name. */
    customHelpers: HelperRow[];
    /** Whether any custom helpers are loaded. */
    hasCustom: boolean;
    /** How many built-in helpers are always available. */
    builtinCount: number;
}

/**
 * Build the Expression Library view model: the chosen path plus a sorted list
 * of the world's custom helpers rendered as `name(arg1, arg2)` signatures.
 *
 * @param library - The persisted custom-helper map (name → {@link HelperSource}).
 * @param path - The chosen library file path (may be empty).
 * @param builtinNames - Names of the always-available built-in helpers.
 * @returns The template render context.
 */
export function buildExpressionLibraryViewModel(
    library: Record<string, HelperSource>,
    path: string,
    builtinNames: string[],
): ExpressionLibraryViewModel {
    const customHelpers: HelperRow[] = Object.entries(library ?? {})
        .map(([name, source]) => ({
            name,
            signature: `${name}(${(source?.args ?? []).join(", ")})`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return {
        path: path ?? "",
        hasPath: !!path,
        customHelpers,
        hasCustom: customHelpers.length > 0,
        builtinCount: builtinNames.length,
    };
}
