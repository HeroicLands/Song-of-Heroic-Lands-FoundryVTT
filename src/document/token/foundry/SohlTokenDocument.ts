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

import { dispatchChatCardAction } from "@src/document/chat/chat-card-dispatch";
import { getCanvas, fvttGetTargetedTokens } from "@src/core/FoundryHelpers";
import { fvttRangeToTarget } from "@src/core/FoundryHelpers";
import {
    SohlTokenDocumentLogic,
    type TokenData,
} from "@src/document/token/logic/SohlTokenDocumentLogic";

/**
 * A helper class for working with TokenDocument instances in the SoHL system.
 *
 * @internal The Foundry document layer is an implementation detail; author-facing
 * code reaches token state through the logic layer.
 */
export class SohlTokenDocument extends TokenDocument {
    /** Cached transient {@link sohl.document.token.logic.SohlTokenDocumentLogic} for this token. */
    private _sohlLogic: SohlTokenDocumentLogic | null = null;

    /**
     * This token's {@link sohl.document.token.logic.SohlTokenDocumentLogic}, built lazily over a transient
     * {@link sohl.core.logic.SohlLogicData} adapter. Tokens are not typed documents, so (unlike
     * actors/items/combatants) the logic is not created by `SohlDataModel`; the
     * adapter derives identity from the live token and resolves `actorLogic`
     * from `token.actor`. No SoHL state is persisted on the token.
     */
    get logic(): SohlTokenDocumentLogic {
        if (!this._sohlLogic) {
            const token = this;
            const data: TokenData = {
                parent: token,
                logic: null as any,
                id: token.id ?? "",
                name: token.name ?? "",
                type: "token",
                uuid: token.uuid,
                isOwner: token.isOwner,
                kind: "token",
                shortcode: "token",
                actionDefs: [],
                get actorLogic() {
                    return (token.actor as any)?.logic ?? null;
                },
                getFlag: (scope: string, key: string) =>
                    (token as any).getFlag(scope, key),
                setFlag: (scope: string, key: string, value: unknown) =>
                    (token as any).setFlag(scope, key, value),
                update: (d: object) => (token as any).update(d),
            } as TokenData;
            const logic = new SohlTokenDocumentLogic({}, { parent: data });
            data.logic = logic;
            this._sohlLogic = logic;
        }
        return this._sohlLogic;
    }

    /**
     * Dispatch a chat-card button click to this token's logic — the opposed-test
     * resume lives on {@link sohl.document.token.logic.SohlTokenDocumentLogic} as an intrinsic action, and
     * the opposed-request card's Respond button addresses the target token. The
     * button's dataset becomes the action's `scope`. Mirrors
     * {@link sohl.document.combatant.foundry.SohlCombatant.onChatCardButton}.
     * @param btn - The clicked chat-card button element.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        // Only an owner of this token (a GM owns all) may run a chat-card action
        // against it; the render-time gate is UX only and a direct or
        // synthesized call bypasses it (issue #167).
        if (!this.isOwner) return;
        await dispatchChatCardAction(this.logic, btn);
    }
    /**
     * Gets the user-targeted tokens.
     *
     * @remarks
     * Note that this is the **targeted** tokens, not the selected tokens.
     * Delegates to the {@link fvttGetTargetedTokens} shim so that
     * Foundry-free callers can use the same implementation.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The targeted token document(s), or `undefined` if failed.
     */
    static getTargetedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | undefined {
        return fvttGetTargetedTokens(single);
    }

    /**
     * Gets the user-selected tokens.
     *
     * @remarks
     * Note that this is the **selected** tokens, not the targeted tokens.
     *
     * @param single - Only return a single token if true, otherwise return an array of tokens.
     * @returns The selected token document(s), or `undefined` if failed.
     */
    static getSelectedTokens(
        single: boolean = false,
    ): SohlTokenDocument[] | undefined {
        let result: SohlTokenDocument[] | undefined = undefined;
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

                result = [selectedTokens[0].document as SohlTokenDocument];
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
     * @param gridUnits - Whether to return in grid units; defaults to false.
     * @returns The distance, or `undefined` if not calculable.
     */
    static rangeToTarget(
        sourceToken: SohlTokenDocument,
        targetToken: SohlTokenDocument,
        gridUnits: boolean = false,
    ): number | undefined {
        return fvttRangeToTarget(
            sourceToken.logic,
            targetToken.logic,
            gridUnits,
        );
    }
}
