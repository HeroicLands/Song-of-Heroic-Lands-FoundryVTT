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

import { entity } from "@src/entity/registry";
import type { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { MysteryLogic } from "./MysteryLogic";
import type { FateOutcome } from "./fate";
import {
    AURA_SHORTCODE,
    availableFateFor,
    buildFateMasteryLevel,
    performFateTest,
    postFateResultCard,
    type FateHost,
} from "./fate-host";
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
     * The attribute's score as a {@link sohl.entity.modifier.ValueModifier}, seeded from
     * {@link AttributeData.scoreBase}.
     */
    score!: ValueModifier;
    /**
     * Mastery level derived from this attribute, as a {@link sohl.entity.modifier.MasteryLevelModifier}.
     * Its base is set in {@link AttributeLogic.finalize | finalize} to the
     * effective {@link AttributeLogic.score | score} multiplied by five.
     */
    masteryLevel!: MasteryLevelModifier;
    /**
     * Fate-adjusted mastery level for this attribute, as a
     * {@link sohl.entity.modifier.MasteryLevelModifier}. Seeded in
     * {@link AttributeLogic.finalize | finalize} from the actor's Aura attribute,
     * exactly as a skill's is; disabled outright for the Aura attribute itself,
     * which can never be fated (#1106).
     */
    fateMasteryLevel!: MasteryLevelModifier;

    /**
     * The Fate Mysteries on the actor that may be spent on this attribute's
     * tests — a **general** Fate Point, or one associated with this attribute's
     * shortcode, that still has a charge (#1106).
     *
     * The rules allow Fate on _any_ skill or attribute test, so this is the same
     * eligibility set a skill exposes, evaluated against this attribute's
     * shortcode.
     *
     * @returns The eligible-and-charged Fate {@link MysteryLogic} instances
     *   (empty off an actor).
     */
    get availableFate(): MysteryLogic[] {
        return availableFateFor(this as unknown as FateHost);
    }

    /**
     * Spend Fate on this attribute's test — the shared post-roll bump flow
     * ({@link sohl.document.item.logic.performFateTest}); the die is never
     * re-rolled.
     *
     * Intrinsic-action executor for the `fateTest` action, triggered by the
     * player from the test card's Fate button or the attribute's Actions menu.
     *
     * @param context - The action context; `context.scope.priorTestResult` is
     *   the original result being fated.
     * @returns Resolves once the Fate test, any consumption, and the re-post
     *   complete.
     */
    async fateTest(
        context: SohlActionContext<Partial<SuccessTestResult.ContextScope>>,
    ): Promise<void> {
        return performFateTest(this as unknown as FateHost, context);
    }

    /**
     * Post the Fate result card for this attribute. Delegates to the shared
     * implementation; defined here so the card post is spy-able per logic type.
     *
     * @param fateResult - The evaluated Fate test result.
     * @param outcome - The resolved fate outcome.
     * @param spentSource - The Fate Mystery a point was consumed from, if any.
     * @returns Resolves once the card has been handed to the speaker.
     */
    async postFateResultCard(
        fateResult: SuccessTestResult,
        outcome: FateOutcome,
        spentSource: MysteryLogic | undefined,
    ): Promise<void> {
        return postFateResultCard(this as unknown as FateHost, fateResult, outcome, spentSource);
    }

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
    addValueDescUpdate(entry: { label: string; maxValue: number }): PlainObject {
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
            "system.valueDesc": this.data.valueDesc.filter((vd) => vd.label !== label),
        };
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Performs a success test against this attribute's mastery level.
     *
     * Intrinsic-action executor for the `successTest` action; delegates to
     * {@link sohl.entity.modifier.MasteryLevelModifier.successTest}. An
     * attribute's mastery level is its effective score × 5 (the "TL" shown on
     * the attribute card), so this rolls the attribute against its own target
     * level exactly the way {@link sohl.document.item.logic.SkillLogic.successTest}
     * rolls a skill.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The test result, `undefined` if cancelled, or `false` on error.
     */
    async successTest(context: SohlActionContext): Promise<SuccessTestResult | undefined | false> {
        return this.masteryLevel.successTest(context);
    }

    /**
     * Begins an opposed test backed by this attribute's mastery level.
     *
     * Intrinsic-action executor for the `opposedTestStart` action. Opposed tests
     * are token-based: this delegates into the actor's token logic
     * {@link sohl.document.token.logic.SohlTokenDocumentLogic.opposedTestStart}, passing this attribute's
     * `logicUuid` as the source — the same delegation the skill uses.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The opposed test result, or `null` if cancelled or unavailable.
     */
    async opposedTestStart(context: SohlActionContext): Promise<OpposedTestResult | null> {
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
                shortcode: "successTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.successTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-bullseye",
                executor: "successTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-arrows-to-dot",
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
        this.masteryLevel = new entity.MasteryLevelModifier({}, { parent: this });
        this.score = new entity.ValueModifier(this).setBase(this.data.scoreBase);
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        // Seed the mastery level here rather than in finalize: the score is
        // settled once Active Effects have applied, and every *other* item's
        // finalize may read this attribute's mastery level (the Aura attribute
        // governs every fate mastery level on the actor). Items finalize in
        // insertion order, so a value only written in finalize is not reliably
        // visible to a sibling finalizing before this one.
        this.masteryLevel.setBase(this.score.effective * 5);
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        // Fate is a finalize-phase concern: it derives from the actor's fully
        // evaluated Aura attribute. An Aura test can never itself be fated.
        this.fateMasteryLevel = buildFateMasteryLevel(
            this as unknown as FateHost,
            this.data.shortcode === AURA_SHORTCODE,
        );
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
    initDiceFormula: string | null;
    /** Body roles whose injury impairs this attribute */
    impairedByRoles: string[];
}
