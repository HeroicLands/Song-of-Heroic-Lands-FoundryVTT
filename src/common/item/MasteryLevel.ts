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

import type { SohlEventContext } from "@common/event/SohlEventContext";
import type { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import type { Mystery } from "@common/item/Mystery";
import type { Trait } from "@common/item/Trait";
import { SohlItem, SohlItemDataModel } from "@common/item/SohlItem";
import { FilePath, isItemWithSubType, toFilePath } from "@utils/helpers";
import { ITEM_KIND, MYSTERY_SUBTYPE, TRAIT_INTENSITY } from "@utils/constants";
import { SkillBase } from "@common/SkillBase";
const { StringField, NumberField, BooleanField } = foundry.data.fields;

export abstract class MasteryLevel<
    TData extends MasteryLevel.Data = MasteryLevel.Data,
> extends SohlItem.BaseLogic<TData> {
    _boosts!: number;
    _skillBase!: SkillBase;
    masteryLevel!: MasteryLevelModifier;

    async improveWithSDR(context: SohlEventContext): Promise<void> {
        const updateData: PlainObject = { "system.improveFlag": false };
        let roll = await Roll.create(`1d100 + ${this.skillBase.value}`);
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
            title: `${this.label} Development Roll`,
            effTarget: this.masteryLevel.base,
            isSuccess: isSuccess,
            rollValue: roll.total,
            rollResult: roll.result,
            showResult: true,
            resultText:
                isSuccess ?
                    sohl.i18n.format("{prefix} Increase", {
                        prefix: this.label,
                    })
                :   sohl.i18n.format("No {prefix} Increase", {
                        prefix: this.label,
                    }),
            resultDesc:
                isSuccess ?
                    sohl.i18n.format("{label} increased by {incr} to {final}", {
                        label: this.label,
                        incr: this.sdrIncr,
                        final: this.masteryLevel.base + this.sdrIncr,
                    })
                :   "",
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
                    const itLogic: Mystery.Logic =
                        it.logic as unknown as Mystery.Logic;
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

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this._boosts = 0;
        this.masteryLevel = new sohl.CONFIG.MasteryLevelModifier(
            {},
            { parent: this },
        );
        this.masteryLevel.setBase(this.data.masteryLevelBase);
        if (this.actor) {
            const fateSetting = (game as any).settings.get(
                "sohl",
                "optionFate",
            );

            if (fateSetting === "everyone") {
                this.masteryLevel.fate.setBase(50);
            } else if (fateSetting === "pconly") {
                if (this.actor.hasPlayerOwner) {
                    this.masteryLevel.fate.setBase(50);
                } else {
                    this.masteryLevel.fate.disabled =
                        "SOHL.MasteryLevelModifier.NPCFateDisabled";
                }
            } else {
                this.masteryLevel.fate.disabled =
                    "SOHL.MasteryLevelModifier.FateNotSupported";
            }
        }
        this._skillBase ||= new SkillBase(this.data.skillBaseFormula, {
            items: Array.from(this.actor?.allItems.values() || []),
        });
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
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
            this.masteryLevel.fate.disabled =
                "SOHL.MasteryLevelModifier.AuraBasedNoFate";
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
        if (this.masteryLevel.disabled) {
            this.masteryLevel.fate.disabled = sohl.CONFIG.MOD.MLDSBL.name;
        }
        if (!this.masteryLevel.fate.disabled) {
            const fate = this.actor?.allItems.find(
                (it) =>
                    it.type === ITEM_KIND.TRAIT &&
                    (it.system as any).abbrev === "fate",
            );
            if (fate) {
                this.masteryLevel.fate.addVM((fate.logic as any).score, {
                    includeBase: true,
                });
            } else {
                this.masteryLevel.fate.setBase(50);
            }
            // Apply magic modifiers
            if (this.magicMod) {
                this.masteryLevel.fate.add(
                    sohl.CONFIG.MOD.MAGICMOD,
                    this.magicMod,
                );
            }
            this.fateBonusItems.forEach((it) => {
                this.masteryLevel.fate.add(
                    sohl.CONFIG.MOD.FATEBNS,
                    (it.logic as any).level.effective,
                    { skill: it.system.label },
                );
            });
            if (!this.availableFate.length) {
                this.masteryLevel.fate.disabled =
                    "SOHL.MasteryLevelModifier.NoFateAvailable";
            }
        }
    }
}

export namespace MasteryLevel {
    export interface Logic<TData extends MasteryLevel.Data = MasteryLevel.Data>
        extends SohlItem.Logic<TData> {
        masteryLevel: MasteryLevelModifier;
        magicMod: number;
        boosts: number;
        availableFate: SohlItem[];
        valid: boolean;
        skillBase: SkillBase;
        sdrIncr: number;
        improveWithSDR(context: SohlEventContext): Promise<void>;
    }

    export interface Data<
        TLogic extends MasteryLevel.Logic<Data> = MasteryLevel.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        abbrev: string;
        skillBaseFormula: string;
        masteryLevelBase: number;
        improveFlag: boolean;
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
    TLogic extends MasteryLevel.Logic<any> = MasteryLevel.Logic<any>,
> extends SohlItemDataModel<TSchema, TLogic> {
    abbrev!: string;
    skillBaseFormula!: string;
    masteryLevelBase!: number;
    improveFlag!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMasteryLevelSchema();
    }
}
