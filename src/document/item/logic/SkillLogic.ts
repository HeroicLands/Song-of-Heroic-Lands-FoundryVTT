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
import type { MysteryLogic } from "./MysteryLogic";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import { applyProneMeleePenalty } from "@src/entity/strikemode/prone";
import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import {
    ACTION_SUBTYPE,
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    SKILL_SUBTYPE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STATUS_EFFECT,
    STRIKE_MODE_TYPE,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    type SkillSubType,
} from "@src/utils/constants";
import { FilePath, toFilePath } from "@src/utils/helpers";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import type { SohlItem } from "../foundry/SohlItem";
import { SohlItemBaseLogic, type SohlItemData } from "./SohlItemBaseLogic";
import { runStrikeModeTest, type StrikeModeTestScope } from "./strikeModeTest";
import {
    fvttGetSetting,
    fvttIsCurrentUserGM,
    fvttActiveTokenLogicForActor,
    fvttActorStatuses,
} from "@src/core/FoundryHelpers";
import { AttributeLogic } from "./AttributeLogic";
import { getActorBody } from "@src/document/actor/logic/BodyLogic";
import { SohlAction } from "@src/entity/action/SohlAction";

/**
 * Returns the fate-test description table with labels/descriptions resolved from i18n.
 *
 * @returns Array of {@link sohl.entity.result.SuccessTestResult.LimitedDescription} entries covering
 *   all fate outcomes from "lose fate — no effect" through "permanent gain".
 */
