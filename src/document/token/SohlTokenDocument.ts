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

import {
    getCanvas,
    fvttGetTargetedTokens,
    fvttRangeToTarget,
} from "@src/core/FoundryHelpers";

/**
 * A helper class for working with TokenDocument instances in the SoHL system.
 */
export class SohlTokenDocument extends TokenDocument {
    /**
     * Gets the user-targeted tokens.
     *
     * @remarks
     * Note that this is the **targeted** tokens, not the selected tokens.
     * Delegates to the {@link fvttGetTargetedTokens} shim so that
     * Foundry-free callers can use the same implementation.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The targeted token document(s), or null if failed.
     */
    static getTargetedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | null {
        return fvttGetTargetedTokens(single);
    }

    /**
     * Gets the user-selected tokens.
     *
     * @remarks
     * Note that this is the **selected** tokens, not the targeted tokens.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The selected token document(s), or null if failed.
     */
    static getSelectedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | null {
        let result: SohlTokenDocument[] | null = null;
        const selectedTokens: Token[] | undefined =
            getCanvas().tokens?.controlled;
        if (!selectedTokens || selectedTokens.length === 0) {
            sohl.log.uiWarn(`No selected tokens on the canvas.`);
        } else {
            if (single) {
                if (selectedTokens.length > 1) {
                    sohl.log.uiWarn(
                        `Multiple tokens selected, please select only one token.`,
                    );
                }

                result = [selectedTokens[0].document];
            } else {
                result = selectedTokens.map(
                    (t) => t.document,
                ) as SohlTokenDocument[];
            }
        }
        return result;
    }

    /**
     * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
     *
     * @remarks
     * Delegates to the {@link fvttRangeToTarget} shim so that Foundry-free
     * callers can use the same implementation.
     *
     * @param sourceToken - The source token.
     * @param targetToken - The target token.
     * @param gridUnits=false - Whether to return in grid units.
     * @returns {number|null} The distance, or null if not calculable.
     */
    static rangeToTarget(
        sourceToken: SohlTokenDocument,
        targetToken: SohlTokenDocument,
        gridUnits: boolean = false,
    ): number | null {
        return fvttRangeToTarget(sourceToken, targetToken, gridUnits);
    }
}
