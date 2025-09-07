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

import type { SohlLogic } from "@common/SohlLogic";
import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import {
    kStrikeModeMixin,
    kStrikeModeMixinData,
    StrikeModeMixin,
} from "@common/item/StrikeModeMixin";
import { CombatModifier } from "@common/modifier/CombatModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import { defineType, ImpactAspect, ITEM_KIND, Variant } from "@utils/constants";
import { kSubTypeMixinData } from "./SubTypeMixin";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";

const kMeleeWeaponStrikeMode = Symbol("MeleeWeaponStrikeMode");
const kData = Symbol("MeleeWeaponStrikeMode.Data");
const { NumberField } = foundry.data.fields;

export class MeleeWeaponStrikeMode
    extends StrikeModeMixin(SohlItem.BaseLogic)
    implements MeleeWeaponStrikeMode.Logic
{
    declare [kStrikeModeMixin]: true;
    declare readonly parent: MeleeWeaponStrikeMode.Data;
    readonly [kMeleeWeaponStrikeMode] = true;
    defense!: {
        block: CombatModifier;
        counterstrike: CombatModifier;
    };
    length!: ValueModifier;

    static isA(obj: unknown): obj is MeleeWeaponStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kMeleeWeaponStrikeMode in obj
        );
    }

    async blockTest(
        context: SohlAction.Context,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.block.successTest(context)) || null;
    }

    async counterstrikeTest(
        context: SohlAction.Context,
    ): Promise<SuccessTestResult | null> {
        return (await this.defense.counterstrike.successTest(context)) || null;
    }

    /** @inheritdoc */
    override initialize(context: SohlAction.Context): void {
        super.initialize(context);
        this.defense = {
            block: new sohl.CONFIG.CombatModifier({}, { parent: this }),
            counterstrike: new sohl.CONFIG.CombatModifier({}, { parent: this }),
        };
        this.length = new sohl.CONFIG.ValueModifier({}, { parent: this });

        // Length is only set if this Strike Mode is nested in a WeaponGear
        if (this.item.nestedIn?.type === ITEM_KIND.WEAPONGEAR) {
            this.length.base = this.item.nestedIn.system.lengthBase;
        }
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {
        super.evaluate(context);
        if (this.assocSkill) {
            this.defense.block.addVM(this.assocSkill.system.masteryLevel, {
                includeBase: true,
            });
            this.defense.counterstrike.addVM(
                this.assocSkill.system.masteryLevel,
                { includeBase: true },
            );
        }

        const token = this.actor?.getActiveTokens().shift() as Token;
        const combatant = (token?.document as SohlTokenDocument).combatant;
        // If outnumbered, then add the outnumbered penalty to the defend "bonus" (in this case a penalty)
        if (combatant && !combatant.isDefeated) {
            const defendPenalty =
                Math.max(combatant.threatenedBy.length - 1, 0) * -10;
            if (defendPenalty) {
                this.defense.block.add(
                    sohl.CONFIG.MOD.OUTNUMBERED,
                    defendPenalty,
                );
                this.defense.counterstrike.add(
                    sohl.CONFIG.MOD.OUTNUMBERED,
                    defendPenalty,
                );
            }
        }
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {
        super.finalize(context);
    }
}

export namespace MeleeWeaponStrikeMode {
    export const {
        kind: EFFECT_KEY,
        values: EffectKey,
        isValue: isEffectKey,
        labels: EffectKeyLabels,
    } = defineType("SOHL.MeleeWeaponStrikeMode.EffectKey", {
        ...StrikeModeMixin.EFFECT_KEY,
        LENGTH: {
            name: "system.logic.length",
            abbrev: "Len",
        },
        BLOCK: {
            name: "system.logic.defense.block",
            abbrev: "Blk",
        },
        COUNTERSTRIKE: {
            name: "system.logic.defense.counterstrike",
            abbrev: "CX",
        },
    } as StrictObject<SohlLogic.EffectKeyData>);
    export type EffectKey = (typeof EFFECT_KEY)[keyof typeof EFFECT_KEY];

    export interface Logic extends StrikeModeMixin.Logic {
        readonly parent: MeleeWeaponStrikeMode.Data;
        readonly [kMeleeWeaponStrikeMode]: true;
    }

    export interface Data extends StrikeModeMixin.Data {
        readonly [kData]: true;
        lengthBase: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export class DataModel
        extends StrikeModeMixin.DataModel(SohlItem.DataModel)
        implements Data
    {
        static override readonly LOCALIZATION_PREFIXES = [
            "MeleeWeaponStrikeMode",
        ];
        declare readonly [kStrikeModeMixinData]: true;
        declare readonly [kSubTypeMixinData]: true;
        declare subType: Variant;
        declare mode: string;
        declare minParts: number;
        declare assocSkillName: string;
        declare impactBase: {
            numDice: number;
            die: number;
            modifier: number;
            aspect: ImpactAspect;
        };
        lengthBase!: number;
        readonly [kData] = true;

        static override defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                lengthBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
            };
        }
    }
}