export function getFateDescTable(): SuccessTestResult.LimitedDescription[] {
    const loc = (key: string) => sohl.i18n.localize(key);
    return [
        {
            maxValue: -1,
            label: loc("SOHL.Skill.FateDesc.loseFateNoEffect.label"),
            description: loc(
                "SOHL.Skill.FateDesc.loseFateNoEffect.description",
            ),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 0,
            label: loc("SOHL.Skill.FateDesc.noLossNoEffect.label"),
            description: loc("SOHL.Skill.FateDesc.noLossNoEffect.description"),
            lastDigits: [],
            success: false,
            result: 0,
        },
        {
            maxValue: 1,
            label: loc("SOHL.Skill.FateDesc.success.label"),
            description: loc("SOHL.Skill.FateDesc.success.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
        {
            maxValue: 999,
            label: loc("SOHL.Skill.FateDesc.critSuccess.label"),
            description: loc("SOHL.Skill.FateDesc.critSuccess.description"),
            lastDigits: [],
            success: true,
            result: 0,
        },
    ];
}

/**
 * A trained capability with a mastery level.
 *
 * Skills represent learned abilities that characters use to accomplish tasks:
 * combat techniques, social interactions, crafting, perception, and more.
 * Each skill has a **skill base formula** (typically derived from one or more
 * traits like Strength, Dexterity, or Aura) and a **mastery level** representing
 * training and experience.
 *
 * Skills are categorized by {@link SkillData.subType | subType} (e.g., combat,
 * social, physical) and may be associated with a **weapon group** or a
 * **mystery**. A skill can also reference a **base skill** from which
 * it derives or shares advancement.
 *
 * Skills are the primary mechanism for resolving actions in SoHL. When a
 * character attempts a task, the relevant skill's mastery level is tested
 * against a target number, with modifiers from traits, gear, conditions,
 * and situational factors.
 *
 * Mastery level progression, fate integration, and SDR improvement are built
 * on {@link sohl.entity.modifier.MasteryLevelModifier}.
 *
 * @typeParam TData - The Skill data interface.
 */
export class SkillLogic<
    TData extends SkillData = SkillData,
> extends SohlItemBaseLogic<TData> {
    /**
     * The parent (base) skill this skill specializes, resolved during
     * {@link evaluate} from {@link SkillData.parentSkillCode}, or `null` if
     * this skill has no parent.
     */
    parentSkill!: SkillLogic | null;

    /**
     * The number of mastery-level boosts applied to this skill. Each boost
     * raises the base mastery level by an amount that diminishes at higher
     * levels (see `calcMasteryBoost`).
     */
    boosts!: number;

    /**
     * The computed skill base value, derived by {@link calcSkillBase} from
     * {@link SkillData.skillBaseFormula} and resolved against the actor's
     * attributes and birthsign mysteries.
     */
    skillBase!: number;

    /**
     * The mastery level as a {@link sohl.entity.modifier.MasteryLevelModifier}, seeded from
     * {@link SkillData.masteryLevelBase}.
     */
    masteryLevel!: MasteryLevelModifier;

    /**
     * The fate mastery level as a {@link sohl.entity.modifier.MasteryLevelModifier}, used to resolve
     * {@link fateTest | fate tests}. Seeded from the actor's Aura attribute and
     * the `optionFate` setting; disabled when fate does not apply.
     */
    fateMasteryLevel!: MasteryLevelModifier;

    /**
     * The runtime strike-mode instance for a `combattechnique` skill, built in
     * {@link initialize} from {@link SkillData.strikeMode}. `undefined` for every
     * other skill subtype. Its attack/defense modifiers are driven by the
     * governing mastery level in {@link finalize} (this skill's own by default,
     * or an override skill named by the strike mode's `assocSkillCode`).
     */
    strikeMode?: StrikeModeBase;

    /**
     * The runtime strike modes for this skill: the single {@link strikeMode}
     * when this is a `combattechnique` skill, otherwise empty. Lets combat code
     * aggregate technique strike modes uniformly with weapon strike modes.
     * @returns The strike-mode instances (zero or one).
     */
    get strikeModes(): StrikeModeBase[] {
        return this.strikeMode ? [this.strikeMode] : [];
    }

    /**
     * Performs a fate test for this skill, consuming a charge from an
     * applicable Fate mystery on success.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns Resolves once the test and any charge consumption complete. No-op
     *   when {@link fateMasteryLevel} is disabled or no charged fate item is found.
     */
    async fateTest(context: SohlActionContext): Promise<void> {
        if (this.fateMasteryLevel.disabled) return;

        const fateItem = this.availableFate.find(
            (it) =>
                (it.logic as unknown as MysteryLogic).charges.value.effective >
                0,
        );
        if (!fateItem) return;

        const fateContext = new SohlActionContext({
            speaker: context.speaker,
            type: `${this.data.kind}-${this.name}-fate-test`,
            title: sohl.i18n.format("SOHL.MasteryLevel.fateTest.title", {
                label: this.label,
            }),
            scope: {
                situationalModifier: 0,
                targetValueFunc: (successLevel: number) => successLevel,
                successStarTable: getFateDescTable(),
            },
        });

        const result = await this.fateMasteryLevel.successTest(fateContext);

        if (result && result.isSuccess) {
            const updateData: PlainObject = {};
            updateData["system.charges.value"] = Math.max(
                (fateItem.system.charges?.value ?? 0) - 1,
                0,
            );
            void fateItem.update(updateData);
        }
    }

    /**
     * Recalculates the mastery level base using the roll formula stored in
     * `flags.sohl.rollFormula`. The formula is a standard Foundry VTT roll
     * expression where the variable `sb` is replaced with the skill base
     * value (always 0 for traits).
     *
     * If no roll formula flag is set, this method does nothing.
     */
    async recalculate(): Promise<void> {
        const rollFormula = this.data.getFlag("sohl", "rollFormula") as
            | string
            | undefined;
        if (!rollFormula) return;

        const sb = this._skillBaseForRoll;
        const resolved = rollFormula.replace(/\bsb\b/gi, String(sb));
        const roll = SimpleRoll.fromFormula(resolved, this);
        roll.roll();

        const updateData: PlainObject = {
            "system.masteryLevelBase": roll.total,
        };
        await this.data.update(updateData);
    }

    /**
     * The skill base value to substitute for `sb` in a roll formula.
     * Override in subclasses to provide a different value (e.g., traits
     * always return 0).
     */
    protected get _skillBaseForRoll(): number {
        return this.skillBase ?? 0;
    }

    /**
     * The magic modifier applied to this skill's fate mastery level. The base
     * implementation returns 0; subclasses may override to contribute a bonus.
     */
    get magicMod(): number {
        return 0;
    }

    /**
     * Searches through all of the Fate mysteries on the actor, gathering any that
     * are applicable to this skill, and returns them.
     *
     * @returns An array of Mystery fate items that apply to this skill.
     */
    get availableFate(): SohlItem[] {
        return [];
    }

    /**
     * Whether the skill may be improved: true when the current user is a GM or
     * owns the item and the mastery level is not disabled.
     */
    get canImprove() {
        return (
            (fvttIsCurrentUserGM() || this.data.isOwner) &&
            // `masteryLevel` is seeded in initialize(); guard against reading it
            // on a not-yet-initialized skill (e.g. the sheet rendering before the
            // actor's prepare completes) so this getter can't throw (#511 class).
            !this.masteryLevel?.disabled
        );
    }

    /**
     * Whether the skill's base formula is valid — i.e. it references at least
     * two attributes (the minimum for a skill base average).
     */
    get valid() {
        return skillBaseAttrShortcodes(this.data.skillBaseFormula).length >= 2;
    }

    /** The amount by which {@link improveWithSDR} raises the base mastery level on success. */
    get sdrIncr() {
        return 1;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Performs a success test against this skill's mastery level.
     *
     * Intrinsic-action executor for the `successTest` action; delegates to
     * {@link sohl.entity.modifier.MasteryLevelModifier.successTest}.
     *
     * @param context - The action context (speaker, scope) for the test.
     * @returns The test result, `null` if cancelled, or `false` on error.
     */
    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | undefined | false> {
        return this.masteryLevel.successTest(context);
    }

    /**
     * Perform an assisted attack with this combat technique's strike mode.
     *
     * Intrinsic-action executor for the `attackTest` action (combat techniques
     * only). Delegates to the shared {@link runStrikeModeTest}, which weapons use
     * too — a technique always has exactly one strike mode ({@link strikeModes}),
     * so it is auto-selected and never prompts.
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no strike mode could be resolved.
     */
    async attackTest(
        context: SohlActionContext<Partial<StrikeModeTestScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "attack", context);
    }

    /**
     * Perform an assisted block with this combat technique's strike mode.
     *
     * Intrinsic-action executor for the `blockTest` action (combat techniques
     * only). A block requested on a non-melee mode resolves to `false` (see
     * {@link runStrikeModeTest}).
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no melee strike mode could be resolved.
     */
    async blockTest(
        context: SohlActionContext<Partial<StrikeModeTestScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "block", context);
    }

    /**
     * Perform an assisted counterstrike with this combat technique's strike mode.
     *
     * Intrinsic-action executor for the `counterstrikeTest` action (combat
     * techniques only). A counterstrike requested on a non-melee mode resolves to
     * `false` (see {@link runStrikeModeTest}).
     * @param context - The action context; `scope.strikeModeId` selects the mode.
     * @returns The test result, `undefined` if the roll was cancelled, or `false`
     *   when no melee strike mode could be resolved.
     */
    async counterstrikeTest(
        context: SohlActionContext<Partial<StrikeModeTestScope>>,
    ): Promise<SuccessTestResult | undefined | false> {
        return runStrikeModeTest(this, "counterstrike", context);
    }

    /**
     * Begins an opposed test backed by this skill's mastery level.
     *
     * Intrinsic-action executor for the `opposedTestStart` action. Opposed tests
     * are token-based: this delegates into the actor's token logic
     * {@link sohl.document.token.logic.SohlTokenDocumentLogic.opposedTestStart}, passing this skill's
     * `logicUuid` as the source — exactly as the weapon/technique combat actions
     * delegate into the combatant.
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
     * Flags this skill for improvement via a Skill Development Roll.
     *
     * Intrinsic-action executor for the `setImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async setImproveFlag(_context: SohlActionContext): Promise<void> {
        if (!this.canImprove) return;
        const updateData: PlainObject = { "system.improveFlag": true };
        await this.data.update(updateData);
    }

    /**
     * Clears this skill's improvement flag.
     *
     * Intrinsic-action executor for the `unsetImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async unsetImproveFlag(_context: SohlActionContext): Promise<void> {
        if (!this.canImprove) return;
        const updateData: PlainObject = { "system.improveFlag": false };
        await this.data.update(updateData);
    }

    /**
     * Toggles this skill's improvement flag.
     *
     * Intrinsic-action executor for the `toggleImproveFlag` action.
     *
     * @param _context - The action context (unused).
     * @returns Resolves once the item update completes.
     */
    async toggleImproveFlag(_context: SohlActionContext): Promise<void> {
        if (!this.canImprove) return;
        if (this.data.improveFlag) {
            await this.unsetImproveFlag(_context);
        } else {
            await this.setImproveFlag(_context);
        }
    }

    /**
     * Attempts to improve the skill via a Skill Development Roll (SDR): rolls
     * `1d100 + skillBase` against the current base mastery level, and on a
     * success raises {@link SkillData.masteryLevelBase} by {@link sdrIncr}. The
     * outcome is posted to chat regardless.
     *
     * @param context - The action context whose speaker receives the chat card.
     * @returns Resolves once the roll is evaluated and the chat card is posted.
     */
    async improveWithSDR(context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": false };
        const roll = SimpleRoll.fromFormula(`1d100+${this.skillBase}`, this);
        roll.roll();
        const isSuccess = roll.total > this.masteryLevel.base;

        if (isSuccess) {
            updateData["system.masteryLevelBase"] =
                this.data.masteryLevelBase + this.sdrIncr;
        }
        const chatTemplate: FilePath = toFilePath(
            "systems/sohl/templates/chat/standard-test-card.hbs",
        );
        const chatTemplateData = {
            type: `${this.data.kind}-${this.name}-improve-sdr`,
            title: sohl.i18n.format("SOHL.MasteryLevel.improveSDR.title", {
                label: this.label,
            }),
            effTarget: this.masteryLevel.base,
            isSuccess: isSuccess,
            rollValue: roll.total,
            rollResult: roll.result,
            showResult: true,
            resultText:
                isSuccess ?
                    sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.increase.title",
                        {
                            label: this.label,
                        },
                    )
                :   sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.noIncrease.title",
                        {
                            label: this.label,
                        },
                    ),
            resultDesc:
                isSuccess ?
                    sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.increase.desc",
                        {
                            label: this.label,
                            incr: this.sdrIncr,
                            final: this.masteryLevel.base + this.sdrIncr,
                        },
                    )
                :   sohl.i18n.format(
                        "SOHL.MasteryLevel.improveSDR.noIncrease.desc",
                        {
                            label: this.label,
                            incr: this.sdrIncr,
                            final: this.masteryLevel.base + this.sdrIncr,
                        },
                    ),
            description:
                isSuccess ?
                    sohl.i18n.format("SOHL.TestResult.SUCCESS")
                :   sohl.i18n.format("SOHL.TestResult.FAILURE"),
            notes: "",
            sdrIncr: this.sdrIncr,
        };

        void context.speaker.toChat(chatTemplate, chatTemplateData);
    }

    /**
     * Define and return all intrinsic actions for skill logic.
     *
     * @returns The intrinsic action definitions, including those inherited from the base logic.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlItemBaseLogic.defineIntrinsicActions(),
            {
                shortcode: "successTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.successTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-bullseye-arrow",
                executor: "successTest",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "setImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.setImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-star",
                executor: "setImproveFlag",
                visible: "itemLogic.canImprove && !itemLogic.data.improveFlag",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "unsetImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.unsetImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-regular fa-star",
                executor: "unsetImproveFlag",
                visible: "itemLogic.canImprove && itemLogic.data.improveFlag",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "toggleImproveFlag",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.toggleImproveFlag",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-star-half-stroke",
                executor: "toggleImproveFlag",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "improveWithSDR",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.improveWithSDR",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-star",
                executor: "improveWithSDR",
                visible: "itemLogic.canImprove && !itemLogic.data.improveFlag",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "opposedTestStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.opposedTestStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass:
                    "fa-solid fa-arrow-down-left-and-arrow-up-right-to-center",
                executor: "opposedTestStart",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            // Combat-technique strike-mode tests. A combat technique is a skill
            // that carries its own single strike mode, so it exposes the same
            // attack/block/counterstrike actions as a weapon (shared executor via
            // runStrikeModeTest); gated to the combattechnique subtype. Block and
            // counterstrike no-op on a missile mode at runtime.
            {
                shortcode: "attackTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.attackTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-sword",
                executor: "attackTest",
                visible: "itemLogic.data.subType === 'combattechnique'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "blockTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.blockTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-shield",
                executor: "blockTest",
                visible: "itemLogic.data.subType === 'combattechnique'",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "counterstrikeTest",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Skill.Action.counterstrikeTest",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "fa-solid fa-circle-half-stroke",
                executor: "counterstrikeTest",
                visible: "itemLogic.data.subType === 'combattechnique'",
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
        this.parentSkill = null;
        this.boosts = 0;
        this.masteryLevel = new entity.MasteryLevelModifier(
            {},
            { parent: this },
        ).setBase(this.data.masteryLevelBase);
        this.fateMasteryLevel = new entity.MasteryLevelModifier(
            {
                testDescTable: getFateDescTable(),
                type: `${this.data.kind}-${this.name}-fate-test`,
                title: `${this.label} Fate Test`,
            },
            { parent: this },
        );

        // Calculate Fate Mastery Level
        const actorLogic = this.actorLogic;
        if (actorLogic) {
            const fateSetting = fvttGetSetting("sohl", "optionFate");

            const auraLogic = actorLogic.getItemLogic(
                "aur",
                ITEM_KIND.ATTRIBUTE,
            );
            if (auraLogic && !auraLogic.masteryLevel.disabled) {
                if (
                    fateSetting === "everyone" ||
                    (fateSetting === "pconly" && actorLogic.hasPlayerOwner)
                ) {
                    this.fateMasteryLevel.setBase(50);
                    this.fateMasteryLevel.add(
                        VALUE_DELTA_INFO.FATEBNS,
                        Math.trunc(auraLogic.masteryLevel.effective / 2),
                    );
                } else {
                    this.fateMasteryLevel.disabled =
                        "SOHL.MasteryLevel.FateDisabled";
                }
            } else {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.FateNotSupported";
            }
        }

        // Calculate Skill Base
        this.skillBase = calcSkillBase(
            this.data.skillBaseFormula,
            this.actorLogic,
        );

        // A combat-technique skill carries an embedded strike mode (a trained
        // maneuver such as an unarmed strike or grapple). Build the runtime
        // instance from the persisted data; its Atk/Blk/CX are wired to the
        // governing mastery level in `finalize`.
        const smData = this.data.strikeMode;
        if (this.data.subType === SKILL_SUBTYPE.COMBATTECHNIQUE && smData) {
            this.strikeMode =
                smData.type === STRIKE_MODE_TYPE.MELEE ?
                    new entity.MeleeStrikeMode(
                        smData as MeleeStrikeMode.Data,
                        this,
                        this.id,
                    )
                :   new entity.MissileStrikeMode(
                        smData as MissileStrikeMode.Data,
                        this,
                        this.id,
                    );
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.data.parentSkillCode) {
            // If this skill references a parent skill, find it and link it here so we can pull in its properties as needed
            const parentLogic = this.actorLogic?.getItemLogic(
                this.data.parentSkillCode,
                ITEM_KIND.SKILL,
            );
            if (parentLogic) {
                this.parentSkill = parentLogic;
            }
        }
        if (this.masteryLevel.base > 0) {
            let newML = this.masteryLevel.base;
            for (let i = 0; i < this.boosts; i++) {
                newML += calcMasteryBoost(newML);
            }
            this.masteryLevel.setBase(newML);
        }
        // Ensure base ML is not greater than MaxML
        if (this.masteryLevel.base > this.masteryLevel.maxTarget) {
            this.masteryLevel.setBase(this.masteryLevel.maxTarget);
        }
        if (
            skillBaseAttrShortcodes(this.data.skillBaseFormula).includes("aur")
        ) {
            // Any skill that has Aura in its SB formula cannot use fate
            this.fateMasteryLevel.disabled =
                "SOHL.MasteryLevel.AuraBasedNoFate";
        }

        // A melee technique's reach is its base length plus the wielder's body
        // reach (0 for a non-Being or incorporeal being) — mirrors weapon and
        // combat-technique reach handling.
        if (this.strikeMode instanceof MeleeStrikeMode) {
            const bodyReach =
                getActorBody(this.actorLogic)?.reach.effective ?? 0;
            this.strikeMode.reach.add("SOHL.INFO.Reach", "Size", bodyReach);
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
        if (this.masteryLevel.disabled) {
            this.fateMasteryLevel.disabled =
                VALUE_DELTA_ID[VALUE_DELTA_INFO.MLDSBL].name;
        }
        if (!this.fateMasteryLevel.disabled) {
            // Apply magic modifiers
            if (this.magicMod) {
                this.fateMasteryLevel.add(
                    VALUE_DELTA_INFO.MAGICMOD,
                    this.magicMod,
                );
            }
            if (!this.availableFate.length) {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.NoFateAvailable";
            }
        }

        // Drive a combat-technique strike mode's Atk/Blk/CX from its governing
        // mastery level: this skill's own by default, or an override skill named
        // by the strike mode's `assocSkillCode` (falling back to self if that
        // code resolves to nothing). `addVM({ includeBase: true })` folds in the
        // governing ML's base and its labeled deltas, so the technique's own
        // attack/defense modifiers layer on top with the full derivation intact.
        // A disabled governing ML disables the derived rolls (rendered as ✕).
        if (this.strikeMode) {
            const overrideCode = this.strikeMode.assocSkillCode;
            const governing =
                (overrideCode ?
                    (
                        this.actorLogic?.getItemLogic(
                            overrideCode,
                            ITEM_KIND.SKILL,
                        ) as SkillLogic | undefined
                    )?.masteryLevel
                :   undefined) ?? this.masteryLevel;

            const derived: MasteryLevelModifier[] = [this.strikeMode.attack];
            if (this.strikeMode instanceof MeleeStrikeMode) {
                derived.push(
                    this.strikeMode.defense.block,
                    this.strikeMode.defense.counterstrike,
                );
            }
            for (const mod of derived) {
                mod.addVM(governing, { includeBase: true });
                if (governing.disabled) mod.disabled = governing.disabled;
            }
            // A prone wielder suffers −20 to all melee attacks and defenses
            // (#562) — a combat technique carries its own strike mode, so apply
            // it here as WeaponGearLogic does for weapon strike modes.
            if (
                this.strikeMode instanceof MeleeStrikeMode &&
                !!this.actor &&
                fvttActorStatuses(this.actor).has(STATUS_EFFECT.PRONE)
            ) {
                applyProneMeleePenalty(this.strikeMode);
            }
        }
    }
}

/**
 * Calculates the mastery boost based on the given mastery level. Returns different boost values based on different ranges of mastery levels.
 *
 * @param ml - The current Mastery Level
 * @returns The calculated Mastery Boost
 */
