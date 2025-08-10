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
import { SohlLogic } from "@common/SohlLogic";
import type { SohlAction } from "@common/event/SohlAction";
import { SohlItem } from "@common/item/SohlItem";
import {
    kStrikeModeMixin,
    kStrikeModeMixinData,
    StrikeModeMixin,
} from "@common/item/StrikeModeMixin";
import { CombatModifier } from "@common/modifier/CombatModifier";
import { ImpactModifier } from "@common/modifier/ImpactModifier";
import { ValueModifier } from "@common/modifier/ValueModifier";
import { ImpactAspect, Variant } from "@utils/constants";
import { kSubTypeMixinData } from "./SubTypeMixin";

const kMeleeWeaponStrikeMode = Symbol("MeleeWeaponStrikeMode");
const kData = Symbol("MeleeWeaponStrikeMode.Data");
const { NumberField } = foundry.data.fields;

export class MeleeWeaponStrikeMode<
        TData extends MeleeWeaponStrikeMode.Data = MeleeWeaponStrikeMode.Data,
    >
    extends SohlLogic
    implements MeleeWeaponStrikeMode.Logic
{
    declare [kStrikeModeMixin]: true;
    declare traits: PlainObject;
    declare assocSkill?: SohlItem<SohlLogic, any> | undefined;
    declare impact: ImpactModifier;
    declare attack: CombatModifier;
    declare defense: { block: CombatModifier };
    declare durability: ValueModifier;
    declare readonly parent: MeleeWeaponStrikeMode.Data;
    readonly [kMeleeWeaponStrikeMode] = true;

    static isA(obj: unknown): obj is MeleeWeaponStrikeMode {
        return (
            typeof obj === "object" &&
            obj !== null &&
            kMeleeWeaponStrikeMode in obj
        );
    }

    override initialize(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace MeleeWeaponStrikeMode {
    export interface Logic extends StrikeModeMixin.Logic {
        readonly parent: MeleeWeaponStrikeMode.Data;
        readonly [kMeleeWeaponStrikeMode]: true;
    }

    export interface Data extends StrikeModeMixin.Data {
        readonly [kData]: true;
        readonly logic: Logic;
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
        static readonly LOCALIZATION_PREFIXES = ["MeleeWeaponStrikeMode"];
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
        declare _logic: Logic;
        lengthBase!: number;
        readonly [kData] = true;

        get logic(): Logic {
            this._logic ??= new MeleeWeaponStrikeMode(this);
            return this._logic;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
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
