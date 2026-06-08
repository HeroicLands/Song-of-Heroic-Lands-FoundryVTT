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

import { SohlItemBaseLogic, SohlItemData } from "../foundry/SohlItem";
import { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import { MissileStrikeMode } from "@src/domain/strikemode/MissileStrikeMode";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import {
    ACTION_SUBTYPE,
    defineType,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STRIKE_MODE_TYPE,
} from "@src/utils/constants";
import { SohlActionData } from "@src/domain/action/SohlAction";
import type { SohlActionContext } from "@src/core/SohlActionContext";
import type { CombatResult } from "@src/domain/result/CombatResult";
import { startAutomatedAttackFromItem } from "@src/document/actor/foundry/automated-combat";

/**
 * A specialized combat maneuver or fighting style not tied to a specific
 * weapon.
 *
 * Combat techniques represent trained maneuvers: grappling, disarming,
 * tripping, shield bashing, unarmed strikes, and other specialized
 * techniques. Unlike weapon-based strike modes, these belong directly
 * to a Being rather than being nested inside a weapon.
 *
 * Each combat technique has one or more {@link StrikeModeBase | strike modes}
 * (typically melee, but possibly missile for creature abilities like
 * tail-flung quills). Each strike mode carries its own attack, impact,
 * and defense modifiers.
 *
 * @typeParam TData - The CombatTechnique data interface.
 */
export class CombatTechniqueLogic<
    TData extends CombatTechniqueData = CombatTechniqueData,
> extends SohlItemBaseLogic<TData> {
    /** The runtime strike-mode instance, built from persisted data. */
    strikeMode!: StrikeModeBase;

    /* --------------------------------------------- */
    /* Combat Intrinsic Actions                            */
    /* --------------------------------------------- */

    /**
     * Present a dialog asking the player to select the appropriate strike mode
     * to use to begin automated combat, then delegate processing of the combat start to
     * the selected strike mode's item.
     */
    async automatedCombatStart(
        context: SohlActionContext<EmptyObject>,
    ): Promise<void> {
        await startAutomatedAttackFromItem(this, this.item?.name ?? "", context);
    }

    /**
     * Present a dialog asking the player to select a strike mode to block with to resume
     * the automated combat.
     *
     * @remarks
     * Any strike mode that has the noBlock trait should be filtered out of the choices.
     * The default value of the choices should be the most recently used strike mode that
     * does not have the noBlock trait. Otherwise, there is no default value.
     *
     * Once a strike mode is selected, delegate processing of the block resume to that
     * strike mode's item.
     *
     * One of `combatResult` or `attackResult` must be supplied in `context.scope`:
     * - `combatResult` is the prior automated resume result that is being reassessed
     * - `attackResult` is the result of the automated attack that initiated the automated resume
     *
     * @param [context.scope.priorTestResult] A prior opposed test result that is being retried.
     * @param [context.scope.attackResult] The test result that initiated the opposed test
     */
    async automatedBlockResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {}

    /**
     * Present a dialog asking the player to select a strike mode to use for the counterstrike
     * defense. The default should be the most recently used attack or counterstrike mode.
     *
     * @remarks
     * Any strike mode that has the noAttack trait should be filtered out of the choices.
     * The default value of the choices should be the most recently used strike mode that
     * does not have the noAttack trait. Otherwise, there is no default value.
     *
     * Once a strike mode is selected, delegate processing of the counterstrike
     * resume to that strike mode's item.
     *
     * One of `combatResult` or `attackResult` must be supplied in `context.scope`:
     * - `combatResult` is the prior automated resume result that is being reassessed
     * - `attackResult` is the result of the automated attack that initiated the automated resume
     *
     * @param [context.scope.priorTestResult] A prior opposed test result that is being retried.
     * @param [context.scope.attackResult] The test result that initiated the opposed test
     */
    async automatedCounterstrikeResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {}

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        const d = this.data.strikeMode;
        this.strikeMode =
            d.type === STRIKE_MODE_TYPE.MELEE ?
                new MeleeStrikeMode(d as MeleeStrikeMode.Data, this, this.id)
            :   new MissileStrikeMode(
                    d as MissileStrikeMode.Data,
                    this,
                    this.id,
                );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        // A melee technique's reach is its base length plus the wielder's
        // lineage reach (0 for a non-Being or no lineage).
        if (this.strikeMode instanceof MeleeStrikeMode) {
            const lineageReach =
                (
                    (this.actor?.itemTypes as any)?.[ITEM_KIND.LINEAGE]?.[0]
                        ?.logic as LineageLogic | undefined
                )?.reach.effective ?? 0;
            this.strikeMode.reach.add("SOHL.INFO.Reach", "Size", lineageReach);
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface CombatTechniqueData<
    TLogic extends CombatTechniqueLogic<CombatTechniqueData> =
        CombatTechniqueLogic<any>,
> extends SohlItemData<TLogic> {
    /**
     * The combat technique's grouping, such as "Karate", "Pugalistics", etc.
     * Used to group related techniques together.
     */
    group: string;

    /**
     * Persisted strike-mode payload — a discriminated union over melee /
     * missile shapes. The runtime domain instance (with modifier wrappers)
     * is obtained via `CombatTechniqueDataModel.strikeModeInstance`.
     */
    strikeMode: MeleeStrikeMode.Data | MissileStrikeMode.Data;
}

/**
 * The intrinsic actions available to CombatTechnique items.
 * This structure should correspond to the methods on the
 * CombatTechniqueLogic class that can be invoked as intrinsic actions.
 */
export const {
    /** Enum of intrinsic action keys for CombatTechnique items. */
    kind: COMBATTECHNIQUE_INTRINSIC_ACTION,
    /** The intrinsic action definitions keyed by action key. */
    values: CombatTechniqueIntrinsicActions,
    /** Type guard testing whether a value is a CombatTechnique intrinsic action key. */
    isValue: isCombatTechniqueIntrinsicAction,
    /** Localized labels for the CombatTechnique intrinsic actions. */
    labels: CombatTechniqueIntrinsicActionLabels,
} = defineType("SOHL.CombatTechnique.ACTION", {
    AUTOMATEDCOMBATSTART: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.CombatTechnique.ACTION.automatedCombatStart",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-swords",
        executor: "automatedCombatStart",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    AUTOMATEDBLOCKRESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.CombatTechnique.ACTION.automatedBlockResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-shield",
        executor: "automatedBlockResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },

    AUTOMATEDCOUNTERSTRIKERESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.CombatTechnique.ACTION.automatedCounterstrikeResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-circle-half-stroke",
        executor: "automatedCounterstrikeResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
} as StrictObject<Partial<SohlActionData>>);