/**
 * The attribute shortcodes referenced by a skill-base formula — its `@code`
 * terms, lowercased and stripped of any `:multiplier`. Used to validate a
 * formula (needs ≥ 2 attributes) and to detect Aura-based skills.
 *
 * @param skillBaseFormula - The skill's `skillBaseFormula` string.
 * @returns The referenced attribute shortcodes, in formula order.
 */
function skillBaseAttrShortcodes(skillBaseFormula: string): string[] {
    return (skillBaseFormula || "")
        .toLowerCase()
        .split(",")
        .map((term) => term.trim())
        .filter((term) => term.startsWith("@") && term.length > 1)
        .map((term) => term.slice(1).split(":")[0]);
}

/**
 * Computes a skill's **skill base** (SB) value from its formula, resolving
 * attribute references and birthsign bonuses against the owning actor.
 *
 * The formula is a comma-separated, case-insensitive list of terms:
 *
 * - `@code` — average in the actor's attribute with that shortcode; `@code:2`
 *   weights it ×2.
 * - `hirin:2` — add 2 if the actor has the `hirin` birthsign; `ahnu` adds 1.
 *   Birthsigns are Mystery items of subtype `buff`, matched by shortcode; only
 *   the single largest matching birthsign bonus applies.
 * - `5` — a flat numeric modifier.
 *
 * The attribute average rounds up when exactly two attributes are given and the
 * first (primary) exceeds the second, down when it does not, and to nearest
 * otherwise. The result is clamped to ≥ 0. A formula referencing fewer than two
 * attributes (or an absent formula/actor) yields 0.
 *
 * @param skillBaseFormula - The skill's `skillBaseFormula` string.
 * @param actorLogic - The owning actor's logic, source of attribute scores and
 *   birthsign mysteries; a falsy value yields 0.
 * @returns The computed skill base value (≥ 0).
 */
