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

import { getCanvas } from "@common/FoundryProxy";

export class SohlTokenDocument extends TokenDocument {
    /**
     * Gets the user-targeted tokens.
     *
     * @remarks
     * Note that this is the **targeted** tokens, not the selected tokens.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The targeted token document(s), or null if failed.
     */
    static getTargetedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | null {
        let result: SohlTokenDocument[] | null = null;
        const targetTokens: Set<Token> = ((game as any).user as User)
            ?.targets as unknown as Set<Token>;

        if (!targetTokens || targetTokens.size === 0) {
            sohl.log.uiWarn(`No tokens targeted.`);
        } else {
            if (single) {
                if (targetTokens.size > 1) {
                    sohl.log.uiWarn(
                        `Multiple tokens targeted, please target only one token.`,
                    );
                }
                result = [targetTokens.values().next().value!.document];
            } else {
                result = Array.from(
                    targetTokens.map((t) => t.document),
                ) as SohlTokenDocument[];
            }
        }
        return result;
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
        if (!canvas.scene?.grid) {
            sohl.log.uiWarn(`No scene active`);
            return null;
        }
        if (!gridUnits && !["feet", "ft"].includes(canvas.scene.grid.units)) {
            sohl.log.uiWarn(
                `Scene uses units of ${canvas.scene.grid.units} but only feet are supported, distance calculation not possible`,
            );
            return 0;
        }

        if (
            foundry.utils.getProperty(
                (canvas.scene as any).flags,
                "sohl.isTotm",
            )
        )
            return 0;

        const result = getCanvas().grid?.measurePath(
            [
                (sourceToken as any).object.center,
                (targetToken as any).object.center,
            ],
            {},
        );

        if (!result) {
            sohl.log.uiWarn(
                `Could not calculate distance from ${sourceToken.id} to ${targetToken.id}`,
            );
            return null;
        }

        return gridUnits ? result.spaces : result.distance;
    }
}
