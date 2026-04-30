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

import type { TraitLogic } from "./TraitLogic";
import type { MysteryLogic } from "./MysteryLogic";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import { SkillBase } from "@src/domain/SkillBase";
import {
    ITEM_KIND,
    VALUE_DELTA_ID,
    VALUE_DELTA_INFO,
    type SkillSubType,
} from "@src/utils/constants";
import { FilePath, toFilePath } from "@src/utils/helpers";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { SohlItem, SohlItemBaseLogic, SohlItemData } from "../foundry/SohlItem";
import { fvttGetSetting, fvttIsCurrentUserGM } from "@src/core/FoundryHelpers";

// TODO: This needs to be internationalized
const FATE_DESC_TABLE: SuccessTestResult.LimitedDescription[] = [
    {
        maxValue: -1,
        label: "No Fate Effect",
        description: "No effect and character loses one Fate point.",
        lastDigits: [],
        success: false,
        result: 0,
    },
    {
        maxValue: 0,
        label: "No Fate Effect",
        description: "No effect, no Fate point loss.",
        lastDigits: [],
        success: false,
        result: 0,
    },
    {
        maxValue: 1,
        label: "Fate Test Success",
        description:
            "+1 success level to test and character loses 1 fate point.",
        lastDigits: [],
        success: true,
        result: 0,
    },
    {
        maxValue: 999,
        label: "Fate Test Critical Success",
        description:
            "Player's choice: +1 success level to test and no Fate point loss, or +2 success level to test and loss of 1 fate point.",
        lastDigits: [],
        success: true,
        result: 0,
    },
] as const;

/**
 * Logic for the **Skill** item type — a trained capability with a mastery level.
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
 * Inherits mastery level progression, fate integration, and SDR improvement
 * from {@link MasteryLevelLogic}.
 *
 * @typeParam TData - The Skill data interface.
 */
export class SkillLogic<
    TData extends SkillData = SkillData,
> extends SohlItemBaseLogic<TData> {
    _boosts!: number;
    _skillBase!: SkillBase;
    masteryLevel!: MasteryLevelModifier;
    fateMasteryLevel!: MasteryLevelModifier;

    async fateTest(context: SohlActionContext): Promise<void> {
        if (this.fateMasteryLevel.disabled) return;

        //TODO: Need to figure out which fate items to consume here
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
                successStarTable: FATE_DESC_TABLE,
            },
        });

        const result = await this.fateMasteryLevel.successTest(fateContext);

        if (result && result.isSuccess) {
            const updateData: PlainObject = {};
            updateData["system.charges.value"] = Math.max(
                fateItem.system.charges.value - 1,
                0,
            );
            fateItem.update(updateData);
        }
    }

    async improveWithSDR(context: SohlActionContext): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": false };
        const roll = SimpleRoll.fromFormula(`1d100+${this.skillBase.value}`);
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
                    //TODO: "{label} increased by {incr} to {final}"
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

        context.speaker.toChat(chatTemplate, chatTemplateData);
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
        const rollFormula = this.item.getFlag("sohl", "rollFormula") as
            | string
            | undefined;
        if (!rollFormula) return;

        const sb = this.skillBaseForRoll;
        const resolved = rollFormula.replace(/\bsb\b/gi, String(sb));
        const roll = SimpleRoll.fromFormula(resolved);
        roll.roll();

        const updateData: PlainObject = {
            "system.masteryLevelBase": roll.total,
        };
        await this.item.update(updateData);
    }

    /**
     * The skill base value to substitute for `sb` in a roll formula.
     * Override in subclasses to provide a different value (e.g., traits
     * always return 0).
     */
    protected get skillBaseForRoll(): number {
        return this.skillBase?.value ?? 0;
    }

    get magicMod(): number {
        return 0;
    }

    get boosts(): number {
        return this._boosts;
    }

    /**
     * Searches through all of the Fate mysteries on the actor, gathering any that
     * are applicable to this skill, and returns them.
     *
     * @returns An array of Mystery fate items that apply to this skill.
     */
    get availableFate(): SohlItem[] {
        let result: SohlItem[] = [];
        // TODO: Implement this properly
        // if (!this.masteryLevel.disabled && this.actor) {
        //     this.actor.allItems.forEach((it: SohlItem) => {
        //         if (it.type === ITEM_KIND.MYSTERY) {
        //             const itData: Mystery.Data =
        //                 it.system as unknown as Mystery.Data;
        //             if (itData.subType === MYSTERY_SUBTYPE.FATE) {
        //                 result.push(...itData.logic.applicableFate(this));
        //             }
        //         }
        //     });
        // }
        return result;
    }

    get canImprove() {
        return (
            (fvttIsCurrentUserGM() || this.item?.isOwner) &&
            !this.masteryLevel.disabled
        );
    }

    get valid() {
        return this.skillBase.valid;
    }

    get skillBase() {
        return this._skillBase;
    }

    get sdrIncr() {
        return 1;
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this._boosts = 0;
        this.masteryLevel = new MasteryLevelModifier({}, { parent: this });
        this.fateMasteryLevel = new MasteryLevelModifier(
            {
                testDescTable: FATE_DESC_TABLE,
                type: `${this.data.kind}-${this.name}-fate-test`,
                title: `${this.label} Fate Test`,
            },
            { parent: this },
        );
        this.masteryLevel.setBase(this.data.masteryLevelBase);

        // Calculate Fate Mastery Level
        if (this.actor) {
            const fateSetting = fvttGetSetting("sohl", "optionFate");

            const auraLogic = this.actor.items.find(
                (it) =>
                    it.type === ITEM_KIND.TRAIT &&
                    (it.system as any).shortcode === "aur",
            )?.logic as TraitLogic;
            if (!auraLogic.targetLevel.disabled) {
                if (
                    fateSetting === "everyone" ||
                    (fateSetting === "pconly" && this.actor.hasPlayerOwner)
                ) {
                    this.fateMasteryLevel.setBase(50);
                    this.fateMasteryLevel.add(
                        "AuraSecondaryModifier",
                        Math.trunc(auraLogic.targetLevel.effective / 2),
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
        this._skillBase ||= new SkillBase(this.data.skillBaseFormula, {
            items: Array.from(this.actor?.items.values() || []),
        });
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
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
            this.skillBase.attributes.some(
                (attr) => attr.data.shortcode === "aur",
            )
        ) {
            // Any skill that has Aura in its SB formula cannot use fate
            this.fateMasteryLevel.disabled =
                "SOHL.MasteryLevel.AuraBasedNoFate";
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
                    VALUE_DELTA_ID[VALUE_DELTA_INFO.MAGICMOD],
                    this.magicMod,
                );
            }
            if (!this.availableFate.length) {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.NoFateAvailable";
            }
        }
    }
}

/**
 * Calculates the mastery boost based on the given mastery level. Returns different boost values based on different ranges of mastery levels.
 *
 * @param ml The current Mastery Level
 * @returns The calculated Mastery Boost
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
    weaponGroup: string;
    /** Name of the base skill if this is a specialization */
    baseSkill: string;
    /** Fully-qualified Domain registry shortcode associated with this skill, if any. */
    domainCode: string;
    /** Multiplier applied to skill base when initializing a new character */
    initSkillMult: number;
    /** Parent skill name for expertise specializations */
    expertiseParentSkill: string;
}