export function calcSkillBase(
    skillBaseFormula: string,
    actorLogic: SohlActorLogic<any> | null | undefined,
): number {
    if (!skillBaseFormula || !actorLogic) return 0;

    const attributes = actorLogic.logicTypes[ITEM_KIND.ATTRIBUTE];
    // Birthsigns are `buff`-subtype Mystery items; the shortcode is the token.
    const birthsigns = new Set(
        actorLogic.logicTypes[ITEM_KIND.MYSTERY]
            .filter((m) => m.data.subType === MYSTERY_SUBTYPE.BUFF)
            .map((m) => m.data.shortcode.toLowerCase()),
    );

    const attrScores: number[] = [];
    let birthsignBonus = 0;
    let modifier = 0;

    for (const raw of skillBaseFormula.toLowerCase().split(",")) {
        const term = raw.trim();
        if (!term) continue;

        if (term.startsWith("@")) {
            // Attribute reference: `@code`, optionally `@code:multiplier`.
            const [code, multRaw] = term.slice(1).split(":");
            if (!code) continue;
            const mult = multRaw ? Number.parseInt(multRaw, 10) || 1 : 1;
            const attr = attributes.find((a) => a.data.shortcode === code);
            attrScores.push((attr?.score.effective ?? 0) * mult);
            continue;
        }

        if (/^[-+]?\d+$/.test(term)) {
            // Flat numeric modifier.
            modifier += Number.parseInt(term, 10);
            continue;
        }

        // Birthsign term: `code` (adds 1) or `code:count`. Only the largest
        // matching birthsign bonus applies.
        const [code, countRaw] = term.split(":");
        const count = countRaw ? Number.parseInt(countRaw, 10) || 1 : 1;
        if (birthsigns.has(code)) {
            birthsignBonus = Math.max(birthsignBonus, count);
        }
    }

    // A valid skill base averages two or more attributes.
    if (attrScores.length < 2) return 0;

    const sum = attrScores.reduce((acc, score) => acc + score, 0);
    let average = sum / attrScores.length;
    if (attrScores.length === 2) {
        // Two-attribute rounding: up when the primary exceeds the secondary.
        average =
            attrScores[0] > attrScores[1] ?
                Math.ceil(average)
            :   Math.floor(average);
    } else {
        average = Math.round(average);
    }

    return Math.max(0, average + birthsignBonus + modifier);
}

