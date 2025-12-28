/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SohlActionContext } from "@common/SohlActionContext";
import type { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import type { MysteryLogic } from "@common/item/Mystery";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
} from "@common/item/SohlItem";
import { FilePath, isItemWithSubType, toFilePath } from "@utils/helpers";
import { ITEM_KIND, MYSTERY_SUBTYPE } from "@utils/constants";
import { SkillBase } from "@common/SkillBase";
import { TraitLogic } from "@common/item/Trait";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
const { StringField, NumberField, BooleanField } = foundry.data.fields;

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

export abstract class MasteryLevelLogic<
    TData extends MasteryLevelData = MasteryLevelData,
> extends SohlItemBaseLogic<TData> {
    _boosts!: number;
    _skillBase!: SkillBase;
    masteryLevel!: MasteryLevelModifier;
    fateMasteryLevel!: MasteryLevelModifier;

    async fateTest(context: SohlActionContext): Promise<void> {
        if (this.fateMasteryLevel.disabled) return;

        //TODO: Need to figure out which fate items to consume here
        // @ts-ignore - Ignore incorrect circular reference message
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
        let roll = await Roll.create(
            `1d100 + ${this.skillBase.value}`,
        ).evaluate();
        const isSuccess = (roll.total ?? 0) > this.masteryLevel.base;

        if (isSuccess) {
            updateData["system.masteryLevelBase"] =
                this.data.masteryLevelBase + this.sdrIncr;
        }
        const chatTemplate: FilePath = toFilePath(
            "systems/sohl/templates/chat/standard-test-card.html",
        );
        const chatTemplateData = {
            variant: sohl.id,
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

    get fateBonusItems(): SohlItem[] {
        let result: SohlItem[] = [];
        if (!this.item?.name) return result;

        if (this.actor) {
            this.actor.allItems.forEach((it: SohlItem) => {
                if (
                    it.type === ITEM_KIND.MYSTERY &&
                    isItemWithSubType(it, MYSTERY_SUBTYPE.FATEBONUS)
                ) {
                    const itLogic: MysteryLogic =
                        it.logic as unknown as MysteryLogic;
                    const skills = (it.system as any).skills;
                    if (!skills || skills.includes(this.item.name)) {
                        if (
                            !itLogic.charges.value.disabled ||
                            itLogic.charges.value.effective > 0
                        ) {
                            result.push(it);
                        }
                    }
                }
            });
        }
        return result;
    }

    get canImprove() {
        return (
            (((game as any).user as any)?.isGM || this.item?.isOwner) &&
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
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        this._boosts = 0;
        this.masteryLevel = new sohl.CONFIG.MasteryLevelModifier(
            {},
            { parent: this },
        );
        this.fateMasteryLevel = new sohl.CONFIG.MasteryLevelModifier(
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
            const fateSetting = (game as any).settings.get(
                "sohl",
                "optionFate",
            );

            const auraLogic = this.actor?.allItems.find(
                (it) =>
                    it.type === ITEM_KIND.TRAIT &&
                    (it.system as any).abbrev === "aur",
            )?.logic as TraitLogic;
            if (!auraLogic.masteryLevel.disabled) {
                if (
                    fateSetting === "everyone" ||
                    (fateSetting === "pconly" && this.actor.hasPlayerOwner)
                ) {
                    this.fateMasteryLevel.setBase(50);
                    this.fateMasteryLevel.add(
                        "AuraSecondaryModifier",
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
        this._skillBase ||= new SkillBase(this.data.skillBaseFormula, {
            items: Array.from(this.actor?.allItems.values() || []),
        });
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
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
        if (this.skillBase.attributes.includes("Aura")) {
            // Any skill that has Aura in its SB formula cannot use fate
            this.fateMasteryLevel.disabled =
                "SOHL.MasteryLevel.AuraBasedNoFate";
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
        if (this.masteryLevel.disabled) {
            this.fateMasteryLevel.disabled = sohl.CONFIG.MOD.MLDSBL.name;
        }
        if (!this.fateMasteryLevel.disabled) {
            // Apply magic modifiers
            if (this.magicMod) {
                this.fateMasteryLevel.add(
                    sohl.CONFIG.MOD.MAGICMOD,
                    this.magicMod,
                );
            }
            this.fateBonusItems.forEach((it) => {
                this.fateMasteryLevel.add(
                    sohl.CONFIG.MOD.FATEBNS,
                    (it.logic as any).level.effective,
                    { skill: it.system.label },
                );
            });
            if (!this.availableFate.length) {
                this.fateMasteryLevel.disabled =
                    "SOHL.MasteryLevel.NoFateAvailable";
            }
        }
    }
}

export interface MasteryLevelData<
    TLogic extends MasteryLevelLogic<MasteryLevelData> = MasteryLevelLogic<any>,
> extends SohlItemData<TLogic> {
    abbrev: string;
    skillBaseFormula: string;
    masteryLevelBase: number;
    improveFlag: boolean;
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

function defineMasteryLevelSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        abbrev: new StringField(),
        skillBaseFormula: new StringField(),
        masteryLevelBase: new NumberField({
            initial: 0,
            min: 0,
        }),
        improveFlag: new BooleanField({ initial: false }),
    };
}

type MasteryLevelSchema = ReturnType<typeof defineMasteryLevelSchema>;

export abstract class MasteryLevelDataModel<
    TSchema extends foundry.data.fields.DataSchema = MasteryLevelSchema,
    TLogic extends
        MasteryLevelLogic<MasteryLevelData> = MasteryLevelLogic<MasteryLevelData>,
> extends SohlItemDataModel<TSchema, TLogic> {
    abbrev!: string;
    skillBaseFormula!: string;
    masteryLevelBase!: number;
    improveFlag!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMasteryLevelSchema();
    }
}
