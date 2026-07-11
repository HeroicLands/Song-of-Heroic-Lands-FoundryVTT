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

import { entity } from "@src/entity/registry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { SohlAction } from "@src/entity/action/SohlAction";
import { fvttActiveTokenLogicForActor } from "@src/core/FoundryHelpers";
import {
    ACTION_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@src/utils/constants";

/**
 * An innate characteristic.
 *
 * Attributes represent intrinsic properties of a character that are not learned
 * through training: physical attributes (Strength, Stamina, Dexterity),
 * mental attributes (Intelligence, Aura, Will), physical features (Height,
 * Frame), and special qualities (Flaws, Virtues).
 *
 * Attributes are foundational to the SoHL system: they form the skill base
 * formulas for skills, contribute to derived values like health and
 * encumbrance, and serve as prerequisites for abilities and actions.
 *
 * @typeParam TData - The Attribute data interface.
 */
export class AttributeLogic<
    TData extends AttributeData = AttributeData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The attribute's score as a {@link ValueModifier}, seeded from
     * {@link AttributeData.scoreBase}.
     */
    score!: ValueModifier;
    /**
     * Mastery level derived from this attribute, as a {@link MasteryLevelModifier}.
     * Its base is set in {@link AttributeLogic.finalize | finalize} to the
     * effective {@link AttributeLogic.score | score} multiplied by five.
     */
    masteryLevel!: MasteryLevelModifier;
    /** Fate-adjusted mastery level for this attribute, as a {@link MasteryLevelModifier}. */
    fateMasteryLevel!: MasteryLevelModifier;

    /* --------------------------------------------- */
    /* Array update helpers                          */
    /* --------------------------------------------- */

    /**
     * Build an `update()` payload that adds a value description entry to
     * {@link AttributeData.valueDesc}.
     *
     * @param entry - The label/maxValue pair to append.
     * @param entry.label - The display label for the value-description band.
     * @param entry.maxValue - The upper bound this band applies up to.
     * @returns An `update()` payload writing the extended `system.valueDesc` array.
     */
    addValueDescUpdate(entry: {
        label: string;
        maxValue: number;
    }): PlainObject {
        return {
            "system.valueDesc": [...this.data.valueDesc, entry],
        };
    }

    /**
     * Build an `update()` payload that removes a value description from
     * {@link AttributeData.valueDesc} by its label.
     *
     * @param label - The label of the entry to remove.
     * @returns An `update()` payload writing `system.valueDesc` with the matching entry filtered out.
     */
    removeValueDescUpdate(label: string): PlainObject {
        return {
            "system.valueDesc": this.data.valueDesc.filter(
                (vd) => vd.label !== label,
            ),
        };
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Begins an opposed test backed by this attribute's mastery level.
     *
     * Intrinsic-action executor for the `opposedTestStart` action. Opposed tests
     * are token-based: this delegates into the actor's token logic
     * {@link SohlTokenDocumentLogic.opposedTestStart}, passing this attribute's
     * `logicUuid` as the source — the same delegation the skill uses.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The opposed test result, or `null` if cancelled or unavailable.
     */
    async opposedTestStart(
        context: SohlActionContext,
    ): Promise<OpposedTestResult | null> {
        const tokenLogic = fvttActiveTokenLogicForActor(this.actor);
        if (!tokenLogic) {
            sohl.log.uiWarn(
                `${this.name} cannot start an opposed test: its actor has no token on the canvas.`,
            );
            return null;
        }
        (context.scope as PlainObject).logicUuid = this.uuid;
        return tokenLogic.opposedTestStart(context);
    }

    /**
     * Define and return all intrinsic actions for this logic type.
     * @returns The attribute intrinsic-action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-confrontation",
                executor: "opposedTestStart",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.masteryLevel = new entity.MasteryLevelModifier(
            {},
            { parent: this },
        );
        this.score = new entity.ValueModifier(this).setBase(
            this.data.scoreBase,
        );
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        this.masteryLevel.setBase(this.score.effective * 5);
    }
}

/**
 * Persisted data backing {@link AttributeLogic}.
 *
 * @typeParam TLogic - The logic class that consumes this data.
 * @remarks The shape of `system` on a `attribute` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "attribute"`. The backing DataModel implements this interface.
 */
export interface AttributeData<
    TLogic extends AttributeLogic<AttributeData> = AttributeLogic<any>,
> extends SohlItemData<TLogic> {
    /** Base numeric value of the attribute */
    scoreBase: number;
    /** Labels mapping score ranges to descriptive names */
    valueDesc: {
        /** Descriptive name for this score band. */
        label: string;
        /** Highest score (inclusive) covered by this band. */
        maxValue: number;
    }[];
    /** Dice formula used for random generation of this attribute's score */
    initDiceFormula: string;
    /** Body roles whose injury impairs this attribute */
    impairedByRoles: string[];
}