/**
 * The mastery-level bonus applied at each ML tier for the base-skill calculation.
 *
 * @param ml - The mastery level (0–100+).
 * @returns The bonus to add: 10 at ML ≤ 39, decreasing to 3 at ML > 99.
 */
function calcMasteryBoost(ml: number): number {
    if (ml <= 39) return 10;
    else if (ml <= 44) return 9;
    else if (ml <= 49) return 8;
    else if (ml <= 59) return 7;
    else if (ml <= 69) return 6;
    else if (ml <= 79) return 5;
    else if (ml <= 99) return 4;
    else return 3;
}

/**
 * @remarks The shape of `system` on a `skill` item — i.e. `item.system` (equivalently `item.logic.data`) when `item.type === "skill"`. The backing DataModel implements this interface.
 */
export interface SkillData<
    TLogic extends SkillLogic<SkillData> = SkillLogic<any>,
> extends SohlItemData<TLogic> {
    /** Skill category (Combat, Social, Physical, etc.) */
    subType: SkillSubType;
    /** Formula for calculating the skill base from referenced traits */
    skillBaseFormula: string;
    /** Base mastery level representing training and experience */
    masteryLevelBase: number;
    /** Whether this item is flagged for mastery improvement via SDR */
    improveFlag: boolean;
    /** Combat category this skill applies to, if any */
    combatCategory: string;
    /** Name of the base skill if this is a specialization */
    parentSkillCode: string;
    /** Multiplier applied to skill base when initializing a new character */
    initSkillMult: number;
    /**
     * Optional embedded strike mode, present only for the `combattechnique`
     * subtype; `null` for all other skills.
     */
    strikeMode?: MeleeStrikeMode.Data | MissileStrikeMode.Data | null;
}
