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
    DEFEND_MISHAP,
    TEST_TYPE,
    VALUE_DELTA_INFO,
} from "@src/utils/constants";
import { SuccessTestResult } from "./SuccessTestResult";
import { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
import { StrikeModeBase } from "../strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "../strikemode/MeleeStrikeMode";
import { fvttLogicFromUuidSync } from "@src/core/FoundryHelpers";
import { registerKind } from "@src/utils/kindRegistry";

/**
 * The defender's side of a combat exchange — a {@link SuccessTestResult} with
 * defense-specific data.
 *
 * ## Key properties
 *
 * - `situationalModifier` — player-entered modifier from the
 *   defense dialog.
 *
 * ## Evaluation
 *
 * {@link evaluate} performs the defense roll (block, counterstrike, or
 * dodge), determines success/failure, and checks for defense-specific
 * mishaps (shield break, stumble, fumble). The defense success level
 * is then compared against the {@link AttackResult} in the containing
 * {@link CombatResult} to determine the final outcome.
 */
export class DefendResult extends SuccessTestResult {
    /**
     * Build a defense result, folding any player-entered situational modifier
     * into the mastery level as a `PLAYER` delta.
     *
     * @param data - Defense data; `data.situationalModifier` (the player-entered
     *   defense modifier) is added to the {@link masteryLevelModifier} as a
     *   `PLAYER` delta.
     * @param options - Result options; `options.parent` is required (base
     *   {@link TestResult}).
     * @throws If no `parent` is provided.
     */

    /** The label for this defense result (shown on card). */
    label: string;
    /** The strike mode used for this defense (only if block or counterstrike). */
    mode?: MeleeStrikeMode;
    /** The combatant logic for the defender. */
    combatant: SohlCombatantLogic;

    /**
     * Build a defense result, folding any player-entered situational modifier
     * into the mastery level as a `PLAYER` delta.
     *
     * @param data - Defense data; `data.situationalModifier` (the player-entered
     *   defense modifier) is added to the {@link masteryLevelModifier} as a
     *   `PLAYER` delta.
     * @param options - Result options; `options.parent` is required (base
     *   {@link TestResult}).
     * @throws If no `parent` is provided.
     */
    constructor(
        data: Partial<DefendResult.Data> = {},
        options: Partial<DefendResult.Options> = {},
    ) {
        super(data, options);
        if (!data.combatantUuid) {
            throw new Error(
                "DefendResult requires a combatant UUID (data.combatantUuid) to be provided.",
            );
        }

        this.label = data.label ?? "Defense";
        this.mode =
            data.mode ?
                (MeleeStrikeMode.fromPointerData(data.mode) as MeleeStrikeMode)
            :   undefined;
        const combatant = fvttLogicFromUuidSync<SohlCombatantLogic>(
            data.combatantUuid,
        );
        if (!combatant) {
            throw new Error(
                `DefendResult could not find combatant with UUID ${data.combatantUuid}.`,
            );
        }
        this.combatant = combatant;
        if (data.situationalModifier) {
            this.masteryLevelModifier.add(
                VALUE_DELTA_INFO.PLAYER,
                data.situationalModifier,
            );
        }
    }

    /**
     * Serialize to a plain object satisfying {@link DefendResult.Data}: the
     * inherited {@link SuccessTestResult} fields plus the combatant reference,
     * defense strike-mode pointer, and label.
     *
     * @remarks
     * The combatant is persisted by `combatantUuid`, and the defense strike mode
     * as its {@link StrikeModeBase.PointerData | pointer data} (rebuilt in the
     * constructor). `situationalModifier` is not emitted — it lives on the
     * serialized {@link masteryLevelModifier} as a `PLAYER` delta.
     * @returns The plain-object representation.
     */
    override toJSON(): PlainObject {
        return {
            ...super.toJSON(),
            combatantUuid: this.combatant.uuid,
            mode: this.mode?.pointerData,
            label: this.label,
        };
    }

    /**
     * Roll the defense (block or dodge) and apply
     * defense-specific mishaps on top of {@link SuccessTestResult.evaluate}.
     *
     * @remarks
     * On a failed roll: for block, a critical failure flags a
     * fumble (last digit 0) or stumble (last digit 5); for dodge, a critical
     * failure flags a stumble. The resolved success level is then compared
     * against the attack within the containing {@link CombatResult}.
     *
     * @returns `false` if the base evaluation disallows the result; otherwise
     *   `true`.
     */
    override async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (!this.isSuccess) {
            if (this.testType === TEST_TYPE.BLOCK.id) {
                if (this.isCritical && this.lastDigit === 0) {
                    this.mishaps.add(DEFEND_MISHAP.FUMBLE_TEST);
                }
                if (this.isCritical && this.lastDigit === 5) {
                    this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
                }
            } else if (this.testType === TEST_TYPE.DODGE.id) {
                if (this.isCritical && !this.isSuccess) {
                    this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
                }
            }
        }
        return true;
    }
}

export namespace DefendResult {
    /** Registry key identifying this result kind for serialization. */
    export const Kind: string = "DefendResult";

    /** Construction data for a {@link DefendResult}. */
    export interface Data extends SuccessTestResult.Data {
        /** The UUID of the combatant performing the defense. */
        combatantUuid: string;
        /** The strike mode used for this defense (only if block). */
        mode?: StrikeModeBase.PointerData;
        /** The label for this defense result (shown on card). */
        label: string;
        /** The player-entered situational modifier from the defense dialog. */
        situationalModifier: number;
    }

    export interface Options extends SuccessTestResult.Options {}

    /** Scope passed to actions that resume a prior defense. */
    export interface ContextScope {
        /** The defense being resumed, or `null` if none. */
        priorTestResult: DefendResult | null;
    }
}

registerKind(DefendResult.Kind, DefendResult);
